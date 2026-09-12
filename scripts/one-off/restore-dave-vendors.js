#!/usr/bin/env node
// Restore Dave's Vendors + Tech columns, lost in the 2026-09-02 migration.
//
// Root cause: migrate-client.js listed "Vendors" as an accepted drop (a ruling made for the
// Flowroots base, where Vendors was a frozen segment label) and that ruling applied to every
// base. On Dave's "B2B Tech 11-50 US - Contacts" Vendors was real per-company data feeding the
// Tech formula ({{tech}} merge variable). Both were left behind when the legacy table was dropped.
//
// Sources, merged by Domain (snapshot wins, CSV fills the rest):
//   1. the snapshot base "Dave Clayroots (September 2, 2026)": the legacy table's Domain, Vendors,
//      Vendor Scan Raw, and the Tech formula text (read from the meta API)
//   2. the DiscoLike export CSV: Domain, "Vendors:Vendors"
//
// Target: live Dave Companies gets Vendors (text), Vendor Scan Raw (long text, when it carried
// data) and Tech (the formula, verbatim). People gets Vendors and Tech as lookups through the
// Companies link, so the deploy doors read {{tech}} per person exactly as before.
//
// Usage:
//   node scripts/restore-dave-vendors.js --csv <path>            dry run: read, plan, report, write nothing
//   node scripts/restore-dave-vendors.js --csv <path> --apply    create the fields, write the values
//
// Auth: AIRTABLE_API_KEY, else ~/.config/rootworks/airtable-api-key. Needs schema.bases:write.

'use strict';
const fs = require('fs');
const path = require('path');

const API = 'https://api.airtable.com/v0';
const SNAP = 'appNuEXoiGL8IaecR';
const SNAP_TABLE = 'tblMZ6xsl3g2x2JgU';           // B2B Tech 11-50 US - Contacts (snapshot)
const LIVE = 'appyhuYMwaGUdIs3z';
const COMPANIES = 'tblkGqUnT9Gy8p0XG';
const PEOPLE = 'tblozINsOLiA184ql';
const PEOPLE_COMPANIES_LINK = 'fldF1yGFodv5Tci8G';
const OUT = path.join(__dirname, 'out');

const args = process.argv.slice(2);
const apply = args.includes('--apply');
const csvPath = args[args.indexOf('--csv') + 1];
if (!csvPath || !fs.existsSync(csvPath)) { console.error('need --csv <path>'); process.exit(1); }

