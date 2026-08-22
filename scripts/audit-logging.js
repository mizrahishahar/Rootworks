#!/usr/bin/env node
// Rootworks logging-standard audit.
// Walks every decompiled machine in n8n/ and reports, per workflow, the facts the
// ship check in .claude/skills/n8n-expert/logging-standard.md asks for:
// triggers, Error Logger attached, log-write nodes and their onError, Running stamp,
// literal Status, failed[] collected, Tally, client scoping, sub-workflow calls.
// Read-only; prints a report. Run after every pull, and before every push.
//
// Usage: node scripts/audit-logging.js [--json]

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'n8n');
const ERROR_LOGGER_ID = 'gqm6HzVNzEMQ8Ml0';
const AUTOMATIONS_TABLE = 'tbli7rV6Qf3sLpV6R';

const rows = [];
for (const dir of fs.readdirSync(ROOT).sort()) {
  const wfp = path.join(ROOT, dir, 'workflow.json');
  if (!fs.existsSync(wfp)) continue;
  const wf = JSON.parse(fs.readFileSync(wfp, 'utf8'));
  const nodes = wf.nodes || [];
  const nodesDir = path.join(ROOT, dir, 'nodes');
  const src = fs.existsSync(nodesDir)
    ? fs.readdirSync(nodesDir).map((f) => fs.readFileSync(path.join(nodesDir, f), 'utf8')).join('\n')
    : '';
  const all = JSON.stringify(nodes) + src;

  const triggers = nodes
    .filter((n) => /trigger|webhook/i.test(n.type))
    .map((n) => n.type.replace('n8n-nodes-base.', '').replace('@n8n/n8n-nodes-langchain.', ''));
  const logNodes = nodes
    .filter((n) => n.type === 'n8n-nodes-base.airtable' && JSON.stringify(n.parameters.table || '').includes(AUTOMATIONS_TABLE))
    .map((n) => ({ name: n.name, op: n.parameters.operation || '?', onError: n.onError || 'stopWorkflow' }));
  const calls = nodes.filter((n) => n.type === 'n8n-nodes-base.executeWorkflow').map((n) => n.name);

  rows.push({
    workflow: wf.name,
    id: wf.id,
    active: !!wf.active,
    triggers,
    isSubWorkflow: nodes.some((n) => n.type === 'n8n-nodes-base.executeWorkflowTrigger'),
    errorLogger: (wf.settings && wf.settings.errorWorkflow) === ERROR_LOGGER_ID,
    logNodes,
    // Only writes must be loud; reads of the launch row may continue (the row may not exist yet).
    silentLogWrite: logNodes.filter((l) => ['create', 'update', 'upsert'].includes(l.op) && l.onError !== 'stopWorkflow').map((l) => l.name),
    // Launched runs (form / Hub launch row) stamp Running; scheduled and event runs write their row at the end, by the Operator's ruling.
    launchable: nodes.some((n) => n.type === 'n8n-nodes-base.formTrigger' || (n.type === 'n8n-nodes-base.webhook' && /^launch-|-run$/.test(String((n.parameters || {}).path || '')))),
    stampsRunning: /['"]Running['"]/.test(all),
    literalSucceeded: /Status['"]?\s*[:=]\s*['"]Succeeded['"]/.test(all),
    collectsFailed: /failed\s*=\s*\[\]|failed\.push|failed\.length/.test(src),
    usesTally: /Tally/.test(all),
    clientScoped: /clientRecId|clientSlug|client_slug/.test(src),
    calls,
  });
}

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(rows, null, 2));
  process.exit(0);
}

for (const r of rows) {
  const flags = [];
  if (!r.isSubWorkflow && !r.errorLogger) flags.push('NO ERROR LOGGER');
  if (!r.isSubWorkflow && !r.logNodes.length) flags.push('NO LOG ROW');
  if (r.silentLogWrite.length) flags.push('SILENT LOG WRITE: ' + r.silentLogWrite.join(', '));
  if (r.literalSucceeded) flags.push('LITERAL SUCCEEDED');
  if (!r.isSubWorkflow && r.launchable && r.logNodes.length && !r.stampsRunning) flags.push('NO RUNNING STAMP (launchable)');
  console.log(`\n## ${r.workflow} (${r.id}) active=${r.active}${r.isSubWorkflow ? ' [helper]' : ''}`);
  console.log(`triggers=${r.triggers.join('+') || 'none'} errorLogger=${r.errorLogger} failed[]=${r.collectsFailed} tally=${r.usesTally} clientScoped=${r.clientScoped}`);
  console.log(`log nodes: ${r.logNodes.map((l) => `${l.name}[${l.op}|${l.onError}]`).join('; ') || 'none'}`);
  if (r.calls.length) console.log(`calls: ${r.calls.join(', ')}`);
  if (flags.length) console.log(`FLAGS: ${flags.join(' | ')}`);
}
const flagged = rows.filter((r) => !r.isSubWorkflow && (!r.errorLogger || !r.logNodes.length || r.silentLogWrite.length || r.literalSucceeded || (r.launchable && r.logNodes.length && !r.stampsRunning)));
console.log(`\n${rows.length} machines, ${flagged.length} flagged`);
