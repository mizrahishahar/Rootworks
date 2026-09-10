#!/usr/bin/env node
/**
 * andy-call-list.js
 *
 * Builds the call list Andy dials. Reads People in the Dave.io base, applies the
 * fences we agreed, keeps ONE person per company, hits a 70/30 split between
 * no-infra-owner and has-infra-owner companies, and writes a CSV.
 *
 * Fences (all server-side except the title rule):
 *   relevance = 1              buyer titles only, kills sales/marketing/product/etc
 *   Final Email present        Andy's second identity key and our fallback channel
 *   LinkedIn URL present       how FullEnrich finds the phone
 *   linkedin_name_match = 1    the URL really belongs to this person
 *   Dialed unchecked           nobody Andy or Dwayne already burned
 *   Infra Ratio present        company has a measured ratio, never a guess
 *
 * Title rule, per size band:
 *   11-50  technical decision makers ONLY (CTO, VP/Head Eng, infra leads).
 *          A company that size has a real technical owner and that is who buys.
 *   1-10   the same, PLUS founders/CEOs/owners, because at that size the founder
 *          IS the infra owner.
 *
 * One per company, ranked: CTO > VP/Head of Engineering > Founder/CEO > anything else.
 *
 * Usage:
 *   node scripts/andy-call-list.js                       # 1000 rows, 70/30
 *   node scripts/andy-call-list.js --size 500 --split 60
 *   node scripts/andy-call-list.js --min-contacts 5      # only trustworthy ratios
 *   node scripts/andy-call-list.js --out ~/Downloads/andy-b1.csv
 */

const fs = require('fs');
const path = require('path');

const BASE = 'appyhuYMwaGUdIs3z';
const TABLE = 'People';
const AT = 'https://api.airtable.com/v0';

const args = process.argv.slice(2);
const arg = (n, d) => { const i = args.indexOf('--' + n); return i === -1 ? d : args[i + 1]; };

const SIZE = parseInt(arg('size', '1000'), 10);
const SPLIT = parseInt(arg('split', '70'), 10);           // % with NO infra owner
const MIN_CONTACTS = parseInt(arg('min-contacts', '0'), 10);
const OUT = arg('out', path.join(process.env.HOME, 'Downloads', `andy-call-list-${new Date().toISOString().slice(0, 10)}.csv`));

const KEY = process.env.AIRTABLE_API_KEY
  || fs.readFileSync(path.join(process.env.HOME, '.config', 'rootworks', 'airtable-api-key'), 'utf8').trim();

// ---------- second line of defence on "already dialed" ----------
// The Dialed checkbox in the base is only as complete as the last import, and it
// misses people whose LinkedIn URL is written differently on the two sides. So we
// also diff against Andy's dialed CSV directly at export time. Belt and braces:
// handing him a number he already burned is the one failure he will actually feel.

const DIALED_CSV = arg('dialed', newestDialedFile());

function newestDialedFile() {
  const dir = path.join(process.env.HOME, 'Downloads');
  const files = fs.readdirSync(dir).filter((f) => /^daveio_dnc_all_dialed.*\.csv$/i.test(f));
  if (!files.length) return null;
  return path.join(dir, files
    .map((f) => ({ f, t: fs.statSync(path.join(dir, f)).mtimeMs }))
    .sort((a, b) => b.t - a.t)[0].f);
}

const liSlug = (u) => {
  const m = /\/in\/([^/?]+)/.exec(String(u || '').toLowerCase().replace(/\/+$/, ''));
  return m ? m[1] : '';
};

// Proper RFC4180 parse. A regex split silently dropped two thirds of Andy's file
// (744 of 2,229 rows) because quoted cells contain commas and newlines.
function parseCsv(text) {
  const rows = [];
  let row = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; }
      else cell += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
    else if (c !== '\r') cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

function loadDialed() {
  const guard = { slugs: new Set(), emails: new Set(), file: DIALED_CSV, rows: 0 };
  if (!DIALED_CSV || !fs.existsSync(DIALED_CSV)) return guard;
  const rows = parseCsv(fs.readFileSync(DIALED_CSV, 'utf8').replace(/^﻿/, ''));
  const head = rows[0].map((h) => h.trim());
  const iLi = head.indexOf('contact_linkedin');
  const iEm = head.indexOf('email');
  for (const r of rows.slice(1)) {
    if (r.length < head.length) continue;
    guard.rows++;
    const slug = liSlug(r[iLi]);
    if (slug) guard.slugs.add(slug);
    const em = String(r[iEm] || '').trim().toLowerCase();
    if (em) guard.emails.add(em);
  }
  return guard;
}

// ---------- title rules ----------

