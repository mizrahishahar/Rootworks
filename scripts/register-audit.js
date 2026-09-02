#!/usr/bin/env node
// Rootworks field register audit.
// Reads one client base's meta through the Airtable API and measures it against the field
// register (n8n/Onboard-Client/nodes/Scaffold-Register.js). Per table (Companies, People, DNC):
//   missing   columns on the register the base lacks
//   drift     columns on the base that are neither on the register nor in a declared extras group
//   type      columns whose Airtable type differs from the register's
//   select    selects whose choice names or colors differ from the register (each choice, both colors)
// Read-only; writes nothing anywhere. Exit 1 when anything is off, 0 when clean.
// Run before a migration and before a deploy door touches a new base.
//
// Usage: node scripts/register-audit.js --base appXXX [--table Name]
// Auth: AIRTABLE_API_KEY env var, or ~/.config/rootworks/airtable-api-key
//       (a PAT with scope schema.bases:read on the base).

const fs = require('fs');
const path = require('path');
const { loadRegister, airtableType, extrasFor } = require('./register');

function apiKey() {
  if (process.env.AIRTABLE_API_KEY) return process.env.AIRTABLE_API_KEY.trim();
  const p = path.join(process.env.HOME, '.config', 'rootworks', 'airtable-api-key');
  try { return fs.readFileSync(p, 'utf8').trim(); } catch {
    console.error('No API key. Set AIRTABLE_API_KEY or write it to ~/.config/rootworks/airtable-api-key');
    process.exit(1);
  }
}

function arg(flag) { const i = process.argv.indexOf(flag); return i > -1 ? process.argv[i + 1] : undefined; }
const baseId = arg('--base');
const only = arg('--table');
if (!baseId || !/^app[A-Za-z0-9]{14}$/.test(baseId)) { console.error('Usage: node scripts/register-audit.js --base appXXX [--table Name]'); process.exit(1); }

const q = (s) => `"${s}"`;
const list = (xs) => xs.map(q).join(', ');

// The reverse link Airtable creates on the far table of every register link (People.Companies
// puts a "People" column on Companies); the register reads through it (count and rollup via
// People), so it is expected, never drift.
function impliedLinks(reg, tableName) {
  const out = [];
  for (const t of reg.tables) for (const f of t.fields) {
    if (f.kind === 'link' && f.table === tableName) out.push({ name: t.name, kind: 'link', table: t.name, implied: true });
  }
  return out;
}

function auditTable(rt, bt, reg) {
  const issues = [];
  const core = rt.fields;
  const extras = extrasFor(reg, rt.name);
  const declared = new Map([...core, ...extras, ...impliedLinks(reg, rt.name)].map((f) => [f.name, f]));
  const declaredCI = new Map([...declared.keys()].map((n) => [n.toLowerCase(), n]));
  const base = new Map(bt.fields.map((f) => [f.name, f]));

  const missing = core.filter((f) => !base.has(f.name)).map((f) => f.name);
  if (missing.length) issues.push(`- missing (${missing.length}): ${list(missing)}`);

  const drift = bt.fields.filter((f) => !declared.has(f.name)).map((f) => {
    const twin = declaredCI.get(f.name.toLowerCase());
    return twin ? `${f.name} (case variant of ${q(twin)})` : f.name;
  });
  if (drift.length) issues.push(`- drift (${drift.length}): ${drift.map((d) => d.includes(' (case variant') ? d : q(d)).join(', ')}`);

  const types = [];
  for (const f of declared.values()) {
    const b = base.get(f.name); if (!b) continue;
    const want = airtableType(f);
    if (b.type !== want) types.push(`${q(f.name)}: register ${want}, base ${b.type}`);
  }
  if (types.length) issues.push(`- type (${types.length}): ${types.join('; ')}`);

  for (const f of declared.values()) {
    if (f.kind !== 'plain' || f.type !== 'singleSelect') continue;
    const b = base.get(f.name); if (!b || b.type !== 'singleSelect') continue;
    const want = (f.options && f.options.choices) || [];
    const have = new Map(((b.options && b.options.choices) || []).map((c) => [c.name, c]));
    const diffs = [];
    for (const c of want) {
      const h = have.get(c.name);
      if (!h) { diffs.push(`${q(c.name)} missing`); continue; }
      const hc = h.color || '(none)';
      if (c.color && hc !== c.color) diffs.push(`${q(c.name)} register ${c.color}, base ${hc}`);
    }
    for (const name of have.keys()) if (!want.some((c) => c.name === name)) diffs.push(`${q(name)} not on the register`);
    if (diffs.length) issues.push(`- select ${f.name} (${diffs.length}): ${diffs.join('; ')}`);
  }
  return issues;
}

(async () => {
  const reg = loadRegister();
  const res = await fetch(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, { headers: { Authorization: `Bearer ${apiKey()}` } });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  const { tables } = await res.json();
  const targets = reg.tables.filter((t) => !only || t.name === only);
  if (!targets.length) throw new Error(`"${only}" is not a register table (${reg.tables.map((t) => t.name).join(', ')})`);

  console.log(`# register audit: ${baseId}`);
  let off = 0;
  for (const rt of targets) {
    const bt = tables.find((t) => t.name === rt.name);
    if (!bt) { console.log(`\n## ${rt.name}\n- table missing`); off++; continue; }
    const issues = auditTable(rt, bt, reg);
    console.log(`\n## ${rt.name} (${bt.id}) ${bt.fields.length} columns`);
    if (!issues.length) { console.log('- clean'); continue; }
    for (const line of issues) console.log(line);
    off += issues.length;
  }
  console.log(off ? `\n${off} finding(s); the base is off the register.` : '\nclean; the base matches the register.');
  process.exit(off ? 1 : 0);
})().catch((e) => { console.error(e.message); process.exit(1); });
