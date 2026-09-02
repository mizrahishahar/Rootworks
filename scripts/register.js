#!/usr/bin/env node
// Rootworks field register compiler.
// Compiles REGISTER.md at the repo root from the one field register,
// n8n/Onboard-Client/nodes/Scaffold-Register.js: per table, every field with its type, options
// (select choices with their colors), and kind, then the declared extras groups and the palettes.
// Generated from the register; never hand-edited. The way SCHEMA.md is compiled from the Hub.
//
// Also the loader the other scripts share: loadRegister() evaluates the register file in a
// sandbox (it is an n8n Code node, so it ends with a top-level return) and hands back its data.
// n8n-push.js inlines it wherever a node carries `// @@register`; register-audit.js reads a base
// against it.
//
// Usage: node scripts/register.js

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const REGISTER_PATH = path.join(ROOT, 'n8n', 'Onboard-Client', 'nodes', 'Scaffold-Register.js');

function loadRegister() {
  const src = fs.readFileSync(REGISTER_PATH, 'utf8');
  const out = vm.runInNewContext('(function () {\n' + src + '\n})()', {}, { filename: REGISTER_PATH });
  const json = Array.isArray(out) && out[0] && out[0].json;
  if (!json || !Array.isArray(json.tables)) throw new Error(`${REGISTER_PATH} did not return [{ json: { tables } }]`);
  return json;
}

// The Airtable type a register field lands as, by kind.
function airtableType(f) {
  switch (f.kind) {
    case 'plain': return f.type;
    case 'formula': return 'formula';
    case 'link': case 'mirrorLink': return 'multipleRecordLinks';
    case 'lookup': return 'multipleLookupValues';
    case 'count': return 'count';
    case 'rollup': return 'rollup';
    default: return f.type || f.kind;
  }
}

// The fields a group brings to a table, deduplicated by name (Trustpilot Rating sits in two groups).
function extrasFor(reg, tableName) {
  const seen = new Map();
  for (const g of reg.extras || []) {
    if (g.table !== tableName) continue;
    for (const f of g.fields) if (!seen.has(f.name)) seen.set(f.name, { ...f, group: g.group, owner: g.owner });
  }
  return [...seen.values()];
}

const clean = (s) => String(s || '').replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim();

function options(f) {
  const o = f.options || {};
  switch (f.kind) {
    case 'plain':
      if (f.type === 'singleSelect') return (o.choices || []).map((c) => c.color ? `${c.name} (${c.color})` : c.name).join(', ');
      if (f.type === 'dateTime') return `${o.dateFormat && o.dateFormat.name}, ${o.timeFormat && o.timeFormat.name}, ${o.timeZone}`;
      if (f.type === 'date') return `${o.dateFormat && o.dateFormat.name}`;
      if (f.type === 'number') return `precision ${o.precision}`;
      if (f.type === 'checkbox') return `${o.color} ${o.icon}`;
      return '';
    case 'formula': return '`' + f.formula + '`';
    case 'link': return `to ${f.table}`;
    case 'mirrorLink': return `to the client's synced ${f.mirror} mirror`;
    case 'lookup': return `${f.via}.${f.field}`;
    case 'count': return `of ${f.via}`;
    case 'rollup': return `${f.via}.${f.field}, \`${f.formula}\``;
    default: return '';
  }
}

function compile(reg) {
  const rel = path.relative(ROOT, REGISTER_PATH);
  const lines = [
    '# Field register',
    '',
    `Compiled from \`${rel}\` by \`scripts/register.js\`. Do not hand-edit.`,
    'This file is what every client base\'s tables ARE; why they exist lives in Flowroots/Operations/Field Standard.md and List Building 2.0.md.',
    'Core fields are born at the scaffold. Declared extras are created only by their owner machine. Anything else on a base is the Operator\'s.',
    '',
  ];
  for (const t of reg.tables) {
    lines.push(`## ${t.name}`, '', `Primary field: ${t.primary}. ${t.fields.length} fields.`, '');
    lines.push('| Field | Type | Options | Kind |', '|---|---|---|---|');
    for (const f of t.fields) lines.push(`| ${clean(f.name)} | ${airtableType(f)} | ${clean(options(f))} | ${f.kind} |`);
    lines.push('');
    const groups = (reg.extras || []).filter((g) => g.table === t.name);
    if (groups.length) {
      lines.push(`### Declared extras on ${t.name}`, '', '| Group | Owner | Field | Type | Options |', '|---|---|---|---|---|');
      for (const g of groups) for (const f of g.fields) lines.push(`| ${clean(g.group)} | ${clean(g.owner)} | ${clean(f.name)} | ${airtableType(f)} | ${clean(options(f))} |`);
      lines.push('');
    }
  }
  if (reg.palettes) {
    lines.push('## Palettes', '', 'A select carries a color only when the value is a verdict, a scale, or a source; a plain category is gray.', '');
    for (const [name, p] of Object.entries(reg.palettes)) {
      if (typeof p === 'string') { lines.push(`- **${name}**: ${p}, every value`); continue; }
      const byColor = new Map();
      for (const [v, c] of Object.entries(p)) byColor.set(c, [...(byColor.get(c) || []), v]);
      lines.push(`- **${name}**: ${[...byColor].map(([c, vs]) => `${vs.join(', ')} ${c}`).join('; ')}`);
    }
    lines.push('');
  }
  return lines.join('\n');
}

module.exports = { REGISTER_PATH, loadRegister, airtableType, extrasFor };

if (require.main === module) {
  try {
    const reg = loadRegister();
    fs.writeFileSync(path.join(ROOT, 'REGISTER.md'), compile(reg));
    const fields = reg.tables.reduce((n, t) => n + t.fields.length, 0);
    console.log(`${reg.tables.length} tables, ${fields} fields, ${(reg.extras || []).length} extras groups -> REGISTER.md`);
  } catch (e) { console.error(e.message); process.exit(1); }
}
