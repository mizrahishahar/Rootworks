#!/usr/bin/env node
// Relink People to Companies by Domain, creating the Companies rows that People-only domains lack,
// and gap-filling Companies from the stored company columns People still carry. Built 2026-09-07
// for the Adelante repair: 28,590 People rows had no Companies link, so the lookups that replaced
// their stored company columns came up empty. Runs on any base that still holds stored company
// columns on People (the pre-lookup shape). Companies is never overwritten; People gets only the
// Companies link written.
//
// Usage: node scripts/relink-people-by-domain.js --base appXXX            dry run: counts
//        node scripts/relink-people-by-domain.js --base appXXX --apply    write
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
    const gap = 210 - (Date.now() - last); if (gap > 0) await sleep(gap); last = Date.now();
    let res, text;
    try { res = await fetch(url, { method, headers: H, body: body ? JSON.stringify(body) : undefined }); text = await res.text(); }
    catch (e) { if (a < 8) { await sleep(2000 * a); continue; } throw e; }
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
const norm = (d) => String(d || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '').replace(/^mailto:/, '');
const empty = (v) => v === undefined || v === null || v === '' || (Array.isArray(v) && !v.length);
const NEVER = new Set(['Name', 'Email', 'Status', 'MV P0', 'BB', 'Final Email', 'Messages Sent', 'Last Contacted', 'Campaign Status', 'Bounce Reason', 'Synced At', 'Deploy Error', 'manually_approved', 'relevance', 'Campaigns', 'Build Date', 'Contact Source', 'Contacts Pulled At', 'Signal At']);
const WRITABLE = new Set(['singleLineText', 'multilineText', 'richText', 'email', 'url', 'phoneNumber', 'number', 'currency', 'percent', 'singleSelect', 'multipleSelects', 'checkbox', 'date', 'dateTime']);
function coerce(cf, pv) {
  let v = Array.isArray(pv) ? pv[0] : pv; if (empty(v)) return undefined;
  if (cf.type === 'singleSelect') { const ok = (cf.options.choices || []).some((ch) => ch.name === String(v)); return ok ? String(v) : undefined; }
  if (['number', 'currency', 'percent'].includes(cf.type)) { const n = Number(String(v).replace(/[,$]/g, '')); return Number.isFinite(n) ? n : undefined; }
  if (['singleLineText', 'multilineText', 'richText', 'url', 'email', 'phoneNumber'].includes(cf.type)) return String(v);
  if (cf.type === 'checkbox') return !!v;
  return undefined;
}
(async () => {
  const meta = (await req('GET', `${API}/meta/bases/${base}/tables`)).tables;
  const co = meta.find((t) => t.name === 'Companies'); const pe = meta.find((t) => t.name === 'People');
  const coF = new Map(co.fields.map((f) => [f.name, f]));
  const cols = pe.fields.filter((f) => f.type !== 'multipleLookupValues' && f.type !== 'formula' && f.type !== 'multipleRecordLinks' && !NEVER.has(f.name) && coF.has(f.name) && WRITABLE.has(coF.get(f.name).type)).map((f) => f.name);
  if (!cols.includes('Domain')) throw new Error('People carries no stored Domain column; nothing to relink by');
  console.log('company columns carried on People:', cols.join(', '));
  const people = await listAll(pe.id, { fields: ['Companies', ...cols] }, 'people');
  const companies = await listAll(co.id, { fields: cols }, 'companies');
  const coByDomain = new Map(); let dupCo = 0;
  for (const c of companies) { const d = norm(c.fields.Domain); if (!d) continue; if (coByDomain.has(d)) { dupCo++; continue; } coByDomain.set(d, c); }
  const stats = { people: people.length, companies: companies.length, dupCompanyDomains: dupCo, alreadyLinked: 0, noDomain: 0, linkToExisting: 0, needNewCompany: 0, newCompanies: 0 };
  const link = []; const newCo = new Map(); const gap = new Map(); const per = {};
  for (const p of people) {
    if (!empty(p.fields.Companies)) { stats.alreadyLinked++; continue; }
    const d = norm(p.fields.Domain); if (!d) { stats.noDomain++; continue; }
    const c = coByDomain.get(d);
    if (c) {
      stats.linkToExisting++; link.push({ id: p.id, domain: d, existing: c.id });
      for (const col of cols) { if (col === 'Domain') continue; if (!empty(c.fields[col])) continue; const v = coerce(coF.get(col), p.fields[col]); if (v === undefined) continue; const w = gap.get(c.id) || {}; if (w[col] !== undefined) continue; w[col] = v; gap.set(c.id, w); per[col] = (per[col] || 0) + 1; }
    } else {
      stats.needNewCompany++; link.push({ id: p.id, domain: d });
      let w = newCo.get(d); if (!w) { w = { Domain: d }; newCo.set(d, w); }
      for (const col of cols) { if (col === 'Domain') continue; if (w[col] !== undefined) continue; const v = coerce(coF.get(col), p.fields[col]); if (v !== undefined) w[col] = v; }
    }
  }
  stats.newCompanies = newCo.size;
  console.log(JSON.stringify(stats, null, 1));
  console.log(`gap-fill on existing Companies: ${gap.size} rows`); for (const [k, n] of Object.entries(per).sort((a, b) => b[1] - a[1])) console.log(`  ${k}: ${n}`);
  if (!apply) { console.log('dry run, nothing written'); return; }
  // 1. create the missing Companies rows
  const created = new Map(); const toCreate = [...newCo.values()]; let done = 0;
  for (let i = 0; i < toCreate.length; i += 10) {
    const chunk = toCreate.slice(i, i + 10);
    const r = await req('POST', `${API}/${base}/${co.id}`, { records: chunk.map((fields) => ({ fields })) });
    r.records.forEach((rec, k) => created.set(chunk[k].Domain, rec.id));
    done += chunk.length; if (done % 500 < 10) console.log(`  created ${done}/${toCreate.length}`);
  }
  console.log(`created ${created.size} Companies rows`);
  // 2. gap-fill existing Companies
  const gw = [...gap].map(([id, fields]) => ({ id, fields })); done = 0;
  for (let i = 0; i < gw.length; i += 10) { await req('PATCH', `${API}/${base}/${co.id}`, { records: gw.slice(i, i + 10) }); done += Math.min(10, gw.length - i); if (done % 500 < 10) console.log(`  gap-filled ${done}/${gw.length}`); }
  console.log(`gap-filled ${done} Companies rows`);
  // 3. link People
  const lw = []; let unresolved = 0;
  for (const l of link) { const cid = l.existing || created.get(l.domain); if (!cid) { unresolved++; continue; } lw.push({ id: l.id, fields: { Companies: [cid] } }); }
  done = 0;
  for (let i = 0; i < lw.length; i += 10) { await req('PATCH', `${API}/${base}/${pe.id}`, { records: lw.slice(i, i + 10) }); done += Math.min(10, lw.length - i); if (done % 1000 < 10) console.log(`  linked ${done}/${lw.length}`); }
  console.log(`linked ${done} People rows; unresolved ${unresolved}`);
})().catch((e) => { console.error(e.message); process.exit(1); });
