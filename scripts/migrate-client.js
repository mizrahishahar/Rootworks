#!/usr/bin/env node
// Rootworks client-base migration: legacy list tables -> Companies + People.
//
// One-time, watched, reversible. Unions every Domains-shaped legacy table into
// Companies (upsert on Domain) and every Contacts-shaped legacy table into People
// (upsert on Contact Key), links People to Companies by Domain, carries the email
// lanes, the Campaigns links, the campaign sync fields and the signal payload.
// With --link-live it also finishes an in-place conversion (a legacy Contacts table
// renamed to People, a Domains table renamed to Companies): live People rows get
// their Companies link by Domain, People-only domains get a Companies row, live
// Companies rows get Domain Source where the row itself carries the evidence.
// Never deletes or renames a legacy table. Never writes a formula, a lookup, a
// count, a rollup, Build Date, or any key the target table lacks.
//
// Usage:
//   node scripts/migrate-client.js --base appXXX                     dry run (default): read, plan, report, write nothing
//   node scripts/migrate-client.js --base appXXX --apply             perform the writes, record the undo log
//   node scripts/migrate-client.js --base appXXX --tables "A,B"      only these legacy tables (names or ids)
//   node scripts/migrate-client.js --base appXXX --link-live --tables none   the live rows only, no legacy table
//   node scripts/migrate-client.js --base appXXX --signal "US Tech - Infra Hiring (Intent)=recXXXX"
//   node scripts/migrate-client.js --undo scripts/out/migrate-appXXX-<ts>-undo.json          show what undo would do
//   node scripts/migrate-client.js --undo scripts/out/migrate-appXXX-<ts>-undo.json --apply  delete created, restore updated
//
// Options:
//   --base <appId>       the client base
//   --apply              write to Airtable (default is a dry run that writes nothing)
//   --tables <a,b>       legacy table names or ids, comma separated (default: every eligible table; "none" selects no table)
//   --link-live          also link live People to Companies by Domain (empty links only), create a Companies row per
//                        People-only domain (Domain, Company, Tag), backfill empty Domain Source from row evidence
//                        (a non-empty query_name or a Source naming DiscoLike, or Storeleads columns). Dry by default, same undo log
//   --signal <t=v>       map a legacy intent table to a Signals mirror row: "<legacy table name>=<rec id or mirror Name>" (repeatable)
//   --limit <n>          read at most n rows per legacy table; with --link-live also link and backfill at most n live rows each
//   --allow-loss         apply even when data-bearing keys would be dropped, a Campaigns id is unresolved, or a signal is unresolved
//   --dump-plan          also write every planned create and update to -plan.jsonl
//   --undo <file>        reverse a previous --apply run (dry by default; add --apply to execute)
//   --out <dir>          report directory (default scripts/out)
//
// Auth: AIRTABLE_API_KEY env var, else ~/.config/rootworks/airtable-token (one line),
//       else ~/.config/rootworks/airtable-api-key (the file hub-pull.js reads).
//       The PAT needs data.records:read, data.records:write and schema.bases:read on the client base.
//       The key never lives in this repo and is never printed.
//
// Outputs (scripts/out/, git-ignored by a .gitignore the script drops there):
//   migrate-<base>-<ts>.json          the report: plan counts, drops, invalid values, reconciliation, samples
//   migrate-<base>-<ts>-undo.jsonl    apply only: one line per written batch, appended as it goes (crash-safe)
//   migrate-<base>-<ts>-undo.json     apply only: the same log consolidated when the run ends
//   migrate-<base>-<ts>-plan.jsonl    with --dump-plan: every planned record
//   <undo file>-result.json           after --undo --apply

'use strict';

const fs = require('fs');
const path = require('path');

const API = 'https://api.airtable.com/v0';
const BATCH = 10;            // records per Airtable write request
const RPS = 5;               // Airtable's per-base ceiling
const CONCURRENCY = 4;       // requests in flight
const MAX_TRIES = 7;
const PROGRESS_EVERY = 500;
const SAMPLES_PER_TABLE = 3;
const INVALID_SAMPLE_CAP = 60;

// ------------------------------------------------------------------ CLI

function die(msg) { console.error(`error: ${msg}`); process.exit(1); }

function parseArgs(argv) {
  const o = { base: '', apply: false, tables: null, linkLive: false, signal: {}, limit: 0, allowLoss: false, dumpPlan: false, undo: '', out: '', help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => { const v = argv[++i]; if (v === undefined) die(`${a} needs a value`); return v; };
    if (a === '--base') o.base = next();
    else if (a === '--apply') o.apply = true;
    else if (a === '--tables') { const v = next(); o.tables = v.trim().toLowerCase() === 'none' ? [] : v.split(',').map((s) => s.trim()).filter(Boolean); }
    else if (a === '--link-live') o.linkLive = true;
    else if (a === '--signal') {
      const v = next(); const eq = v.indexOf('=');
      if (eq < 1) die('--signal expects "<legacy table name>=<rec id or mirror Name>"');
      o.signal[v.slice(0, eq).trim()] = v.slice(eq + 1).trim();
    }
    else if (a === '--limit') o.limit = Math.max(0, Number(next()) || 0);
    else if (a === '--allow-loss') o.allowLoss = true;
    else if (a === '--dump-plan') o.dumpPlan = true;
    else if (a === '--undo') o.undo = next();
    else if (a === '--out') o.out = next();
    else if (a === '--help' || a === '-h') o.help = true;
    else die(`unknown option ${a}`);
  }
  return o;
}

function usage() {
  const src = fs.readFileSync(__filename, 'utf8').split('\n');
  const lines = [];
  for (const l of src.slice(1)) { if (!l.startsWith('//')) break; lines.push(l.replace(/^\/\/ ?/, '')); }
  console.log(lines.join('\n'));
}

// ------------------------------------------------------------------ Auth

function apiKey() {
  if (process.env.AIRTABLE_API_KEY) return process.env.AIRTABLE_API_KEY.trim();
  const dir = path.join(process.env.HOME || '', '.config', 'rootworks');
  for (const name of ['airtable-token', 'airtable-api-key']) {
    try { const k = fs.readFileSync(path.join(dir, name), 'utf8').trim(); if (k) return k; } catch {}
  }
  die('No API key. Set AIRTABLE_API_KEY or write it to ~/.config/rootworks/airtable-token (one line)');
}

// ------------------------------------------------------------------ Airtable client

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const backoff = (attempt) => Math.min(30000, 1000 * 2 ** (attempt - 1)) + Math.floor(Math.random() * 250);

class Limiter {
  constructor(rps, concurrency) { this.rps = rps; this.conc = concurrency; this.stamps = []; this.active = 0; this.waiting = []; this.timer = null; }
  take() { return new Promise((resolve) => { this.waiting.push(resolve); this.pump(); }); }
  release() { this.active = Math.max(0, this.active - 1); this.pump(); }
  pump() {
    while (this.waiting.length && this.active < this.conc) {
      const now = Date.now();
      this.stamps = this.stamps.filter((t) => now - t < 1000);
      if (this.stamps.length >= this.rps) {
        if (!this.timer) this.timer = setTimeout(() => { this.timer = null; this.pump(); }, 1000 - (now - this.stamps[0]) + 5);
        return;
      }
      this.stamps.push(now); this.active++; this.waiting.shift()();
    }
  }
}

const limiter = new Limiter(RPS, CONCURRENCY);
const apiStats = { requests: 0, retries: 0, rateLimited: 0 };
let KEY = '';

async function request(method, url, body) {
  for (let attempt = 1; ; attempt++) {
    await limiter.take();
    let res; let text;
    try {
      apiStats.requests++;
      res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });
      text = await res.text();
    } catch (e) {
      limiter.release();
      if (attempt >= MAX_TRIES) throw new Error(`${method} ${url}: ${e.message} after ${attempt} tries`);
      apiStats.retries++; await sleep(backoff(attempt)); continue;
    }
    limiter.release();
    if (res.status === 429) {
      apiStats.rateLimited++; apiStats.retries++;
      if (attempt >= MAX_TRIES) throw new Error(`${method} ${url}: rate limited ${attempt} times`);
      await sleep(30000 + backoff(attempt));   // Airtable asks for a 30 s cool-off after a 429
      continue;
    }
    if (res.status >= 500) {
      if (attempt >= MAX_TRIES) throw new Error(`${method} ${url} -> HTTP ${res.status}: ${text.slice(0, 300)}`);
      apiStats.retries++; await sleep(backoff(attempt)); continue;
    }
    if (!res.ok) throw new Error(`${method} ${url} -> HTTP ${res.status}: ${text.slice(0, 500)}`);
    return text ? JSON.parse(text) : {};
  }
}

const tableUrl = (base, tableId) => `${API}/${base}/${encodeURIComponent(tableId)}`;

async function getMeta(base) {
  const j = await request('GET', `${API}/meta/bases/${base}/tables`);
  return j.tables || [];
}

// POST listRecords so a long field list never overflows the URL.
async function listAll(base, tableId, fields, { limit = 0, label = '' } = {}) {
  const out = []; let offset; let mark = 0;
  do {
    const body = { pageSize: 100, returnFieldsByFieldId: false };
    if (fields && fields.length) body.fields = fields;
    if (offset) body.offset = offset;
    const page = await request('POST', `${tableUrl(base, tableId)}/listRecords`, body);
    for (const r of page.records || []) { out.push(r); if (limit && out.length >= limit) break; }
    offset = page.offset;
    if (Math.floor(out.length / PROGRESS_EVERY) > mark) { mark = Math.floor(out.length / PROGRESS_EVERY); console.log(`  ${label}: ${out.length} rows read`); }
  } while (offset && !(limit && out.length >= limit));
  return out;
}