function apiKey() {
  if (process.env.AIRTABLE_API_KEY) return process.env.AIRTABLE_API_KEY.trim();
  return fs.readFileSync(path.join(process.env.HOME, '.config', 'rootworks', 'airtable-api-key'), 'utf8').trim();
}
const KEY = apiKey();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let last = 0;
async function req(method, url, body) {
  for (let attempt = 1; ; attempt++) {
    const gap = 220 - (Date.now() - last); if (gap > 0) await sleep(gap); last = Date.now();
    const res = await fetch(url, { method, headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
    const text = await res.text();
    if (res.status === 429) { await sleep(30000); continue; }
    if (res.status >= 500 && attempt < 6) { await sleep(1000 * attempt); continue; }
    if (!res.ok) throw new Error(`${method} ${url} -> ${res.status}: ${text.slice(0, 400)}`);
    return text ? JSON.parse(text) : {};
  }
}
async function listAll(base, table, fields, label) {
  const out = []; let offset;
  do {
    const body = { pageSize: 100, fields };
    if (offset) body.offset = offset;
    const page = await req('POST', `${API}/${base}/${table}/listRecords`, body);
    out.push(...(page.records || [])); offset = page.offset;
    if (out.length % 5000 < 100) console.log(`  ${label}: ${out.length}`);
  } while (offset);
  return out;
}
const normDomain = (v) => { let s = String(v || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, ''); return s.split('/')[0].split('?')[0].split(':')[0].replace(/\.+$/, ''); };

// Minimal RFC-4180 CSV parser (quoted fields, doubled quotes, newlines inside quotes).
function parseCsv(text) {
  const rows = []; let row = []; let cell = ''; let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += c; }
    else if (c === '"') q = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
    else if (c !== '\r') cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  // 1. Formula text and field types from the snapshot.
  const snapMeta = (await req('GET', `${API}/meta/bases/${SNAP}/tables`)).tables.find((t) => t.id === SNAP_TABLE);
  const techF = snapMeta.fields.find((f) => f.name === 'Tech');
  const vendorsF = snapMeta.fields.find((f) => f.name === 'Vendors');
  const rawF = snapMeta.fields.find((f) => f.name === 'Vendor Scan Raw');
  // The meta API returns the formula with field ids; the new base has new ids, so it is re-expressed by name.
  const formula = String(techF.options && techF.options.formula || '').replace(new RegExp('\\{' + vendorsF.id + '\\}', 'g'), '{Vendors}');
  if (/\{fld/.test(formula)) throw new Error('Tech formula still references a field id: ' + formula);
  console.log('Tech formula (snapshot):\n' + formula + '\n');

  // 2. Snapshot rows.
  const snapRows = await listAll(SNAP, SNAP_TABLE, ['Domain', 'Vendors', 'Vendor Scan Raw'], 'snapshot');
  const bySnap = new Map();
  let snapVendors = 0, snapRaw = 0, snapConflicts = 0;
  for (const r of snapRows) {
    const d = normDomain(r.fields.Domain); if (!d) continue;
    const v = String(r.fields.Vendors || '').trim(); const raw = String(r.fields['Vendor Scan Raw'] || '').trim();
    if (!v && !raw) continue;
    const cur = bySnap.get(d);
    if (cur) { if (v && cur.Vendors && cur.Vendors !== v) snapConflicts++; if (!cur.Vendors) cur.Vendors = v; if (!cur.raw) cur.raw = raw; }
    else { bySnap.set(d, { Vendors: v, raw }); if (v) snapVendors++; if (raw) snapRaw++; }
  }
  console.log(`snapshot: ${snapRows.length} rows, ${bySnap.size} domains with data (Vendors on ${snapVendors}, Vendor Scan Raw on ${snapRaw}, conflicting duplicates ${snapConflicts})`);

  // 3. CSV rows.
  const csv = parseCsv(fs.readFileSync(csvPath, 'utf8').replace(/^﻿/, ''));
  const head = csv[0]; const iD = head.indexOf('Domain'); const iV = head.indexOf('Vendors:Vendors');
  if (iD < 0 || iV < 0) throw new Error('CSV lacks Domain or Vendors:Vendors');
  const byCsv = new Map();
  for (const r of csv.slice(1)) { const d = normDomain(r[iD]); const v = String(r[iV] || '').trim(); if (d && v && !byCsv.has(d)) byCsv.set(d, v); }
  console.log(`csv: ${csv.length - 1} rows, ${byCsv.size} domains with Vendors`);

  // 4. Merge: snapshot wins, CSV fills.
  const merged = new Map();
  for (const [d, x] of bySnap) merged.set(d, { Vendors: x.Vendors, raw: x.raw, src: 'snapshot' });
  let csvAdded = 0, csvAgree = 0, csvDiffer = 0;
  for (const [d, v] of byCsv) {
    const cur = merged.get(d);
    if (!cur) { merged.set(d, { Vendors: v, raw: '', src: 'csv' }); csvAdded++; }
    else if (!cur.Vendors) { cur.Vendors = v; cur.src += '+csv'; csvAdded++; }
    else if (cur.Vendors === v) csvAgree++; else csvDiffer++;
  }
  console.log(`merged: ${merged.size} domains (csv added ${csvAdded}, csv agreed ${csvAgree}, csv differed and snapshot kept ${csvDiffer})`);

  // 5. Live Companies.
  const liveMeta = (await req('GET', `${API}/meta/bases/${LIVE}/tables`)).tables;
  const co = liveMeta.find((t) => t.id === COMPANIES); const pe = liveMeta.find((t) => t.id === PEOPLE);
  const has = (t, n) => t.fields.find((f) => f.name === n);
  const companies = await listAll(LIVE, COMPANIES, ['Domain', ...(has(co, 'Vendors') ? ['Vendors'] : [])], 'companies');
  const liveByDomain = new Map();
  for (const r of companies) { const d = normDomain(r.fields.Domain); if (d && !liveByDomain.has(d)) liveByDomain.set(d, r); }
  const writes = []; const missing = [];
  for (const [d, x] of merged) {
    const r = liveByDomain.get(d);
    if (!r) { missing.push(d); continue; }
    if (r.fields.Vendors && String(r.fields.Vendors).trim() === x.Vendors) continue;
    const f = {}; if (x.Vendors) f.Vendors = x.Vendors; if (x.raw) f['Vendor Scan Raw'] = x.raw;
    writes.push({ id: r.id, fields: f });
  }
  console.log(`live Companies: ${companies.length} rows; to write ${writes.length}; merged domains with no Companies row ${missing.length}`);
  const report = { formula, snapshot: { rows: snapRows.length, domains: bySnap.size, snapVendors, snapRaw, snapConflicts }, csv: { rows: csv.length - 1, domains: byCsv.size, csvAdded, csvAgree, csvDiffer }, merged: merged.size, companies: companies.length, writes: writes.length, missing };
  fs.writeFileSync(path.join(OUT, `restore-dave-vendors-${Date.now()}.json`), JSON.stringify(report, null, 2));
  if (!apply) { console.log('dry run, nothing written. Missing sample:', missing.slice(0, 10)); return; }

  // 6. Fields on Companies.
  const desc = 'Client custom column, restored 2026-09-06 after the 2026-09-02 migration dropped it. ';
  const mk = async (table, body) => { const f = await req('POST', `${API}/meta/bases/${LIVE}/tables/${table}/fields`, body); console.log(`created ${f.name} (${f.id}) on ${table}`); return f; };
  if (!has(co, 'Vendors')) await mk(COMPANIES, { name: 'Vendors', type: 'singleLineText', description: desc + 'Vendor domains detected on the company (DiscoLike vendor-and-technology-data, Vendors:Vendors in the export). Feeds Tech. Sources: the September 2 snapshot of "B2B Tech 11-50 US - Contacts" and the DiscoLike export of the 4,358 validated companies.' });
  if (snapRaw && !has(co, 'Vendor Scan Raw')) await mk(COMPANIES, { name: 'Vendor Scan Raw', type: 'multilineText', description: desc + (rawF && rawF.description || '') });
  if (!has(co, 'Tech')) await mk(COMPANIES, { name: 'Tech', type: 'formula', description: desc + (techF.description || ''), options: { formula } });
  // 7. Values.
  let done = 0;
  for (let i = 0; i < writes.length; i += 10) {
    await req('PATCH', `${API}/${LIVE}/${COMPANIES}`, { records: writes.slice(i, i + 10) });
    done += Math.min(10, writes.length - i); if (done % 500 < 10) console.log(`  written ${done}/${writes.length}`);
  }
  console.log(`written ${done} Companies rows`);
  // 8. Lookups on People.
  const co2 = (await req('GET', `${API}/meta/bases/${LIVE}/tables`)).tables.find((t) => t.id === COMPANIES);
  for (const n of ['Vendors', 'Tech']) {
    if (has(pe, n)) continue;
    const src = has(co2, n);
    await mk(PEOPLE, { name: n, type: 'multipleLookupValues', description: desc + `Lookup of Companies.${n} through the Companies link.`, options: { recordLinkFieldId: PEOPLE_COMPANIES_LINK, fieldIdInLinkedTable: src.id } });
  }
  console.log('done');
})().catch((e) => { console.error(e.message); process.exit(1); });