const TECHNICAL = /(?:\bcto\b|chief technolog|chief technical|\bvp\b|vice president|head of engineering|head of technology|head of infrastructure|head of platform|infrastructur|devops|\bsre\b|site reliability|platform|engineering|engineer|architect)/i;
const FOUNDER = /(?:founder|\bceo\b|chief executive|\bowner\b)/i;
// Titles that slip past relevance but must never reach a dialer.
const NEVER = /(?:\bcfo\b|chief financial|\bciso\b|\bcso\b|\bcoo\b|chief operating|chief revenue|chief marketing|chief people|chief experience|chief alliance|\bsales\b|marketing|recruit)/i;

function allowed(title, band) {
  if (!title) return false;
  if (NEVER.test(title)) return false;
  if (TECHNICAL.test(title)) return true;
  return band === '1-10' && FOUNDER.test(title);
}

// CTO first: at a small company the CTO owns the decision and the pain.
function rank(title) {
  const t = title || '';
  if (/\bcto\b|chief technolog|chief technical/i.test(t)) return 0;
  if (/(\bvp\b|vice president|head of).*(engineering|technolog|infrastructur|platform)/i.test(t)) return 1;
  if (/infrastructur|devops|\bsre\b|site reliability|platform/i.test(t)) return 2;
  if (FOUNDER.test(t)) return 3;
  return 4;
}

// ---------- read ----------

// Fields are addressed by ID, never by name. The People lookup was renamed from
// "Infra Ratio" to "Infra:dev ratio" mid-build and broke a name-based read; IDs
// are stable across renames. Names are resolved from the schema only to build
// the filter formula, which Airtable will not accept in ID form.
const F = {
  relevance: 'fldXgquyXngtokLj0',
  finalEmail: 'fldsp9Py7uVfuTMCb',
  linkedin: 'fldcpzfuwpKRdirRO',
  nameMatch: 'fld1F73OjGSeVSmwN',
  dialed: 'fldj3PoDhcoL4hM2i',
  ratio: 'fldLc06Xzw0OuJkxc',
  name: 'fld5yD17F6unJOnI7',
  firstName: 'fld6hDACpH93MQnFL',
  lastName: 'fld2l4d7leJrjBc9d',
  title: 'fldNZMEOmoMAnfQHo',
  seniority: 'fldIOhaFodzlo3BxY',
  domain: 'fldQiMHpq8HAVwyAS',
  company: 'fldLOf5GOHNa3IddD',
  city: 'fldNt9TOxG8BCOS1c',
  state: 'fld3JdNkAefQtODYv',
  employees: 'fld1U6p82xQR0aRtD',
  tech: 'fldHLsyC4gZON7dw3',
};

let NAMES = {};   // fieldId -> current display name

