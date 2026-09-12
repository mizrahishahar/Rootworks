#!/usr/bin/env node
// Rootworks graph reader.
// Prints one decompiled machine as a compact graph: every node (name, type, the
// parameters that matter) and every edge, without the activeVersion duplicate and
// the Airtable schema blocks that make workflow.json unreadable at a glance.
// Read-only. The way to read a machine before editing it.
//
// Usage: node scripts/graph.js n8n/<workflow-slug> [--params]

const fs = require('fs');
const path = require('path');

const dirArg = process.argv[2];
const showParams = process.argv.includes('--params');
if (!dirArg) { console.error('Usage: node scripts/graph.js n8n/<workflow-slug> [--params]'); process.exit(1); }
const wf = JSON.parse(fs.readFileSync(path.join(path.resolve(dirArg), 'workflow.json'), 'utf8'));

const brief = (n) => {
  const p = n.parameters || {};
  const t = n.type.replace('n8n-nodes-base.', '').replace('@n8n/n8n-nodes-langchain.', '');
  const bits = [];
  if (p.path) bits.push(`path=${p.path}`);
  if (p.httpMethod) bits.push(p.httpMethod);
  if (p.operation) bits.push(`op=${p.operation}`);
  if (p.table && p.table.value) bits.push(`table=${p.table.value}`);
  if (p.base && p.base.value) bits.push(`base=${p.base.value}`);
  if (p.url) bits.push(`url=${String(p.url).slice(0, 90)}`);
  if (p.filterByFormula) bits.push(`filter=${String(p.filterByFormula).slice(0, 120)}`);
  if (p.jsCode) bits.push(p.jsCode.startsWith('@@file:') ? p.jsCode : 'inline code');
  if (p.workflowId && p.workflowId.value) bits.push(`calls=${p.workflowId.value}`);
  if (p.rule && p.rule.interval) bits.push(`schedule=${JSON.stringify(p.rule.interval)}`);
  if (p.columns && p.columns.matchingColumns && p.columns.matchingColumns.length) bits.push(`match=${p.columns.matchingColumns.join(',')}`);
  if (p.columns && p.columns.mappingMode) bits.push(`map=${p.columns.mappingMode}`);
  if (n.onError) bits.push(`onError=${n.onError}`);
  if (n.alwaysOutputData) bits.push('alwaysOutput');
  if (n.disabled) bits.push('DISABLED');
  return `${n.name}  [${t}${n.typeVersion ? ' v' + n.typeVersion : ''}]${bits.length ? '  ' + bits.join(' | ') : ''}`;
};

console.log(`# ${wf.name} (${wf.id || 'NEW'}) active=${wf.active} errorWorkflow=${(wf.settings || {}).errorWorkflow || '-'}`);
console.log('\n## nodes');
for (const n of wf.nodes || []) {
  console.log('- ' + brief(n));
  if (showParams) console.log('    ' + JSON.stringify(n.parameters).slice(0, 600));
}
console.log('\n## edges');
for (const [from, outs] of Object.entries(wf.connections || {})) {
  for (const [kind, lanes] of Object.entries(outs)) {
    lanes.forEach((lane, i) => {
      for (const e of lane || []) console.log(`- ${from} -[${kind}${lanes.length > 1 ? ' out' + i : ''}]-> ${e.node}${e.index ? ' (in' + e.index + ')' : ''}`);
    });
  }
}