// No typecast on purpose: an unknown select value must fail loudly, never mint a new option.
async function createRecords(base, tableId, records) { return (await request('POST', tableUrl(base, tableId), { records })).records || []; }
async function updateRecords(base, tableId, records) { return (await request('PATCH', tableUrl(base, tableId), { records })).records || []; }
async function deleteRecords(base, tableId, ids) {
  const qs = ids.map((id) => `records[]=${encodeURIComponent(id)}`).join('&');
  return (await request('DELETE', `${tableUrl(base, tableId)}?${qs}`)).records || [];
}

// ------------------------------------------------------------------ Normalizers

// ---- Verbatim from n8n/Handle-Hiring-Intent-Signal/nodes/Build-Intent-Leads.js (the builders' key logic) ----
const titleCase=(s)=>String(s).replace(/\w\S*/g,t=>t.charAt(0).toUpperCase()+t.slice(1).toLowerCase());
const cleanFirst=(f)=>{if(!f)return'';let n=String(f).split(',')[0].trim().split(/\s+/)[0]||'';n=n.replace(/[^A-Za-z\-']/g,'');return n?n.charAt(0).toUpperCase()+n.slice(1).toLowerCase():'';};
const cleanLast=(f)=>{if(!f)return'';let p=String(f).split(',')[0].trim().split(/\s+/);if(p.length<2)return'';return titleCase(p.slice(1).join(' ').replace(/[^A-Za-z\-'\s]/g,'').trim());};
const contactKey=(first,last,d)=>(first.toLowerCase()+last.toLowerCase()+d).trim();
// ---- end verbatim ----

const isEmpty = (v) => v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0);
const short = (v) => String(Array.isArray(v) ? v.join(',') : v).slice(0, 40);
const bump = (obj, k, n = 1) => { obj[k] = (obj[k] || 0) + n; };

// Domain, the Companies key: lowercased and trimmed like the builders, with scheme, www. and path stripped.
function normDomain(v) {
  let s = String(v || '').trim().toLowerCase();
  s = s.replace(/^https?:\/\//, '').replace(/^www\./, '');
  s = s.split('/')[0].split('?')[0].split('#')[0].split(':')[0];
  return s.replace(/\.+$/, '').trim();
}

const BANDS = [[1, 10, '1-10'], [11, 50, '11-50'], [51, 200, '51-200'], [201, 500, '201-500'], [501, 1000, '501-1000'], [1001, 5000, '1001-5000'], [5001, 10000, '5001-10000'], [10001, Infinity, '10001+']];
const bandOf = (n) => { const b = BANDS.find(([lo, hi]) => n >= lo && n <= hi); return b ? b[2] : (n <= 0 ? null : '10001+'); };

// Legacy band spellings that fit a register band exactly (ruled 2026-09-02). "51 to 250" and "251 to 1,000" straddle
// two bands and stay invalid: the cell stays empty rather than mislabelled.
const EMPLOYEE_ALIAS = { '1 to 10': '1-10', '11 to 50': '11-50' };

// Accepts a band string ("11-50", "10,001+", "1 to 10") or a number (Storeleads). Returns null when it cannot band.
function bandEmployees(v) {
  if (isEmpty(v)) return null;
  if (typeof v === 'number') return bandOf(v);
  const spelled = String(v).trim().toLowerCase().replace(/\s+/g, ' ');
  if (EMPLOYEE_ALIAS[spelled]) return EMPLOYEE_ALIAS[spelled];
  const s = String(v).trim().replace(/[\u2013\u2014]/g, '-').replace(/[\s,]/g, '');
  const exact = BANDS.find((b) => b[2] === s); if (exact) return exact[2];
  const plus = s.match(/^(\d+)\+$/); if (plus) return bandOf(Number(plus[1]));
  if (/^\d+$/.test(s)) return bandOf(Number(s));
  return null;
}

// Legacy contact-source spellings -> the register's Contact Source choices.
const SOURCE_ALIAS = {
  contagen: 'ContaGen', discolike: 'ContaGen', 'disco like': 'ContaGen', 'discolike contacts': 'ContaGen',
  supersoniq: 'Supersoniq', 'super soniq': 'Supersoniq', sq: 'Supersoniq',
  'ai-ark': 'AI-Ark', aiark: 'AI-Ark', 'ai ark': 'AI-Ark', ark: 'AI-Ark',
};

// The legacy Source column is the email lane's source: P0..P3 or none. Anything else in it (the DiscoLike
// provenance string) is not a lane value and maps to nothing. Source never feeds Contact Source (ruled 2026-09-02).
const isLaneSource = (v) => /^(p[0-3]|none)$/i.test(String(v).trim());

const laterOf = (a, b) => {
  const ta = Date.parse(a), tb = Date.parse(b);
  if (Number.isNaN(ta)) return b; if (Number.isNaN(tb)) return a;
  return tb > ta ? b : a;
};
const union = (a, b) => { const out = []; const seen = new Set(); for (const x of [].concat(a || [], b || [])) { if (!seen.has(x)) { seen.add(x); out.push(x); } } return out; };
const sameValue = (a, b) => {
  if (Array.isArray(a) || Array.isArray(b)) { const x = [].concat(a || []).slice().sort(); const y = [].concat(b || []).slice().sort(); return x.length === y.length && x.every((v, i) => v === y[i]); }
  if (isEmpty(a) && isEmpty(b)) return true;
  return a === b;
};

// ------------------------------------------------------------------ The register (List Building 2.0)

const JOB_COLS = ['Job ID', 'Job Title', 'Job Link', 'Job Posted', 'Job Description', 'Job Seniority', 'Job Function', 'Job Employment Type', 'Job Industries', 'Job Applicants', 'Job Salary', 'Job Poster Name', 'Job Poster Title', 'Job Poster LinkedIn'];
const STORELEADS_COLS = ['Plan', 'Revenue Est Monthly', 'Store Age Years', 'Product Count', 'App Spend Mo', 'Key Apps', 'Tech Stack', 'Trustpilot Rating', 'Trustpilot Reviews', 'Migrated From', 'Social Followers', 'Growth 90d', 'Features'];
const REVIEWS_COLS = ['Review Count', 'Review Latest', 'Review Link', 'Review Titles', 'Review Quotes', 'Review Replied', 'Trustpilot Reviews Total', 'Trustpilot URL'];
const SYNC_COLS = ['Messages Sent', 'Last Contacted', 'Campaign Status', 'Bounce Reason', 'Synced At'];
const COMPANY_LANE = ['MV P0', 'BB', 'Final Email', 'Email Source', 'Status'];
const PEOPLE_LANE = ['Status', 'Final Email', 'MV P0', 'P1 (Trykitt)', 'MV P1', 'P2 (LeadMagic)', 'MV P2', 'P3 (Prospeo)', 'MV P3', 'BB'];

const same = (names, extra = {}) => names.map((n) => ({ to: n, from: [n], ...extra }));

// Companies: legacy column candidates per target field, first non-empty (first valid, for selects).
// shape:'domains' entries are read from Domains-shaped tables only; on a contact row those columns belong to the person.
const COMPANY_MAP = [
  { to: 'Company', from: ['Company', 'company_clean', 'Name'], nameOnDomainsOnly: true },
  ...same(['Description', 'Industry Groups', 'Business Model']),
  { to: 'Employees', from: ['Employees'], band: true },
  ...same(['Revenue Range', 'Keywords', 'Country']),
  { to: 'State', from: ['Company State', 'State'], companyPrefixed: 'Company State' },
  { to: 'City', from: ['Company City', 'City'], companyPrefixed: 'Company City' },
  ...same(['Street', 'Zip', 'Phones', 'Public Emails', 'Social URLs', 'public_emails_clean', 'MX Provider', 'Redirect Domain', 'State Full']),
  ...same(COMPANY_LANE.filter((n) => n !== 'Email Source'), { shape: 'domains', group: 'lane' }),
  { to: 'Email Source', from: ['Email Source', 'Source'], accept: { Source: isLaneSource }, shape: 'domains', group: 'lane' },
  { to: 'Campaigns', from: ['Campaigns'], shape: 'domains', links: true },
  ...same(SYNC_COLS, { shape: 'domains', group: 'sync' }),
  { to: 'Deploy Error', from: ['Deploy Error'], shape: 'domains', group: 'sync' },
  ...same(JOB_COLS, { group: 'signal' }),
  ...same(['Existing In Role', 'Email Pattern', 'ICP Reason'], { group: 'signal' }),
  { to: 'Signal At', from: ['detected_at', 'Signal At'], latest: true, group: 'signal' },
  ...same(STORELEADS_COLS, { group: 'storeleads' }),
  ...same(REVIEWS_COLS, { group: 'reviews' }),
];

// People: legacy column candidates per target field. Contact Source comes only from a legacy Contact Source
// column; Source is the email lane's source and reaches Email Source when it holds a lane value.
const PEOPLE_MAP = [
  ...same(['Title', 'Seniority', 'Department', 'Email']),
  { to: 'LinkedIn URL', from: ['LinkedIn URL', 'Social'] },
  { to: 'Phone', from: ['Phone'] },
  { to: 'Company', from: ['Company', 'company_clean'] },
  { to: 'Contact Source', from: ['Contact Source'], alias: SOURCE_ALIAS },
  { to: 'manually_approved', from: ['manually_approved'] },
  { to: 'Email Source', from: ['Email Source', 'Source'], accept: { Source: isLaneSource }, group: 'lane' },
  ...same(PEOPLE_LANE, { group: 'lane' }),
  { to: 'Campaigns', from: ['Campaigns'], links: true },
  ...same(SYNC_COLS, { group: 'sync' }),
  { to: 'Deploy Error', from: ['Deploy Error'], group: 'sync' },
];

// Register core, for the "what does the scaffold still lack" line of the report.
// Companies exactly as n8n/Onboard-Client/nodes/Scaffold-Register.js declares it: no State Full,
// no Email Source (the lane source is People's alone), and the count field is Contacts Count.
const REGISTER_CORE = {
  Companies: ['Domain', 'Company', 'Description', 'Industry Groups', 'Business Model', 'Employees', 'Revenue Range', 'Keywords', 'Country', 'State', 'City', 'Street', 'Zip', 'Phones', 'Public Emails', 'Social URLs', 'public_emails_clean', 'MX Provider', 'Redirect Domain', 'Domain Source', 'Tag', 'Build Date', 'Contacts Pulled At', 'Contacts Count', 'Contact Sources', 'Signals', 'Signal At', 'ICP Reason', ...COMPANY_LANE.filter((n) => n !== 'Email Source'), 'Campaigns', ...SYNC_COLS, 'Deploy Error'],
  People: ['Name', 'first_name', 'last_name', 'Title', 'Seniority', 'Department', 'Email', 'LinkedIn URL', 'Phone', 'Domain', 'Company', 'Companies', 'Contact Key', 'Contact Source', 'Source ID', 'Tag', 'Build Date', 'Email Source', ...PEOPLE_LANE, 'relevance', 'manually_approved', 'linkedin_name_match', 'Campaigns', ...SYNC_COLS, 'Deploy Error'],
};

const WRITABLE_TYPES = new Set(['singleLineText', 'multilineText', 'richText', 'email', 'url', 'phoneNumber', 'number', 'currency', 'percent', 'duration', 'rating', 'singleSelect', 'multipleSelects', 'checkbox', 'date', 'dateTime', 'multipleRecordLinks']);
// Never written even when writable: formulas by type, and these by name.
const NEVER_WRITE = { Companies: new Set(['Build Date', 'People', 'Contacts Pulled At']), People: new Set(['Build Date', 'Source ID']) };

// Ruled out of the register 2026-09-02: a non-empty legacy value in these columns is left behind on purpose.
// Counted under acceptedDrops, never a data-bearing drop that blocks apply. On person rows the company facts
// are accepted too: they arrive by lookup now (the company row may still take them as gap-fill).
const ACCEPTED_DROP_COLS = ['State Full', 'segment', 'query_name', 'ingested_at', 'Update Date', 'Start Date', 'Score', 'Similarity', 'company_clean', 'Run ID', 'Build Date', 'Connections', 'Seniority Rank', 'Verified', 'batch_id', 'icp_fit'];
const PERSON_COPY_COLS = ['City', 'State', 'Country', 'Zip', 'Street', 'Industry Groups', 'Employees', 'MX Provider', 'Description', 'Keywords', 'Business Model', 'Revenue Range'];
// People carries Company, Domain and Tag as lookups through the Companies link (the On People rule,
// Flowroots/Operations/Field Standard.md). A legacy value in one of them is not a loss: it arrives
// by lookup once the person is linked to its company row. Accepted like the ruled-out columns, so
// it never blocks apply, but counted and named on its own report line rather than among the losses.
// Its own set, not ACCEPTED_DROP_COLS, because the maps do read these columns: an accepted column
// no map reads is counted a second time, per row, by acceptedColsOf.
const LOOKUP_DROPS = { Companies: new Set(), People: new Set(['Company', 'Domain', 'Tag']) };
const ACCEPTED_DROPS = { Companies: new Set(ACCEPTED_DROP_COLS), People: new Set([...ACCEPTED_DROP_COLS, ...PERSON_COPY_COLS]) };
const fromNamesOf = (MAP) => new Set(MAP.flatMap((m) => m.from));

// ------------------------------------------------------------------ Schema indexing

function indexTarget(t, role) {
  const fields = new Map();
  for (const f of t.fields) {
    const entry = { name: f.name, type: f.type, options: f.options || {} };
    if (f.options && f.options.choices) entry.choiceIndex = new Map(f.options.choices.map((c) => [String(c.name).trim().toLowerCase(), c.name]));
    fields.set(f.name, entry);
  }
  const writable = new Set([...fields.values()].filter((f) => WRITABLE_TYPES.has(f.type) && !NEVER_WRITE[role].has(f.name)).map((f) => f.name));
  const primary = (t.fields.find((f) => f.id === t.primaryFieldId) || {}).name;
  const missingRegisterFields = REGISTER_CORE[role].filter((n) => !fields.has(n));
  return { id: t.id, name: t.name, role, fields, writable, primary, missingRegisterFields };
}

function shapeOf(t) {
  const names = new Set(t.fields.map((f) => f.name));
  if (names.has('Contact Key')) return 'contacts';
  if (names.has('Domain')) return 'domains';
  return null;
}

function domainSourceOf(legacy) {
  if (/\(intent\)/i.test(legacy.name)) return 'Signal';
  if (STORELEADS_COLS.some((c) => legacy.fieldSet.has(c))) return 'Storeleads';
  return 'DiscoLike';
}

const normName = (s) => String(s || '').toLowerCase().replace(/\(intent\)/g, '').replace(/[^a-z0-9]+/g, '');

function resolveSignal(legacy, signalRows, overrides) {
  const byId = new Map(signalRows.map((r) => [r.id, r]));
  const override = overrides[legacy.name] || overrides[Object.keys(overrides).find((k) => normName(k) === normName(legacy.name)) || ''];
  if (override) {
    if (byId.has(override)) return byId.get(override);
    const row = signalRows.find((r) => r.name === override || normName(r.name) === normName(override));
    if (row) return row;
    return { id: null, name: override, unresolvedOverride: true };
  }
  return signalRows.find((r) => r.targetTable === legacy.name || r.targetTable === legacy.id)
    || signalRows.find((r) => normName(r.name) === normName(legacy.name))
    || null;
}

// ------------------------------------------------------------------ Mapping

function coerce(raw, tf, m, ctx) {
  let v = raw;
  if (Array.isArray(v) && tf.type !== 'multipleRecordLinks' && tf.type !== 'multipleSelects') v = v.filter((x) => !isEmpty(x)).map(String).join(', ');
  switch (tf.type) {
    case 'multipleRecordLinks': {
      const ids = (Array.isArray(raw) ? raw : [raw]).map((x) => (x && x.id) || x).filter((x) => typeof x === 'string' && x.startsWith('rec'));
      const valid = ctx.validLinks[m.to];
      const keep = valid ? ids.filter((id) => valid.has(id)) : ids;
      const unresolved = ids.length - keep.length;
      if (!keep.length) return { ok: false, skip: true, unresolved };   // unresolved ids are reported on their own line, not as invalid values
      return { ok: true, value: keep, unresolved };
    }
    case 'multipleSelects': {
      const vals = (Array.isArray(raw) ? raw : String(raw).split(',')).map((s) => String(s).trim()).filter(Boolean);
      const keep = vals.map((s) => tf.choiceIndex.get(s.toLowerCase())).filter(Boolean);
      return keep.length ? { ok: true, value: keep } : { ok: false };
    }
    case 'singleSelect': {
      let s = String(v).trim();
      if (!s) return { ok: false, skip: true };
      if (m.band) { const b = bandEmployees(s); if (b === null) return { ok: false }; s = b; }
      if (m.alias) s = m.alias[s.toLowerCase()] || s;
      const choice = tf.choiceIndex.get(s.toLowerCase());
      return choice ? { ok: true, value: choice } : { ok: false };
    }
    case 'number': case 'currency': case 'percent': case 'duration': case 'rating': {
      const n = typeof v === 'number' ? v : Number(String(v).replace(/[,\s]/g, ''));
      return Number.isFinite(n) ? { ok: true, value: n } : { ok: false };
    }
    case 'checkbox':
      return (v === true || String(v).toLowerCase() === 'true') ? { ok: true, value: true } : { ok: false, skip: true };
    case 'date': case 'dateTime': {
      const s = String(v).trim();
      if (!s) return { ok: false, skip: true };
      return Number.isNaN(Date.parse(s)) ? { ok: false } : { ok: true, value: s };
    }
    default: {
      const s = typeof v === 'string' ? v.trim() : (v && typeof v === 'object' ? JSON.stringify(v) : String(v));
      return s ? { ok: true, value: s } : { ok: false, skip: true };
    }
  }
}

function newNotes() { return { dropped: {}, invalid: {}, unresolvedLinks: 0, carried: new Set() }; }

// Writes one target field from a raw value, honoring the target schema. Drops and invalids land in notes.
function assign(target, fields, notes, to, raw, m, ctx) {
  if (isEmpty(raw)) return;
  const tf = target.fields.get(to);
  if (!tf || !target.writable.has(to)) { bump(notes.dropped, to); return; }
  const c = coerce(raw, tf, m || { to }, ctx);
  if (c.unresolved) notes.unresolvedLinks += c.unresolved;
  if (!c.ok) { if (!c.skip) bump(notes.invalid, `${to}=${short(raw)}`); return; }
  fields[to] = c.value; notes.carried.add(to);
}

function mapRow(row, legacy, MAP, target, ctx) {
  const fields = {}; const notes = newNotes();
  for (const m of MAP) {
    if (m.shape && m.shape !== legacy.shape) continue;
    let from = m.from;
    if (m.companyPrefixed) from = legacy.fieldSet.has(m.companyPrefixed) ? [m.companyPrefixed] : from.filter((f) => f !== m.companyPrefixed);
    if (m.nameOnDomainsOnly && legacy.shape !== 'domains') from = from.filter((f) => f !== 'Name');
    from = from.filter((f) => legacy.fieldSet.has(f));
    if (!from.length) continue;
    const tf = target.fields.get(m.to);
    const writable = tf && target.writable.has(m.to);
    let firstRaw; let done = false;
    for (const f of from) {
      const raw = row[f]; if (isEmpty(raw)) continue;
      if (m.accept && m.accept[f] && !m.accept[f](raw)) continue;   // a value that means something else in this column (the provenance string in Source): not this key's, not invalid
      if (firstRaw === undefined) firstRaw = raw;
      if (!writable) break;
      const c = coerce(raw, tf, m, ctx);
      if (c.unresolved) notes.unresolvedLinks += c.unresolved;
      if (c.ok) { fields[m.to] = c.value; notes.carried.add(m.to); done = true; break; }
      if (c.skip) { done = true; break; }   // an empty-equivalent (false checkbox, blank), not an invalid
    }
    if (firstRaw === undefined) continue;
    if (!writable) { bump(notes.dropped, m.to); continue; }
    if (!done) bump(notes.invalid, `${m.to}=${short(firstRaw)}`);
  }
  return { fields, notes };
}

const tagOf = (row, legacy) => { const t = String(row.Tag || '').trim(); return t || legacy.name; };

// ------------------------------------------------------------------ Plan

function newPlanRow(id, live) {
  return { id: id || null, fields: live ? { ...live } : {}, live: live || null, touched: false, legacySources: 0, collisions: 0, tagCollision: false, action: null, write: null, domain: '' };
}

function mergeInto(row, fields) {
  const wasFed = row.legacySources > 0;
  row.touched = true; row.legacySources++;
  for (const [k, v] of Object.entries(fields)) {
    if (k === 'Campaigns' || k === 'Signals') row.fields[k] = union(row.fields[k], v);
    else if (k === 'Signal At') row.fields[k] = isEmpty(row.fields[k]) ? v : laterOf(row.fields[k], v);
    else if (isEmpty(row.fields[k])) row.fields[k] = v;
    else if (k === 'Tag' && row.fields[k] !== v) row.tagCollision = true;
  }
  return wasFed;
}

function foldNotes(legacy, notes, role) {
  for (const [k, n] of Object.entries(notes.dropped)) bump(legacy.droppedKeys[role], k, n);
  const inv = legacy.invalidValues[role];
  for (const [k, n] of Object.entries(notes.invalid)) { if (inv[k] !== undefined || Object.keys(inv).length < INVALID_SAMPLE_CAP) bump(inv, k, n); else legacy.invalidOverflow += n; }
  legacy.unresolvedCampaignIds += notes.unresolvedLinks;
  for (const k of notes.carried) legacy.carriedKeys[role].add(k);
}

function readFieldsFor(legacy, MAPS) {
  const want = new Set(['Domain', 'Name', 'first_name', 'last_name', 'Contact Key', 'Tag', 'detected_at', ...legacy.acceptedCols]);
  for (const MAP of MAPS) for (const m of MAP) for (const f of m.from) want.add(f);
  return [...want].filter((f) => legacy.fieldSet.has(f));
}

async function processLegacy(legacy, ctx) {
  const { base, opts, targets } = ctx;
  const maps = legacy.shape === 'domains' ? [COMPANY_MAP] : [PEOPLE_MAP, COMPANY_MAP];
  const rows = await listAll(base, legacy.id, readFieldsFor(legacy, maps), { limit: opts.limit, label: legacy.name });
  legacy.rowsRead = rows.length;
  for (const r of rows) {
    const f = r.fields || {};
    for (const c of legacy.acceptedCols) if (!isEmpty(f[c])) bump(legacy.acceptedDrops, c);   // left behind on purpose, counted
    const domain = normDomain(f.Domain);
    if (!isEmpty(f.Domain) && domain !== String(f.Domain).trim().toLowerCase()) legacy.domainNormalized++;

    if (legacy.shape === 'domains') {
      if (!domain) { legacy.noDomain++; continue; }
      const { fields, notes } = mapRow(f, legacy, COMPANY_MAP, targets.Companies, ctx);
      assign(targets.Companies, fields, notes, 'Domain', domain, null, ctx);
      assign(targets.Companies, fields, notes, 'Tag', tagOf(f, legacy), null, ctx);
      assign(targets.Companies, fields, notes, 'Domain Source', legacy.domainSource, null, ctx);
      if (legacy.signalId) assign(targets.Companies, fields, notes, 'Signals', [legacy.signalId], { to: 'Signals' }, ctx);
      foldNotes(legacy, notes, 'Companies');
      ctx.domainsIn.add(domain);
      let row = ctx.companies.get(domain);
      if (!row) { row = newPlanRow(null, null); row.domain = domain; ctx.companies.set(domain, row); legacy.companiesNew++; }
      else if (row.id && !row.legacySources) legacy.companiesMergedIntoLive++;
      if (mergeInto(row, fields)) { legacy.companiesCollisions++; row.collisions++; }
      if (legacy.samples.length < SAMPLES_PER_TABLE) legacy.samples.push({ recordId: r.id, target: 'Companies', key: domain, fields });
      continue;
    }

    // Contacts-shaped: the person, keyed exactly as the builders key it.
    // Some legacy Contacts tables hold the COMPANY name in Name (Dave's "Finance US 11-1000 -
    // Contacts": 20,606 of 20,727 rows), and the person only in first_name/last_name. Keying off
    // that Name collapses every contact at a company into one row and writes the company name into
    // People.Name. When Name equals the row's own Company or company_clean and the row carries a
    // first or last name, the built name wins, for the person's Name and for the key. Every other
    // row keeps the old order exactly, so live keys stay byte-identical on a re-run.
    const nameRaw = String(f.Name || '').trim();
    const builtName = [f.first_name, f.last_name].map((x) => String(x || '').trim()).filter(Boolean).join(' ');
    const companyish = [f.Company, f.company_clean].map((x) => String(x || '').trim().toLowerCase()).filter(Boolean);
    const nameIsCompany = !!nameRaw && !!builtName && companyish.includes(nameRaw.toLowerCase());
    if (nameIsCompany) legacy.nameWasCompany++;
    const full = (nameIsCompany ? builtName : nameRaw) || builtName;
    const first = cleanFirst(full); const last = cleanLast(full);
    let key = contactKey(first, last, domain);
    const legacyKey = String(f['Contact Key'] || '').trim();
    if (!key || !first) { key = legacyKey; if (key) legacy.keyFromLegacy++; }
    if (!key) { legacy.unkeyed++; if (legacy.unkeyedIds.length < 200) legacy.unkeyedIds.push(r.id); continue; }
    if (legacyKey && legacyKey !== key) legacy.keyDrift++;
    if (!domain) legacy.noDomain++;

    const { fields, notes } = mapRow(f, legacy, PEOPLE_MAP, targets.People, ctx);
    assign(targets.People, fields, notes, 'Name', full, null, ctx);
    assign(targets.People, fields, notes, 'first_name', String(f.first_name || '').trim() || first, null, ctx);
    assign(targets.People, fields, notes, 'last_name', String(f.last_name || '').trim() || last, null, ctx);
    assign(targets.People, fields, notes, 'Domain', domain, null, ctx);
    assign(targets.People, fields, notes, 'Contact Key', key, null, ctx);
    assign(targets.People, fields, notes, 'Tag', tagOf(f, legacy), null, ctx);
    foldNotes(legacy, notes, 'People');
    ctx.keysIn.add(key);
    let row = ctx.people.get(key) || null;
    if (!row && legacyKey && ctx.people.has(legacyKey)) { row = ctx.people.get(legacyKey); ctx.people.set(key, row); }   // alias, so a later row with the same rebuilt key lands here too
    if (!row) { row = newPlanRow(null, null); ctx.people.set(key, row); legacy.peopleNew++; }
    else if (row.id && !row.legacySources) legacy.peopleMergedIntoLive++;
    if (!row.domain) row.domain = domain;
    if (mergeInto(row, fields)) { legacy.peopleCollisions++; row.collisions++; }
    if (legacy.samples.length < SAMPLES_PER_TABLE) legacy.samples.push({ recordId: r.id, target: 'People', key, fields });

    // The company behind the contact: created when no Companies row exists, gap-filled when one does.
    if (domain) {
      const co = mapRow(f, legacy, COMPANY_MAP, targets.Companies, ctx);
      assign(targets.Companies, co.fields, co.notes, 'Domain', domain, null, ctx);
      assign(targets.Companies, co.fields, co.notes, 'Tag', legacy.name, null, ctx);
      assign(targets.Companies, co.fields, co.notes, 'Domain Source', legacy.domainSource, null, ctx);
      if (legacy.signalId) assign(targets.Companies, co.fields, co.notes, 'Signals', [legacy.signalId], { to: 'Signals' }, ctx);
      foldNotes(legacy, co.notes, 'Companies');
      ctx.domainsIn.add(domain);
      let crow = ctx.companies.get(domain);
      if (!crow) { crow = newPlanRow(null, null); crow.domain = domain; ctx.companies.set(domain, crow); legacy.companiesSeededFromContacts++; }
      else legacy.companiesTouchedFromContacts++;
      mergeInto(crow, co.fields);
    }
  }
}

function finalizePlan(ctx) {
  const tally = { Companies: { create: 0, update: 0, unchanged: 0, existingMatched: 0, collisions: 0, tagCollisions: 0 }, People: { create: 0, update: 0, unchanged: 0, existingMatched: 0, collisions: 0, tagCollisions: 0, withoutCompaniesRow: 0 } };
  const decide = (row, t) => {
    if (!row.touched) { row.action = 'skip'; return; }
    const fed = row.legacySources > 0;   // rows touched only by --link-live are tallied under linkLive, not here
    if (fed) { if (row.id) t.existingMatched++; t.collisions += row.collisions; if (row.tagCollision) t.tagCollisions++; }
    if (!row.id) { row.action = 'create'; row.write = { ...row.fields }; if (fed) t.create++; return; }
    const w = {};
    for (const [k, v] of Object.entries(row.fields)) if (!sameValue(v, row.live[k])) w[k] = v;
    row.write = w; row.action = Object.keys(w).length ? 'update' : 'unchanged'; if (fed) t[row.action]++;
  };
  for (const row of ctx.companies.values()) decide(row, tally.Companies);
  for (const row of new Set(ctx.people.values())) {   // a Set: aliased keys share one row
    if (row.touched && isEmpty(row.fields.Companies)) {
      const co = row.domain ? ctx.companies.get(row.domain) : null;
      if (co && ctx.targets.People.writable.has('Companies')) row.fields.Companies = co.id ? [co.id] : [`@new:${row.domain}`];
      else tally.People.withoutCompaniesRow++;
    }
    decide(row, tally.People);
  }
  return tally;
}

// ------------------------------------------------------------------ Link live (--link-live)

// The in-place conversion leaves every People.Companies link empty and every Companies.Domain Source
// empty. This plans the live rows before the legacy tables, so a row's own evidence outranks what a
// legacy table would infer for it, and so legacy rows merge into the Companies rows created here
// instead of creating their own. Same plan rows, same writer, same undo log as the legacy path.
// DiscoLike: a non-empty query_name (only the DiscoLike builder ever wrote it, ruled 2026-09-02) or a Source naming DiscoLike.
const DOMAIN_SOURCE_EVIDENCE = { DiscoLike: ['Source', 'query_name'], Storeleads: ['Plan', 'Store Age Years', 'Key Apps'] };
const LINK_LIVE_READ = { Companies: ['Domain', 'Domain Source', ...DOMAIN_SOURCE_EVIDENCE.DiscoLike, ...DOMAIN_SOURCE_EVIDENCE.Storeleads], People: ['Contact Key', 'Domain', 'Company', 'Tag', 'Companies'] };

const asText = (v) => (Array.isArray(v) ? v : [v]).map((x) => (x && typeof x === 'object' ? JSON.stringify(x) : String(x === undefined || x === null ? '' : x))).join(' ');
const namesDiscoLike = (v) => /disco\s*-?\s*like/i.test(asText(v));

function newLinkLive() {
  return {
    people: { liveRows: 0, alreadyLinked: 0, newlyLinked: 0, linkedToLive: 0, linkedToCreated: 0, domainless: 0, unkeyed: 0, duplicateKeys: 0, beyondLimit: 0 },
    companies: { liveRows: 0, domainless: 0, duplicateDomains: 0, created: 0, createdDomains: [], droppedKeys: {} },
    domainSource: { fieldWritable: false, evidenceColumns: {}, evidenceHits: {}, backfilled: {}, alreadyFilled: 0, leftEmpty: { noEvidence: 0, choiceMissing: {}, fieldUnwritable: 0, beyondLimit: 0 }, unrecognizedSourceValues: {}, unrecognizedOverflow: 0 },
    written: null,
  };
}

// Every live row gets a plan row: the seeded one when the key names it, else one of its own under
// "@id:<rec>" (a row with no key, or the second live row on a key the seeding already took).
function livePlanRow(map, key, r, domain) {
  let row = key ? map.get(key) : null;
  if (row && row.id === r.id) return { row, seeded: true };
  const alt = `@id:${r.id}`;
  row = map.get(alt);
  if (!row) { row = newPlanRow(r.id, r.fields || {}); row.domain = domain; map.set(alt, row); }
  return { row, seeded: false };
}

function planLinkLive(ctx, liveC, liveP) {
  const { targets, opts } = ctx;
  const ll = newLinkLive(); ctx.linkLive = ll;
  const limit = opts.limit || 0;

  const coLink = targets.People.fields.get('Companies');
  if (!coLink || coLink.type !== 'multipleRecordLinks' || !targets.People.writable.has('Companies')) die('--link-live: People has no writable Companies link field');
  if (coLink.options.linkedTableId && coLink.options.linkedTableId !== targets.Companies.id) die(`--link-live: People.Companies links to table ${coLink.options.linkedTableId}, not to Companies (${targets.Companies.id})`);
  if (!targets.People.fields.has('Domain')) die('--link-live: People has no Domain field to link by');

  // 1. Domain Source on live Companies rows, from the evidence the row itself carries. Empty cells only.
  const ds = ll.domainSource;
  const dsField = targets.Companies.fields.get('Domain Source');
  ds.fieldWritable = !!dsField && dsField.type === 'singleSelect' && !!dsField.choiceIndex && targets.Companies.writable.has('Domain Source');
  const evidence = {}; for (const [value, cols] of Object.entries(DOMAIN_SOURCE_EVIDENCE)) evidence[value] = cols.filter((c) => targets.Companies.fields.has(c));
  ds.evidenceColumns = evidence;
  ll.companies.liveRows = liveC.length;
  let backfills = 0;
  for (const r of liveC) {
    const f = r.fields || {};
    const domain = normDomain(f.Domain);
    const { row, seeded } = livePlanRow(ctx.companies, domain, r, domain);
    if (!domain) ll.companies.domainless++; else if (!seeded) ll.companies.duplicateDomains++;
    if (!isEmpty(f['Domain Source'])) { ds.alreadyFilled++; continue; }
    const named = evidence.DiscoLike.filter((c) => !isEmpty(f[c]));
    const discoCol = named.find((c) => c === 'query_name' || namesDiscoLike(f[c]));
    const storeCol = evidence.Storeleads.find((c) => !isEmpty(f[c]));
    const want = discoCol ? 'DiscoLike' : (storeCol ? 'Storeleads' : null);
    if (!want) {
      ds.leftEmpty.noEvidence++;
      for (const c of named) { const k = `${c}=${asText(f[c]).slice(0, 40)}`; if (ds.unrecognizedSourceValues[k] !== undefined || Object.keys(ds.unrecognizedSourceValues).length < INVALID_SAMPLE_CAP) bump(ds.unrecognizedSourceValues, k); else ds.unrecognizedOverflow++; }
      continue;
    }
    if (!ds.fieldWritable) { ds.leftEmpty.fieldUnwritable++; continue; }
    const choice = dsField.choiceIndex.get(want.toLowerCase());
    if (!choice) { bump(ds.leftEmpty.choiceMissing, want); continue; }   // never minted: the select must already carry the value
    if (limit && backfills >= limit) { ds.leftEmpty.beyondLimit++; continue; }
    row.fields['Domain Source'] = choice; row.touched = true; row.linkLive = true; backfills++;
    bump(ds.backfilled, choice); bump(ds.evidenceHits, discoCol || storeCol);
  }

  // 2. Live People -> Companies by normalized Domain, empty links only; a Companies row per domain People carry alone.
  ll.people.liveRows = liveP.length;
  let links = 0;
  for (const r of liveP) {
    const f = r.fields || {};
    const domain = normDomain(f.Domain);
    const key = String(f['Contact Key'] || '').trim();
    const { row, seeded } = livePlanRow(ctx.people, key, r, domain);
    if (!key) ll.people.unkeyed++; else if (!seeded) ll.people.duplicateKeys++;
    if (!isEmpty(f.Companies)) { ll.people.alreadyLinked++; continue; }   // a filled link is never overwritten
    if (!domain) { ll.people.domainless++; continue; }
    if (limit && links >= limit) { ll.people.beyondLimit++; continue; }
    let co = ctx.companies.get(domain);
    if (!co) {
      co = newPlanRow(null, null); co.domain = domain; co.touched = true; co.linkLive = true; co.createdByLinkLive = true;
      ctx.companies.set(domain, co);
      const notes = newNotes();
      assign(targets.Companies, co.fields, notes, 'Domain', domain, null, ctx);
      for (const [k, n] of Object.entries(notes.dropped)) bump(ll.companies.droppedKeys, k, n);
      ll.companies.created++; if (ll.companies.createdDomains.length < 20) ll.companies.createdDomains.push(domain);
    }
    if (co.createdByLinkLive) {   // Domain, Company and Tag only: the first non-empty seen across that domain's People rows. Domain Source stays empty, no door landed it
      const notes = newNotes();
      for (const k of ['Company', 'Tag']) if (isEmpty(co.fields[k]) && !isEmpty(f[k])) assign(targets.Companies, co.fields, notes, k, f[k], null, ctx);
      for (const [k, n] of Object.entries(notes.dropped)) bump(ll.companies.droppedKeys, k, n);
    }
    row.fields.Companies = co.id ? [co.id] : [`@new:${domain}`];
    row.touched = true; row.linkLive = true; links++;
    ll.people.newlyLinked++; if (co.id) ll.people.linkedToLive++; else ll.people.linkedToCreated++;
  }
  return ll;
}

// After an apply: what --link-live actually landed, from the per-row written flags.
function linkLiveWritten(ctx) {
  const w = { peopleLinked: 0, companiesCreated: 0, domainSourceBackfilled: {} };
  for (const row of new Set(ctx.people.values())) if (row.linkLive && row.written && row.write && row.write.Companies) w.peopleLinked++;
  for (const row of ctx.companies.values()) {
    if (!row.linkLive || !row.written) continue;
    if (row.createdByLinkLive) w.companiesCreated++;
    else if (row.write && row.write['Domain Source'] !== undefined) bump(w.domainSourceBackfilled, row.write['Domain Source']);
  }
  return w;
}

// ------------------------------------------------------------------ Apply

async function runBatches(label, rows, fn, verb = 'written') {
  const batches = []; for (let i = 0; i < rows.length; i += BATCH) batches.push(rows.slice(i, i + BATCH));
  let next = 0; let done = 0; let failed = null;
  async function worker() {
    while (next < batches.length && !failed) {
      const b = batches[next++];
      try { await fn(b); } catch (e) { failed = failed || e; return; }
      const before = done; done += b.length;
      if (Math.floor(done / PROGRESS_EVERY) > Math.floor(before / PROGRESS_EVERY)) console.log(`  ${label}: ${done}/${rows.length} ${verb}`);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  console.log(`  ${label}: ${done}/${rows.length} ${verb}${failed ? ' (stopped on error)' : ''}`);
  if (failed) throw failed;
  return done;
}

async function applyPlan(ctx, files, report) {
  const { base, targets } = ctx;
  const undo = { version: 1, base, startedAt: new Date().toISOString(), tables: { Companies: targets.Companies.id, People: targets.People.id }, created: { Companies: [], People: [] }, updated: { Companies: [], People: [] } };
  const appendUndo = (line) => fs.appendFileSync(files.undoJsonl, JSON.stringify(line) + '\n');
  fs.writeFileSync(files.undoJsonl, '');
  const written = { Companies: { created: 0, updated: 0 }, People: { created: 0, updated: 0 } };
  report.written = written;

  const doCreates = async (role, rows) => runBatches(`${role} create`, rows, async (batch) => {
    const recs = await createRecords(base, targets[role].id, batch.map((r) => ({ fields: r.write })));
    if (recs.length !== batch.length) throw new Error(`${role} create returned ${recs.length} records for ${batch.length}`);
    recs.forEach((rec, i) => { batch[i].id = rec.id; batch[i].written = true; });
    const ids = recs.map((r) => r.id);
    undo.created[role].push(...ids); appendUndo({ op: 'create', table: role, tableId: targets[role].id, ids });
    written[role].created += ids.length;
  });
  const doUpdates = async (role, rows) => runBatches(`${role} update`, rows, async (batch) => {
    await updateRecords(base, targets[role].id, batch.map((r) => ({ id: r.id, fields: r.write })));
    const records = batch.map((r) => { const prior = {}; for (const k of Object.keys(r.write)) prior[k] = r.live && r.live[k] !== undefined ? r.live[k] : null; return { id: r.id, prior }; });
    batch.forEach((r) => { r.written = true; });
    undo.updated[role].push(...records); appendUndo({ op: 'update', table: role, tableId: targets[role].id, records });
    written[role].updated += records.length;
  });

  try {
    const cRows = [...ctx.companies.values()];
    await doCreates('Companies', cRows.filter((r) => r.action === 'create'));
    await doUpdates('Companies', cRows.filter((r) => r.action === 'update'));

    // Resolve the People -> Companies placeholders now that the created rows have ids.
    let unresolvedLinks = 0;
    const peopleRows = [...new Set(ctx.people.values())];
    for (const row of peopleRows) {
      if (row.action !== 'create' && row.action !== 'update') continue;
      const v = row.write.Companies;
      if (Array.isArray(v) && v.length && String(v[0]).startsWith('@new:')) {
        const co = ctx.companies.get(row.domain);
        if (co && co.id) row.write.Companies = [co.id];
        else { delete row.write.Companies; unresolvedLinks++; if (row.action === 'update' && !Object.keys(row.write).length) row.action = 'unchanged'; }
      }
    }
    report.people.companiesLinkUnresolvedAtWrite = unresolvedLinks;

    await doCreates('People', peopleRows.filter((r) => r.action === 'create'));
    await doUpdates('People', peopleRows.filter((r) => r.action === 'update'));
  } finally {
    undo.finishedAt = new Date().toISOString();
    fs.writeFileSync(files.undoJson, JSON.stringify(undo, null, 1));
  }
}

// ------------------------------------------------------------------ Undo

function loadUndo(file) {
  const text = fs.readFileSync(file, 'utf8');
  if (file.endsWith('.jsonl')) {
    const undo = { base: '', tables: {}, created: { Companies: [], People: [] }, updated: { Companies: [], People: [] } };
    for (const line of text.split('\n')) {
      if (!line.trim()) continue;
      const j = JSON.parse(line);
      undo.tables[j.table] = j.tableId;
      if (j.op === 'create') undo.created[j.table].push(...j.ids);
      else if (j.op === 'update') undo.updated[j.table].push(...j.records);
    }
    return undo;
  }
  return JSON.parse(text);
}

function emptyFor(type) { return type === 'multipleRecordLinks' || type === 'multipleSelects' ? [] : (type === 'checkbox' ? false : null); }

async function runUndo(opts) {
  const undo = loadUndo(opts.undo);
  const base = opts.base || undo.base;
  if (!base) die('the undo file carries no base id; pass --base');
  if (opts.base && undo.base && opts.base !== undo.base) die(`undo file is for ${undo.base}, not ${opts.base}`);
  const meta = await getMeta(base);
  const byId = new Map(meta.map((t) => [t.id, t]));
  const result = { base, file: opts.undo, mode: opts.apply ? 'apply' : 'dry-run', startedAt: new Date().toISOString(), deleted: {}, restored: {}, alreadyGone: {}, errors: [] };
  console.log(`Undo ${opts.apply ? 'APPLY' : 'DRY RUN'} for ${base} from ${opts.undo}`);
  for (const role of ['People', 'Companies']) {
    const ids = (undo.created[role] || []); const ups = (undo.updated[role] || []);
    console.log(`  ${role}: delete ${ids.length} created, restore ${ups.length} updated`);
  }
  if (!opts.apply) { console.log('DRY RUN: nothing touched. Add --apply to execute.'); return; }
  console.log('APPLY in 5 s, Ctrl-C to abort.'); await sleep(5000);

  for (const role of ['People', 'Companies']) {   // People first so no link dangles while Companies go
    const tableId = undo.tables[role]; if (!tableId) continue;
    const t = byId.get(tableId); if (!t) { result.errors.push(`${role} table ${tableId} not found in base`); continue; }
    const types = new Map(t.fields.map((f) => [f.name, f.type]));
    const ids = undo.created[role] || [];
    result.deleted[role] = 0; result.alreadyGone[role] = 0;
    await runBatches(`${role} delete`, ids, async (batch) => {
      // Airtable fails the whole batch when one id is already gone; then go one by one and tolerate NOT_FOUND.
      try { result.deleted[role] += (await deleteRecords(base, tableId, batch)).length; }
      catch (e) {
        if (!/NOT_FOUND/i.test(e.message)) throw e;
        for (const id of batch) {   // one already gone: retry one by one, tolerate the gone ones
          try { result.deleted[role] += (await deleteRecords(base, tableId, [id])).length; }
          catch (e2) { if (/NOT_FOUND/i.test(e2.message)) result.alreadyGone[role]++; else throw e2; }
        }
      }
    }, 'deleted');
    const ups = undo.updated[role] || [];
    result.restored[role] = 0;
    await runBatches(`${role} restore`, ups, async (batch) => {
      const records = batch.map((u) => { const fields = {}; for (const [k, v] of Object.entries(u.prior || {})) fields[k] = v === null || v === undefined ? emptyFor(types.get(k)) : v; return { id: u.id, fields }; });
      result.restored[role] += (await updateRecords(base, tableId, records)).length;
    }, 'restored');
  }
  result.finishedAt = new Date().toISOString(); result.api = apiStats;
  const out = `${opts.undo}-result.json`;
  fs.writeFileSync(out, JSON.stringify(result, null, 1));
  console.log(`Undo done. Result: ${out}`);
}

// ------------------------------------------------------------------ Main

function outDir(opts) {
  const dir = opts.out ? path.resolve(opts.out) : path.join(__dirname, 'out');
  fs.mkdirSync(dir, { recursive: true });
  const gi = path.join(dir, '.gitignore');
  if (!fs.existsSync(gi)) fs.writeFileSync(gi, '*\n!.gitignore\n');
  return dir;
}

function legacyRecord(t, shape) {
  return {
    name: t.name, id: t.id, shape, fieldSet: new Set(t.fields.map((f) => f.name)), fieldTypes: new Map(t.fields.map((f) => [f.name, f.type])),
    isIntent: /\(intent\)/i.test(t.name), domainSource: '', signalId: null, signalName: null,
    rowsRead: 0, noDomain: 0, domainNormalized: 0,
    companiesNew: 0, companiesMergedIntoLive: 0, companiesCollisions: 0, companiesSeededFromContacts: 0, companiesTouchedFromContacts: 0,
    peopleNew: 0, peopleMergedIntoLive: 0, peopleCollisions: 0, unkeyed: 0, unkeyedIds: [], keyDrift: 0, keyFromLegacy: 0, nameWasCompany: 0,
    droppedKeys: { Companies: {}, People: {} }, invalidValues: { Companies: {}, People: {} }, invalidOverflow: 0, unresolvedCampaignIds: 0, carriedKeys: { Companies: new Set(), People: new Set() }, samples: [],
    acceptedCols: [], acceptedDrops: {},
  };
}

// The accepted columns this table carries that no map reads for its own target: read and counted, never written.
function acceptedColsOf(legacy) {
  const role = legacy.shape === 'domains' ? 'Companies' : 'People';
  const carried = fromNamesOf(legacy.shape === 'domains' ? COMPANY_MAP : PEOPLE_MAP);
  return [...ACCEPTED_DROPS[role]].filter((c) => legacy.fieldSet.has(c) && !carried.has(c));
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) { usage(); return; }
  KEY = apiKey();
  if (opts.undo) return runUndo(opts);
  if (!/^app[A-Za-z0-9]{14}$/.test(opts.base)) die('--base appXXXXXXXXXXXXXX is required');

  const base = opts.base;
  const startedAt = new Date();
  const ts = startedAt.toISOString().replace(/[:.]/g, '-');
  const dir = outDir(opts);
  const stem = path.join(dir, `migrate-${base}-${ts}`);
  const files = { report: `${stem}.json`, undoJsonl: `${stem}-undo.jsonl`, undoJson: `${stem}-undo.json`, plan: `${stem}-plan.jsonl` };
  console.log(`${opts.apply ? 'APPLY' : 'DRY RUN'} on ${base}`);

  // 1. Schema.
  const meta = await getMeta(base);
  const byName = new Map(meta.map((t) => [t.name, t]));
  const byId = new Map(meta.map((t) => [t.id, t]));
  const compT = byName.get('Companies'); const peopT = byName.get('People');
  if (!compT || !peopT) die(`base ${base} lacks a Companies or People table; scaffold it to the register first`);
  const targets = { Companies: indexTarget(compT, 'Companies'), People: indexTarget(peopT, 'People') };
  for (const [role, key] of [['Companies', 'Domain'], ['People', 'Contact Key']]) if (!targets[role].writable.has(key)) die(`${role} has no writable ${key} field`);

  const campLink = targets.Companies.fields.get('Campaigns') || targets.People.fields.get('Campaigns');
  const sigLink = targets.Companies.fields.get('Signals');
  const campMirrorId = campLink && campLink.options.linkedTableId; const sigMirrorId = sigLink && sigLink.options.linkedTableId;
  const mirrorIds = new Set([campMirrorId, sigMirrorId].filter(Boolean));

  // 2. Legacy tables.
  const skipped = []; const legacies = [];
  for (const t of meta) {
    if (t.id === compT.id || t.id === peopT.id) continue;
    if (mirrorIds.has(t.id)) { skipped.push({ name: t.name, id: t.id, reason: 'mirror table' }); continue; }
    if (t.name === 'DNC') { skipped.push({ name: t.name, id: t.id, reason: 'DNC stays' }); continue; }
    if (opts.tables && !opts.tables.includes(t.name) && !opts.tables.includes(t.id)) { skipped.push({ name: t.name, id: t.id, reason: 'not selected' }); continue; }
    const shape = shapeOf(t);
    if (!shape) { skipped.push({ name: t.name, id: t.id, reason: 'neither Domain nor Contact Key' }); continue; }
    const legacy = legacyRecord(t, shape); legacy.domainSource = domainSourceOf(legacy); legacy.acceptedCols = acceptedColsOf(legacy); legacies.push(legacy);
  }
  if (opts.tables) for (const sel of opts.tables) if (!byName.has(sel) && !byId.has(sel)) die(`--tables: "${sel}" is not a table in ${base}`);
  if (!legacies.length && !opts.linkLive) die('no eligible legacy table (needs a Domain or a Contact Key column); --link-live runs without one');
  if (!legacies.length) console.log('  no legacy table selected: --link-live on the live rows only');
  legacies.sort((a, b) => (a.shape === b.shape ? 0 : a.shape === 'domains' ? -1 : 1));   // domains rows take precedence over contact-derived company data

  // 3. Mirrors.
  const ctx = { base, opts, targets, companies: new Map(), people: new Map(), domainsIn: new Set(), keysIn: new Set(), validLinks: {} };
  let campaignRows = 0; let signalRows = [];
  if (campMirrorId && byId.has(campMirrorId)) {
    const mt = byId.get(campMirrorId); const primary = (mt.fields.find((f) => f.id === mt.primaryFieldId) || {}).name;
    const rows = await listAll(base, campMirrorId, primary ? [primary] : [], { label: mt.name });
    ctx.validLinks.Campaigns = new Set(rows.map((r) => r.id)); campaignRows = rows.length;
  }
  if (sigMirrorId && byId.has(sigMirrorId)) {
    const st = byId.get(sigMirrorId); const names = new Set(st.fields.map((f) => f.name));
    const primary = (st.fields.find((f) => f.id === st.primaryFieldId) || {}).name;
    const want = [primary, names.has('Target Table') ? 'Target Table' : null].filter(Boolean);
    const rows = await listAll(base, sigMirrorId, want, { label: st.name });
    signalRows = rows.map((r) => ({ id: r.id, name: String((r.fields || {})[primary] || '').trim(), targetTable: String((r.fields || {})['Target Table'] || '').trim() }));
    ctx.validLinks.Signals = new Set(signalRows.map((r) => r.id));
  }
  const signals = { resolved: {}, unresolved: [] };
  for (const legacy of legacies) {
    if (!legacy.isIntent) continue;
    const hit = resolveSignal(legacy, signalRows, opts.signal);
    if (hit && hit.id) { legacy.signalId = hit.id; legacy.signalName = hit.name; signals.resolved[legacy.name] = { id: hit.id, name: hit.name }; }
    else signals.unresolved.push(legacy.name + (hit && hit.unresolvedOverride ? ` (override "${hit.name}" not found)` : ''));
  }

  // 4. Live targets, seeded into the plan so the merge sees current values. --link-live also reads its evidence columns, whatever their type.
  const liveFields = (target, MAP, extra, anyType) => [...new Set([...[target.primary, ...extra, ...MAP.map((m) => m.to), 'Tag', 'Domain Source', 'Signals'].filter((n) => target.writable.has(n)), ...(anyType || []).filter((n) => target.fields.has(n))])];
  const liveC = await listAll(base, targets.Companies.id, liveFields(targets.Companies, COMPANY_MAP, ['Domain'], opts.linkLive ? LINK_LIVE_READ.Companies : []), { label: 'Companies (live)' });
  for (const r of liveC) { const d = normDomain((r.fields || {}).Domain); if (!d) continue; if (!ctx.companies.has(d)) { const row = newPlanRow(r.id, r.fields || {}); row.domain = d; ctx.companies.set(d, row); } }
  const liveP = await listAll(base, targets.People.id, liveFields(targets.People, PEOPLE_MAP, ['Contact Key', 'Domain', 'Name', 'first_name', 'last_name', 'Companies'], opts.linkLive ? LINK_LIVE_READ.People : []), { label: 'People (live)' });
  for (const r of liveP) { const k = String((r.fields || {})['Contact Key'] || '').trim(); if (!k) continue; if (!ctx.people.has(k)) { const row = newPlanRow(r.id, r.fields || {}); row.domain = normDomain((r.fields || {}).Domain); ctx.people.set(k, row); } }
  console.log(`  live: ${liveC.length} Companies, ${liveP.length} People, ${campaignRows} campaign mirror rows, ${signalRows.length} signal mirror rows`);

  // 4b. --link-live: the live rows themselves, planned before the legacy tables.
  if (opts.linkLive) {
    const ll = planLinkLive(ctx, liveC, liveP);
    const per = (o) => Object.entries(o).map(([k, n]) => `${k} ${n}`).join(', ') || 'none';
    console.log(`  link live: ${ll.people.newlyLinked} People to link (${ll.people.alreadyLinked} already linked, ${ll.people.domainless} domainless), ${ll.companies.created} Companies to create, Domain Source backfill ${per(ll.domainSource.backfilled)}`);
  }

  // 5. Legacy rows -> plan.
  for (const legacy of legacies) {
    console.log(`  reading ${legacy.name} (${legacy.shape}, Domain Source ${legacy.domainSource}${legacy.signalName ? `, Signals -> ${legacy.signalName}` : ''})`);
    await processLegacy(legacy, ctx);
    console.log(`  ${legacy.name}: ${legacy.rowsRead} rows read`);
  }
  const tally = finalizePlan(ctx);

  // 6. Report.
  // Drops split in three: lookup (arrives by lookup through the Companies link, no loss at all),
  // accepted (ruled out of the register, counted, never blocking) and the rest, which block.
  const droppedKeys = { Companies: {}, People: {} }; const invalidValues = { Companies: {}, People: {} }; const acceptedDrops = { Companies: {}, People: {} }; const lookupDrops = { Companies: {}, People: {} };
  for (const l of legacies) {
    for (const role of ['Companies', 'People']) {
      for (const [k, n] of Object.entries(l.droppedKeys[role])) bump(LOOKUP_DROPS[role].has(k) ? lookupDrops[role] : ACCEPTED_DROPS[role].has(k) ? acceptedDrops[role] : droppedKeys[role], k, n);
      for (const [k, n] of Object.entries(l.invalidValues[role])) bump(invalidValues[role], k, n);
    }
    for (const [k, n] of Object.entries(l.acceptedDrops)) bump(acceptedDrops[l.shape === 'domains' ? 'Companies' : 'People'], k, n);
  }
  const dataBearingDrops = Object.values(droppedKeys).reduce((a, o) => a + Object.values(o).reduce((x, y) => x + y, 0), 0);
  const unresolvedCampaignIds = legacies.reduce((a, l) => a + l.unresolvedCampaignIds, 0);
  const guards = { blocked: false, reasons: [] };
  if (dataBearingDrops) guards.reasons.push(`${dataBearingDrops} non-empty values would be dropped (keys the targets lack or cannot take)`);
  if (unresolvedCampaignIds) guards.reasons.push(`${unresolvedCampaignIds} Campaigns link ids do not resolve in the mirror`);
  if (signals.unresolved.length) guards.reasons.push(`signal unresolved for: ${signals.unresolved.join('; ')}`);
  const linkLiveDrops = ctx.linkLive ? Object.values(ctx.linkLive.companies.droppedKeys).reduce((a, n) => a + n, 0) : 0;
  if (linkLiveDrops) guards.reasons.push(`${linkLiveDrops} non-empty values would be dropped from the Companies rows --link-live creates (keys Companies lacks or cannot take)`);
  guards.blocked = guards.reasons.length > 0 && !opts.allowLoss;

  const accountedC = tally.Companies.create + tally.Companies.update + tally.Companies.unchanged;
  const accountedP = tally.People.create + tally.People.update + tally.People.unchanged;
  const report = {
    version: 1, base, mode: opts.apply ? 'apply' : 'dry-run', startedAt: startedAt.toISOString(), finishedAt: null,
    options: { tables: opts.tables, linkLive: opts.linkLive, limit: opts.limit, allowLoss: opts.allowLoss, signal: opts.signal },
    targets: Object.fromEntries(Object.values(targets).map((t) => [t.role, { id: t.id, primary: t.primary, writable: [...t.writable], missingRegisterFields: t.missingRegisterFields }])),
    mirrors: { campaigns: campMirrorId ? { id: campMirrorId, name: (byId.get(campMirrorId) || {}).name, rows: campaignRows } : null, signals: sigMirrorId ? { id: sigMirrorId, name: (byId.get(sigMirrorId) || {}).name, rows: signalRows } : null },
    signals,
    skippedTables: skipped,
    legacy: legacies.map((l) => ({
      name: l.name, id: l.id, shape: l.shape, isIntent: l.isIntent, domainSource: l.domainSource, signal: l.signalId ? { id: l.signalId, name: l.signalName } : null,
      rowsRead: l.rowsRead, noDomain: l.noDomain, domainNormalized: l.domainNormalized,
      companies: l.shape === 'domains'
        ? { new: l.companiesNew, mergedIntoLive: l.companiesMergedIntoLive, collisions: l.companiesCollisions }
        : { seededFromContacts: l.companiesSeededFromContacts, gapFilledFromContacts: l.companiesTouchedFromContacts },
      people: l.shape === 'contacts' ? { new: l.peopleNew, mergedIntoLive: l.peopleMergedIntoLive, collisions: l.peopleCollisions, unkeyed: l.unkeyed, unkeyedIds: l.unkeyedIds, keyDrift: l.keyDrift, keyFromLegacy: l.keyFromLegacy, nameWasCompany: l.nameWasCompany } : null,
      carriedKeys: { Companies: [...l.carriedKeys.Companies].sort(), People: [...l.carriedKeys.People].sort() }, droppedKeys: l.droppedKeys, acceptedDrops: l.acceptedDrops, invalidValues: l.invalidValues, invalidOverflow: l.invalidOverflow, unresolvedCampaignIds: l.unresolvedCampaignIds,
      samples: l.samples,
    })),
    companies: { uniqueDomainsIn: ctx.domainsIn.size, planned: { create: tally.Companies.create, update: tally.Companies.update, unchanged: tally.Companies.unchanged }, existingMatched: tally.Companies.existingMatched, collisions: tally.Companies.collisions, tagCollisions: tally.Companies.tagCollisions, liveRows: liveC.length },
    people: { uniqueKeysIn: ctx.keysIn.size, planned: { create: tally.People.create, update: tally.People.update, unchanged: tally.People.unchanged }, existingMatched: tally.People.existingMatched, collisions: tally.People.collisions, tagCollisions: tally.People.tagCollisions, withoutCompaniesRow: tally.People.withoutCompaniesRow, unkeyed: legacies.reduce((a, l) => a + l.unkeyed, 0), keyDrift: legacies.reduce((a, l) => a + l.keyDrift, 0), nameWasCompany: legacies.reduce((a, l) => a + l.nameWasCompany, 0), liveRows: liveP.length },
    droppedKeys, acceptedDrops, lookupDrops, invalidValues, unresolvedCampaignIds,
    reconciliation: {
      companies: { uniqueDomainsIn: ctx.domainsIn.size, accounted: accountedC, ok: ctx.domainsIn.size === accountedC },
      people: { uniqueKeysIn: ctx.keysIn.size, accounted: accountedP, ok: ctx.keysIn.size === accountedP, note: ctx.keysIn.size === accountedP ? '' : 'key drift: a row whose rebuilt key differs from its legacy Contact Key was merged into the row that legacy key names (see legacy[].people.keyDrift); the difference is rows folded, not rows lost' },
    },
    linkLive: ctx.linkLive || null,
    guards, written: null, api: apiStats, errors: [],
  };

  if (opts.dumpPlan) {
    const ws = fs.createWriteStream(files.plan);
    for (const [role, map] of [['Companies', ctx.companies], ['People', ctx.people]]) for (const row of new Set(map.values())) if (row.action === 'create' || row.action === 'update') ws.write(JSON.stringify({ table: role, action: row.action, id: row.id, key: row.domain || row.fields['Contact Key'], fields: row.write }) + '\n');
    ws.end();
  }

  const finish = () => { report.finishedAt = new Date().toISOString(); report.api = apiStats; if (ctx.linkLive) ctx.linkLive.written = opts.apply ? linkLiveWritten(ctx) : null; fs.writeFileSync(files.report, JSON.stringify(report, null, 1)); };
  printSummary(report);

  if (!opts.apply) { finish(); console.log(`DRY RUN: nothing written. Report: ${files.report}`); return; }
  if (guards.blocked) { finish(); console.log(`APPLY refused: ${guards.reasons.join(' | ')}. Fix the scaffold or pass --allow-loss. Report: ${files.report}`); process.exitCode = 2; return; }
  const ll = ctx.linkLive;
  const llBanner = ll ? `; link live: link ${ll.people.newlyLinked} People, create ${ll.companies.created} Companies, backfill ${Object.values(ll.domainSource.backfilled).reduce((a, n) => a + n, 0)} Domain Source` : '';
  console.log(`APPLY in 5 s on ${base}: create ${tally.Companies.create} + update ${tally.Companies.update} Companies, create ${tally.People.create} + update ${tally.People.update} People${llBanner}. Ctrl-C to abort.`);
  await sleep(5000);
  try { await applyPlan(ctx, files, report); }
  catch (e) { report.errors.push(String(e.message || e)); finish(); console.error(`STOPPED: ${e.message}. Partial writes are in ${files.undoJson}; rerun to resume (the merge reads live state) or --undo to reverse.`); process.exitCode = 1; return; }
  finish();
  if (ll && ll.written) console.log(`  link live written: People linked ${ll.written.peopleLinked}, Companies created ${ll.written.companiesCreated}, Domain Source ${Object.entries(ll.written.domainSourceBackfilled).map(([k, n]) => `${k} ${n}`).join(', ') || 'none'}`);
  console.log(`APPLIED. Report: ${files.report}\nUndo: ${files.undoJson}`);
}

function printSummary(r) {
  const row = (k, v) => console.log(`  ${k.padEnd(34)} ${v}`);
  console.log('\nPlan');
  for (const l of r.legacy) {
    const c = l.companies; const p = l.people || {};
    const bits = l.shape === 'domains'
      ? `companies new ${c.new}, into live ${c.mergedIntoLive}, collisions ${c.collisions}`
      : `people new ${p.new}, into live ${p.mergedIntoLive}, collisions ${p.collisions}, unkeyed ${p.unkeyed}, key drift ${p.keyDrift}, name held the company ${p.nameWasCompany}; companies seeded ${c.seededFromContacts}, gap-filled ${c.gapFilledFromContacts}`;
    row(l.name.slice(0, 34), `${l.rowsRead} rows: ${bits}`);
  }
  row('Companies', `create ${r.companies.planned.create}, update ${r.companies.planned.update}, unchanged ${r.companies.planned.unchanged}; unique domains in ${r.companies.uniqueDomainsIn}; tag collisions ${r.companies.tagCollisions}`);
  row('People', `create ${r.people.planned.create}, update ${r.people.planned.update}, unchanged ${r.people.planned.unchanged}; unique keys in ${r.people.uniqueKeysIn}; without Companies row ${r.people.withoutCompaniesRow}`);
  row('Name held the company', `${r.people.nameWasCompany} contact rows: Name equalled the row's own Company, first_name + last_name took over for the person's Name and for the Contact Key`);
  row('Reconciliation', `companies ${r.reconciliation.companies.ok ? 'ok' : 'MISMATCH'} (${r.reconciliation.companies.uniqueDomainsIn} in / ${r.reconciliation.companies.accounted} accounted), people ${r.reconciliation.people.ok ? 'ok' : 'MISMATCH'} (${r.reconciliation.people.uniqueKeysIn} in / ${r.reconciliation.people.accounted} accounted)`);
  if (r.linkLive) {
    const p = r.linkLive.people; const c = r.linkLive.companies; const d = r.linkLive.domainSource;
    const per = (o) => Object.entries(o).map(([k, n]) => `${k} ${n}`).join(', ') || 'none';
    row('Link live: People', `${p.liveRows} live: already linked ${p.alreadyLinked}, newly linked ${p.newlyLinked} (to live ${p.linkedToLive}, to created ${p.linkedToCreated}), domainless ${p.domainless}, unkeyed ${p.unkeyed}, duplicate keys ${p.duplicateKeys}${p.beyondLimit ? `, beyond --limit ${p.beyondLimit}` : ''}`);
    row('Link live: Companies', `${c.liveRows} live: create ${c.created} for People-only domains, domainless ${c.domainless}, duplicate domains ${c.duplicateDomains}${Object.keys(c.droppedKeys).length ? `; dropped ${per(c.droppedKeys)}` : ''}`);
    row('Link live: Domain Source', `backfill ${per(d.backfilled)}; already filled ${d.alreadyFilled}; left empty: no evidence ${d.leftEmpty.noEvidence}, choice missing ${per(d.leftEmpty.choiceMissing)}, field unwritable ${d.leftEmpty.fieldUnwritable}${d.leftEmpty.beyondLimit ? `, beyond --limit ${d.leftEmpty.beyondLimit}` : ''}${Object.keys(d.unrecognizedSourceValues).length ? `; Source values not naming DiscoLike: ${per(d.unrecognizedSourceValues).slice(0, 160)}` : ''}`);
  }
  for (const role of ['Companies', 'People']) {
    const d = r.droppedKeys[role]; const keys = Object.keys(d);
    row(`Dropped on ${role}`, keys.length ? keys.map((k) => `${k} (${d[k]})`).join(', ') : 'none');
    const acc = (r.acceptedDrops || {})[role] || {}; const ak = Object.keys(acc);
    if (ak.length) row(`Accepted drops on ${role}`, ak.map((k) => `${k} (${acc[k]})`).join(', '));
    const lk = (r.lookupDrops || {})[role] || {}; const lkk = Object.keys(lk);
    if (lkk.length) row(`Arrive by lookup on ${role}`, `${lkk.map((k) => `${k} (${lk[k]})`).join(', ')} - not written, not lost: looked up through the Companies link`);
    const miss = r.targets[role].missingRegisterFields;
    if (miss.length) row(`${role} lacks (register)`, miss.join(', '));
  }
  row('Unresolved Campaigns ids', r.unresolvedCampaignIds);
  row('Signals', `resolved ${Object.keys(r.signals.resolved).length}, unresolved ${r.signals.unresolved.length}${r.signals.unresolved.length ? ` (${r.signals.unresolved.join('; ')})` : ''}`);
  const inv = Object.entries(r.invalidValues).flatMap(([role, o]) => Object.entries(o).map(([k, n]) => `${role}.${k} x${n}`));
  row('Invalid values (dropped)', inv.length ? inv.slice(0, 12).join(', ') + (inv.length > 12 ? ` and ${inv.length - 12} more in the report` : '') : 'none');
  if (r.guards.reasons.length) row('Guards', `${r.guards.blocked ? 'BLOCKED' : 'overridden by --allow-loss'}: ${r.guards.reasons.join(' | ')}`);
  console.log('');
}

main().catch((e) => { console.error(e.stack || e.message); process.exit(1); });
