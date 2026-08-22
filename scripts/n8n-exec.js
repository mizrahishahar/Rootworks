#!/usr/bin/env node
// Rootworks execution reader.
// Prints one execution's per-node output through the public API, compactly: status, timing,
// and for each node (or only the named ones) the first item of each output, truncated.
// The way to read a provider's actual response body before explaining an error, and the
// door that works when the MCP says "Workflow is not available in MCP".
//
// Usage: node scripts/n8n-exec.js <executionId> [node name ...] [--chars 800]
// Auth: N8N_API_KEY env var, or ~/.config/rootworks/n8n-api-key (one line).

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
const args = process.argv.slice(2);
const id = args[0];
if (!id) { console.error('Usage: node scripts/n8n-exec.js <executionId> [node name ...] [--chars 800]'); process.exit(1); }
const ci = args.indexOf('--chars');
const chars = ci > -1 ? Number(args[ci + 1]) || 800 : 800;
const only = args.slice(1).filter((a, i) => a !== '--chars' && !(ci > -1 && i === ci));

(async () => {
  const res = await fetch(`${BASE}/api/v1/executions/${id}?includeData=true`, { headers: { 'X-N8N-API-KEY': apiKey() } });
  if (!res.ok) throw new Error(`GET /executions/${id} -> HTTP ${res.status}: ${await res.text()}`);
  const ex = await res.json();
  console.log(`# execution ${ex.id} workflow=${ex.workflowId} status=${ex.status} mode=${ex.mode} started=${ex.startedAt} stopped=${ex.stoppedAt}`);
  const run = (((ex.data || {}).resultData || {}).runData) || {};
  const err = ((ex.data || {}).resultData || {}).error;
  if (err) console.log(`ERROR: ${err.message || JSON.stringify(err).slice(0, chars)}`);
  for (const [name, runs] of Object.entries(run)) {
    if (only.length && !only.includes(name)) continue;
    for (const r of runs) {
      const outs = (r.data && r.data.main) || [];
      const counts = outs.map((o) => (o || []).length).join('/');
      console.log(`\n## ${name}  (${r.executionTime || 0} ms, items out: ${counts}${r.error ? ', ERROR: ' + (r.error.message || '') : ''})`);
      outs.forEach((o, i) => {
        if (!o || !o.length) return;
        console.log(`  out${i}[0]: ${JSON.stringify(o[0].json).slice(0, chars)}`);
      });
    }
  }
})().catch((e) => { console.error(e.message); process.exit(1); });
