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
// DMs per company. 1 = the original one-per-company list. Andy asked on
// 2026-09-11 for several per company "so we leave nothing for dead" and learn
// which seat picks up; the agreed shape is 1,000 rows at about 3 per company.
const PER = parseInt(arg('per-company', '1'), 10);
// --dms-only drops individual contributors that pass relevance on "staff /
// principal / lead / founding engineer". At depth 3 they filled 141 of 1,000
// rows; they are reachable people, but not decision makers.
const DMS_ONLY = args.includes('--dms-only');
const IC = /^(senior |sr\.? |staff |lead |principal |founding )?(software |full[- ]?stack |backend |back[- ]end |frontend |front[- ]end |data |ml |machine learning |ai |qa |quality assurance |mobile |ios |android )?(engineer|developer|programmer)\b/i;
// Hands-on infra engineers (DevOps Engineer, SRE, Cloud Engineer, Platform
// Engineer...) are people who DO infrastructure, not people who BUY it. In
// --dms-only they go unless the title carries a leadership word. Found 66 of
// them in the first DMs-only build, 17 as the top contact at their company.
// Architects stay: Andy named "platform architecture" as a target seat.
const INFRA_IC = /devops|dev ops|\bsre\b|site reliability|reliability eng|cloud (engineer|ops|operations)|platform engineer|infrastructure engineer|infra engineer|systems? engineer|sysadmin|system administrator|network engineer|release engineer|build engineer|production engineer|kubernetes/i;
const LEADER = /\b(head|lead|manager|director|dir|vp|vice president|chief|cto|founder|owner|architect)\b/i;
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
  let oversized = 0;
  let noName = 0;
  let icDropped = 0;

  const people = [];
  for (const r of raw) {
    const f = r.fields;
    const slug = liSlug(f[F.linkedin]);
    const email = String(f[F.finalEmail] || '').toLowerCase();
    if ((slug && guard.slugs.has(slug)) || (email && guard.emails.has(email))) { blockedByGuard++; continue; }
    const band = String(first(f[F.employees]) && first(f[F.employees]).name || first(f[F.employees]));
    const title = f[F.title] || '';
    if (!allowed(title, band)) continue;
    // FullEnrich matches on First Name + Last Name + Website + LinkedIn. A row
    // with one name ("Jiang", "Sanny") fails its matcher, so it never ships.
    if (!String(f[F.firstName] || '').trim() || !String(f[F.lastName] || '').trim()) { noName++; continue; }
    if (DMS_ONLY && IC.test(title.trim())) { icDropped++; continue; }
    if (DMS_ONLY && INFRA_IC.test(title) && !LEADER.test(title)) { icDropped++; continue; }
    const ratio = String(first(f[F.ratio]));
    const infra = parseInt(ratio.split(':')[0], 10);
    const dev = parseInt(ratio.split(':')[1], 10);
    if (Number.isNaN(infra)) continue;
    // A ratio of 0:0 means GetLeads knows the company but found no technical
    // staff at all. That is thin evidence, not a lean team, and it is exactly
    // the mistake in 274 rows of Dwayne's file. Never sell it as no-infra-owner.
    if (infra === 0 && dev === 0) continue;
    // Our Employees band says 1-50, but GetLeads sees 75+ technical staff: the
    // band is wrong (doit.com read 67:127 as a "1-10" company). Wrong size is
    // wrong ICP, so the company is out rather than pitched as a small team.
    if (infra + dev > 75) { oversized++; continue; }
    const sen = first(f[F.seniority]);
    people.push({
      slug,
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
  console.log(`${oversized} dropped: company band says 1-50 but 75+ technical staff on record`);
  console.log(`${noName} dropped: missing first or last name (FullEnrich cannot match them)`);
  if (DMS_ONLY) console.log(`${icDropped} dropped: individual contributors (--dms-only)`);
  console.log(`${people.length} pass the per-band title rule`);

  // ---------- group by company, keep the best PER people in each ----------
  const byCo = new Map();
  for (const p of people) {
    if (!p.domain) continue;
    if (!byCo.has(p.domain)) byCo.set(p.domain, []);
    byCo.get(p.domain).push(p);
  }
  const companies = [];
  for (const [domain, list] of byCo) {
    // The same person can sit twice under two emails: dedupe by LinkedIn slug, then by name.
    const seen = new Set();
    const uniq = [];
    for (const p of list.sort((a, b) => a.rank - b.rank)) {
      const k1 = p.slug || '';
      const k2 = String(p.row.Name).toLowerCase().replace(/[^a-z]/g, '');
      if ((k1 && seen.has(k1)) || (k2 && seen.has(k2))) continue;
      if (k1) seen.add(k1);
      if (k2) seen.add(k2);
      uniq.push(p);
    }
    const take = uniq.slice(0, PER);
    companies.push({ domain, noInfra: take[0].noInfra, people: take, bestRank: take[0].rank, contacts: take[0].contacts });
  }
  const depthHist = {};
  for (const c of companies) depthHist[c.people.length] = (depthHist[c.people.length] || 0) + 1;
  console.log(`${companies.length} companies with at least one DM | depth available (DMs, capped at ${PER}):`,
    Object.entries(depthHist).map(([k, v]) => `${k}=${v}`).join('  '));

  // Deepest companies first: with several DMs per account, an account where we
  // hold three right seats beats three accounts where we hold one each.
  const order = (a, b) => b.people.length - a.people.length || a.bestRank - b.bestRank || b.contacts - a.contacts;
  const no = companies.filter((c) => c.noInfra).sort(order);
  const has = companies.filter((c) => !c.noInfra).sort(order);
  console.log(`  no infra owner ${no.length} companies | has infra owner ${has.length} companies`);

  function fill(pool, want) {
    const rows = [];
    let used = 0;
    for (const c of pool) {
      if (rows.length >= want) break;
      const room = want - rows.length;
      c.people.slice(0, room).forEach((p, i) => rows.push({ p, c, i }));
      used++;
    }
    return { rows, used };
  }

  // The split is a target, the size is the deliverable: if one bucket runs dry,
  // top up from the other rather than hand over a short file.
  const wantNo = Math.round(SIZE * SPLIT / 100);
  const a = fill(no, wantNo);
  const b = fill(has, SIZE - a.rows.length);
  const gap = SIZE - a.rows.length - b.rows.length;
  if (gap > 0) {
    const extra = fill(no.slice(a.used), gap);
    a.rows.push(...extra.rows);
    console.log(`  topped up ${extra.rows.length} rows from the no-infra bucket to reach ${SIZE}`);
  }
  const picked = [...a.rows, ...b.rows];
  if (picked.length < SIZE) console.log(`  !! pool exhausted: ${picked.length} of ${SIZE}`);

  // Group each company's rows together, primary contact first.
  const perDomain = {};
  for (const x of picked) perDomain[x.c.domain] = (perDomain[x.c.domain] || 0) + 1;
  picked.sort((x, y) => (x.c.domain < y.c.domain ? -1 : x.c.domain > y.c.domain ? 1 : x.i - y.i));
  // FullEnrich's upload template is exactly: First Name, Last Name, Website,
  // LinkedIn Profile URL (checked against their example.csv, 2026-09-12). Those
  // four lead under FullEnrich's own names; every other column rides along. Our
  // empty Phone column is dropped because FullEnrich writes its own phone columns.
  const out = picked.map((x) => {
    const { first_name, last_name, Domain, 'LinkedIn URL': li, Phone, ...rest } = x.p.row;
    return {
      'First Name': first_name,
      'Last Name': last_name,
      Website: Domain,
      'LinkedIn Profile URL': li,
      ...rest,
      'Contact Priority': x.i + 1,
      'DMs At Company': perDomain[x.c.domain],
    };
  });

  const cols = Object.keys(out[0]);
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  fs.writeFileSync(OUT, [cols.join(','), ...out.map((r) => cols.map((c) => esc(r[c])).join(','))].join('\n'));

  const rowsNo = picked.filter((x) => x.c.noInfra).length;
  const nCo = Object.keys(perDomain).length;
  const coNo = new Set(picked.filter((x) => x.c.noInfra).map((x) => x.c.domain)).size;
  console.log(`\nwrote ${picked.length} rows to ${OUT}`);
  console.log(`  ${nCo} companies, ${(picked.length / nCo).toFixed(2)} DMs per company on average`);
  console.log(`  rows: ${rowsNo} no infra owner (${Math.round(100 * rowsNo / picked.length)}%) | ${picked.length - rowsNo} has infra owner`);
  console.log(`  companies: ${coNo} no infra owner | ${nCo - coNo} has infra owner`);
})().catch((e) => { console.error(e); process.exit(1); });
