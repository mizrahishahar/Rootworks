#!/usr/bin/env node
// Backfill Contacts Pulled At on every Companies row that already holds people but was never
// stamped (ruled 2026-09-06). The register's meaning: Not Sourced = Contacts Pulled At empty =
// the machine never tried this company; Not Covered = tried and 0. A migrated company that
// arrived with its people was tried by the old builders, so it gets the stamp: the EARLIEST Build
// Date among its linked People, the day its people were first pulled. Companies with no people
// are left alone: they truly are Not Sourced.
//
// Usage: node scripts/stamp-contacts-pulled-at.js --base appXXX            dry run
//        node scripts/stamp-contacts-pulled-at.js --base appXXX --apply    write
// Auth: AIRTABLE_API_KEY or ~/.config/rootworks/airtable-api-key.
'use strict';
const fs = require('fs');
const path = require('path');
const API = 'https://api.airtable.com/v0';
const args = process.argv.slice(2);
const base = args[args.indexOf('--base') + 1];
const apply = args.includes('--apply');
if (!/^app[A-Za-z0-9]{14}$/.test(base || '')) { console.error('need --base appXXX'); process.exit(1); }
const KEY = process.env.AIRTABLE_API_KEY || fs.readFileSync(path.join(process.env.HOME, '.config', 'rootworks', 'airtable-api-key'), 'utf8').trim();
const H = { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let last = 0;
async function req(method, url, body) {
  for (let a = 1; ; a++) {
    const gap = 220 - (Date.now() - last); if (gap > 0) await sleep(gap); last = Date.now();
    const res = await fetch(url, { method, headers: H, body: body ? JSON.stringify(body) : undefined });
    const text = await res.text();
    if (res.status === 429) { await sleep(30000); continue; }
    if (res.status >= 500 && a < 6) { await sleep(1000 * a); continue; }
    if (!res.ok) throw new Error(`${method} ${url} -> ${res.status}: ${text.slice(0, 300)}`);
    return text ? JSON.parse(text) : {};
  }
}
async function listAll(table, body, label) {
  const out = []; let offset;
  do { const b = { pageSize: 100, ...body }; if (offset) b.offset = offset; const page = await req('POST', `${API}/${base}/${table}/listRecords`, b); out.push(...(page.records || [])); offset = page.offset; if (out.length % 10000 < 100) console.log(`  ${label}: ${out.length}`); } while (offset);
  return out;
}
(async () => {
  const meta = (await req('GET', `${API}/meta/bases/${base}/tables`)).tables;
  const co = meta.find((t) => t.name === 'Companies'); const pe = meta.find((t) => t.name === 'People');
  if (!co || !pe) throw new Error('no Companies/People');
  const need = (t, n) => { if (!t.fields.find((f) => f.name === n)) throw new Error(`${t.name} lacks ${n}`); };
  need(co, 'Contacts Pulled At'); need(co, 'Contacts Count'); need(pe, 'Companies'); need(pe, 'Build Date');
  const people = await listAll(pe.id, { fields: ['Companies', 'Build Date'] }, 'people');
  const first = new Map();
  for (const r of people) { const d = r.fields['Build Date']; for (const id of (r.fields.Companies || [])) { if (!d) continue; if (!first.has(id) || d < first.get(id)) first.set(id, d); } }
  const companies = await listAll(co.id, { fields: ['Domain', 'Contacts Pulled At', 'Contacts Count'], filterByFormula: 'AND(NOT({Contacts Pulled At}), {Contacts Count} > 0)' }, 'companies unstamped with people');
  const writes = []; let noDate = 0;
  for (const c of companies) { const d = first.get(c.id); if (!d) { noDate++; continue; } writes.push({ id: c.id, fields: { 'Contacts Pulled At': new Date(d).toISOString() } }); }
  console.log(`people ${people.length} | companies unstamped with people ${companies.length} | to stamp ${writes.length} | no people date found ${noDate}`);
  if (!apply) { console.log('dry run, nothing written'); return; }
  let done = 0;
  for (let i = 0; i < writes.length; i += 10) { await req('PATCH', `${API}/${base}/${co.id}`, { records: writes.slice(i, i + 10) }); done += Math.min(10, writes.length - i); if (done % 500 < 10) console.log(`  stamped ${done}/${writes.length}`); }
  console.log(`stamped ${done} companies`);
})().catch((e) => { console.error(e.message); process.exit(1); });