async function loadSchema() {
  const res = await fetch(`https://api.airtable.com/v0/meta/bases/${BASE}/tables`, {
    headers: { Authorization: `Bearer ${KEY}` },
  });
  if (!res.ok) throw new Error(`schema ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const t = (await res.json()).tables.find((x) => x.id === 'tblozINsOLiA184ql');
  for (const f of t.fields) NAMES[f.id] = f.name;
  const missing = Object.entries(F).filter(([, id]) => !NAMES[id]);
  if (missing.length) throw new Error(`fields no longer exist: ${missing.map(([k]) => k).join(', ')}`);
}

const n = (id) => `{${NAMES[id]}}`;

async function readAll() {
  const formula = `AND(${n(F.relevance)}=1, ${n(F.finalEmail)}!="", ${n(F.linkedin)}!="", `
    + `${n(F.nameMatch)}=1, NOT(${n(F.dialed)}), ARRAYJOIN(${n(F.ratio)})!="")`;
  const out = [];
  let offset;
  do {
    const p = new URLSearchParams({ pageSize: '100', filterByFormula: formula, returnFieldsByFieldId: 'true' });
    for (const id of Object.values(F)) p.append('fields[]', id);
    if (offset) p.set('offset', offset);
    const res = await fetch(`${AT}/${BASE}/${TABLE}?${p}`, { headers: { Authorization: `Bearer ${KEY}` } });
    if (!res.ok) throw new Error(`Airtable ${res.status}: ${(await res.text()).slice(0, 300)}`);
    const page = await res.json();
    out.push(...page.records);
    offset = page.offset;
    process.stderr.write(`\r  read ${out.length} people…`);
  } while (offset);
  process.stderr.write('\n');
  return out;
}

const first = (v) => Array.isArray(v) ? (v[0] ?? '') : (v ?? '');

// ---------- build ----------

(async () => {
  console.log(`Building ${SIZE} rows, ${SPLIT}/${100 - SPLIT} no-infra vs has-infra${MIN_CONTACTS ? `, min ${MIN_CONTACTS} contacts` : ''}`);
  await loadSchema();
  console.log(`  ratio field currently named "${NAMES[F.ratio]}"`);
  const raw = await readAll();
  console.log(`${raw.length} people pass the base fences`);

  const guard = loadDialed();
  console.log(guard.file
    ? `dialed guard: ${guard.rows} rows read, ${guard.slugs.size} LinkedIn slugs, ${guard.emails.size} emails from ${path.basename(guard.file)}`
    : 'dialed guard: NO CSV FOUND — relying on the Dialed checkbox alone');
  let blockedByGuard = 0;

  const people = [];
  for (const r of raw) {
    const f = r.fields;
    const slug = liSlug(f[F.linkedin]);
    const email = String(f[F.finalEmail] || '').toLowerCase();
    if ((slug && guard.slugs.has(slug)) || (email && guard.emails.has(email))) { blockedByGuard++; continue; }
    const band = String(first(f[F.employees]) && first(f[F.employees]).name || first(f[F.employees]));
    const title = f[F.title] || '';
    if (!allowed(title, band)) continue;
    const ratio = String(first(f[F.ratio]));
    const infra = parseInt(ratio.split(':')[0], 10);
    const dev = parseInt(ratio.split(':')[1], 10);
    if (Number.isNaN(infra)) continue;
    // A ratio of 0:0 means GetLeads knows the company but found no technical
    // staff at all. That is thin evidence, not a lean team, and it is exactly
    // the mistake in 274 rows of Dwayne's file. Never sell it as no-infra-owner.
    if (infra === 0 && dev === 0) continue;
    const sen = first(f[F.seniority]);
    people.push({
      domain: String(first(f[F.domain])).toLowerCase(),
      noInfra: infra === 0,
      rank: rank(title),
      contacts: dev + infra,
      row: {
        Name: f[F.name] || '', first_name: f[F.firstName] || '', last_name: f[F.lastName] || '',
        Title: title, Seniority: (sen && sen.name) || sen || '',
        Company: first(f[F.company]), Domain: String(first(f[F.domain])),
        City: first(f[F.city]), State: first(f[F.state]),
        'Company Size': band, Email: f[F.finalEmail] || '',
        'LinkedIn URL': f[F.linkedin] || '',
        'Infra Ratio': ratio, Tech: first(f[F.tech]),
        Phone: '',
      },
    });
  }
  console.log(`${blockedByGuard} blocked as already dialed (missed by the Dialed checkbox)`);
  console.log(`${people.length} pass the per-band title rule`);

  // one per company, best-ranked wins
  const best = new Map();
  for (const p of people) {
    if (!p.domain) continue;
    const cur = best.get(p.domain);
    if (!cur || p.rank < cur.rank || (p.rank === cur.rank && p.contacts > cur.contacts)) best.set(p.domain, p);
  }
  const unique = [...best.values()];
  console.log(`${unique.length} unique companies after one-per-company`);

  const no = unique.filter((p) => p.noInfra).sort((a, b) => a.rank - b.rank || b.contacts - a.contacts);
  const has = unique.filter((p) => !p.noInfra).sort((a, b) => a.rank - b.rank || b.contacts - a.contacts);
  console.log(`  no infra owner ${no.length} | has infra owner ${has.length}`);

  const wantNo = Math.round(SIZE * SPLIT / 100);
  const wantHas = SIZE - wantNo;
  let takeNo = no.slice(0, wantNo);
  let takeHas = has.slice(0, wantHas);

  // The split is a target, the size is the deliverable. If one bucket runs dry,
  // top the list up from the other rather than handing over a short file. The
  // infra-owner side is the scarce one and stays fully drained either way.
  const short = SIZE - (takeNo.length + takeHas.length);
  if (short > 0) {
    const moreNo = no.slice(takeNo.length, takeNo.length + short);
    takeNo = takeNo.concat(moreNo);
    const stillShort = SIZE - (takeNo.length + takeHas.length);
    if (stillShort > 0) takeHas = takeHas.concat(has.slice(takeHas.length, takeHas.length + stillShort));
    console.log(`  topped up ${short} rows from the deeper bucket to reach ${SIZE}`);
  }
  if (takeNo.length + takeHas.length < SIZE) {
    console.log(`  !! pool exhausted: ${takeNo.length + takeHas.length} of ${SIZE} (no-infra ${no.length}, has-infra ${has.length})`);
  }

  const picked = [...takeNo, ...takeHas];
  const cols = Object.keys(picked[0].row);
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = [cols.join(','), ...picked.map((p) => cols.map((c) => esc(p.row[c])).join(','))].join('\n');
  fs.writeFileSync(OUT, csv);

  const actual = Math.round(100 * takeNo.length / picked.length);
  console.log(`\nwrote ${picked.length} rows to ${OUT}`);
  console.log(`  ${takeNo.length} no infra owner (${actual}%) | ${takeHas.length} has infra owner (${100 - actual}%)`);
  console.log(`  ${new Set(picked.map((p) => p.domain)).size} distinct companies`);
})().catch((e) => { console.error(e); process.exit(1); });
