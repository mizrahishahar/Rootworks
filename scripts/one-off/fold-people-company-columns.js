#!/usr/bin/env node
// Fold stored company columns on People into Companies, so the stored columns can be deleted and
// replaced by lookups (the On People rule, Field Standard law 7). For every People row linked to a
// Companies row, every named column whose Companies cell is EMPTY and whose People cell is not is
// written to Companies. Companies is never overwritten; People is never written. After this the
// stored People columns carry nothing Companies lacks, and deleting them loses nothing.
//
// Usage: node scripts/fold-people-company-columns.js --base appXXX              dry run: counts per column
//        node scripts/fold-people-company-columns.js --base appXXX --apply      write
//        --columns "A,B"   restrict to these columns (default: every column present as a stored,
//                          non-lookup field on People AND as a writable field on Companies)
'use strict';
const fs = require('fs');
const path = require('path');
const API = 'https://api.airtable.com/v0';
const args = process.argv.slice(2);
const base = args[args.indexOf('--base') + 1];
const apply = args.includes('--apply');
const only = args.includes('--columns') ? args[args.indexOf('--columns') + 1].split(',').map((s) => s.trim()).filter(Boolean) : null;
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
const empty = (v) => v === undefined || v === null || v === '' || (Array.isArray(v) && !v.length);
const NEVER = new Set(['Name', 'Email', 'Status', 'MV P0', 'BB', 'Final Email', 'Messages Sent', 'Last Contacted', 'Campaign Status', 'Bounce Reason', 'Synced At', 'Deploy Error', 'manually_approved', 'relevance', 'Campaigns', 'Build Date', 'Contact Source', 'Domain']);
const WRITABLE = new Set(['singleLineText', 'multilineText', 'richText', 'email', 'url', 'phoneNumber', 'number', 'currency', 'percent', 'singleSelect', 'multipleSelects', 'checkbox', 'date', 'dateTime']);
(async () => {
  const meta = (await req('GET', `${API}/meta/bases/${base}/tables`)).tables;
  const co = meta.find((t) => t.name === 'Companies'); const pe = meta.find((t) => t.name === 'People');
  const coF = new Map(co.fields.map((f) => [f.name, f]));
  let cols = pe.fields.filter((f) => f.type !== 'multipleLookupValues' && f.type !== 'formula' && !NEVER.has(f.name) && coF.has(f.name) && WRITABLE.has(coF.get(f.name).type)).map((f) => f.name);
  if (only) cols = cols.filter((c) => only.includes(c));
  console.log('columns:', cols.join(', '));
  const people = await listAll(pe.id, { fields: ['Companies', ...cols] }, 'people');
  const companies = await listAll(co.id, { fields: cols }, 'companies');
  const coById = new Map(companies.map((r) => [r.id, r]));
  const plan = new Map(); const per = {}; let conflicts = 0;
  for (const p of people) {
    const cid = (p.fields.Companies || [])[0]; if (!cid) continue; const c = coById.get(cid); if (!c) continue;
    for (const col of cols) {
      const pv = p.fields[col]; if (empty(pv)) continue;
      const cv = c.fields[col];
      if (!empty(cv)) { if (String(cv) !== String(pv)) conflicts++; continue; }
      const w = plan.get(cid) || {}; if (w[col] !== undefined) continue;
      const cf = coF.get(col); let v = pv;
      if (cf.type === 'singleSelect') { const ok = (cf.options.choices || []).some((ch) => ch.name === String(pv)); if (!ok) continue; }
      if (cf.type === 'number') { v = Number(pv); if (!Number.isFinite(v)) continue; }
      if (['singleLineText', 'multilineText', 'url', 'email'].includes(cf.type)) v = String(pv);
      w[col] = v; plan.set(cid, w); per[col] = (per[col] || 0) + 1;
    }
  }
  console.log(`people ${people.length} | companies ${companies.length} | companies to gap-fill ${plan.size} | conflicts (both filled, differ, Companies kept) ${conflicts}`);
  for (const [k, n] of Object.entries(per).sort((a, b) => b[1] - a[1])) console.log(`  ${k}: ${n}`);
  if (!apply) { console.log('dry run, nothing written'); return; }
  const writes = [...plan].map(([id, fields]) => ({ id, fields })); let done = 0;
  for (let i = 0; i < writes.length; i += 10) { await req('PATCH', `${API}/${base}/${co.id}`, { records: writes.slice(i, i + 10) }); done += Math.min(10, writes.length - i); if (done % 500 < 10) console.log(`  written ${done}/${writes.length}`); }
  console.log(`gap-filled ${done} Companies rows`);
})().catch((e) => { console.error(e.message); process.exit(1); });
