#!/usr/bin/env node
// Rootworks n8n decompiler - PUSH.
// Recompiles a decompiled workflow folder (workflow.json + nodes/*.js) and updates
// the live workflow in n8n. Pushes ONE workflow per invocation, deliberately.
//
// Usage:
//   node tools/n8n/push.js n8n/<workflow-slug>            update the live workflow
//   node tools/n8n/push.js n8n/<workflow-slug> --dry      print the payload summary, send nothing
//
// Auth: N8N_API_KEY env var, or ~/.config/rootworks/n8n-api-key (one line).
// The key never lives in this repo.

const fs = require('fs');
const path = require('path');

const BASE = process.env.N8N_URL || 'https://n8n.flowroots.com';

function apiKey() {
  if (process.env.N8N_API_KEY) return process.env.N8N_API_KEY.trim();
  const p = path.join(process.env.HOME, '.config', 'rootworks', 'n8n-api-key');
  try { return fs.readFileSync(p, 'utf8').trim(); } catch {
    console.error('No API key. Set N8N_API_KEY or write it to ~/.config/rootworks/n8n-api-key');
    process.exit(1);
  }
}

const dirArg = process.argv[2];
const dry = process.argv.includes('--dry');
if (!dirArg) { console.error('Usage: node tools/n8n/push.js n8n/<workflow-slug> [--dry]'); process.exit(1); }

const dir = path.resolve(dirArg);
const doc = JSON.parse(fs.readFileSync(path.join(dir, 'workflow.json'), 'utf8'));

let inlined = 0;
for (const node of doc.nodes || []) {
  for (const [param, value] of Object.entries(node.parameters || {})) {
    if (typeof value === 'string' && value.startsWith('@@file:')) {
      const file = path.join(dir, value.slice('@@file:'.length));
      node.parameters[param] = fs.readFileSync(file, 'utf8');
      inlined++;
    }
  }
}

// The PUT schema rejects settings keys the GET returns (availableInMCP, binaryMode...).
const ALLOWED_SETTINGS = ['saveExecutionProgress', 'saveManualExecutions', 'saveDataErrorExecution', 'saveDataSuccessExecution', 'executionTimeout', 'errorWorkflow', 'timezone', 'executionOrder'];
const settings = {};
for (const k of ALLOWED_SETTINGS) if (doc.settings && doc.settings[k] !== undefined) settings[k] = doc.settings[k];

const payload = {
  name: doc.name,
  nodes: doc.nodes,
  connections: doc.connections,
  settings,
};

console.log(`workflow: ${doc.name} (${doc.id || 'NEW - will be created'})`);
console.log(`nodes: ${payload.nodes.length}, code files inlined: ${inlined}`);
if (dry) { console.log('dry run, nothing sent'); process.exit(0); }

(async () => {
  if (!doc.id) {
    // Brand-new machine: create it, then write the assigned id back into workflow.json
    // so every later push is an update. New workflows arrive inactive with no creds
    // attached to HTTP nodes; the Operator activates and attaches in the UI.
    const res = await fetch(`${BASE}/api/v1/workflows`, {
      method: 'POST',
      headers: { 'X-N8N-API-KEY': apiKey(), 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`POST /workflows -> HTTP ${res.status}: ${await res.text()}`);
    const out = await res.json();
    const src = JSON.parse(fs.readFileSync(path.join(dir, 'workflow.json'), 'utf8'));
    src.id = out.id;
    fs.writeFileSync(path.join(dir, 'workflow.json'), JSON.stringify(src, null, 2) + '\n');
    console.log(`created: ${out.name} (${out.id}), id written back to workflow.json`);
    console.log('NOTE: new workflow is INACTIVE. Activate it and attach HTTP-node credentials in the UI.');
    return;
  }
  const res = await fetch(`${BASE}/api/v1/workflows/${doc.id}`, {
    method: 'PUT',
    headers: { 'X-N8N-API-KEY': apiKey(), 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`PUT /workflows/${doc.id} -> HTTP ${res.status}: ${await res.text()}`);
  const out = await res.json();
  console.log(`updated: ${out.name} (versionId ${out.versionId})`);
  console.log('NOTE: n8n PUT updates the draft. If the workflow is published, publish the new version in the UI or via MCP.');
})().catch((e) => { console.error(e.message); process.exit(1); });
