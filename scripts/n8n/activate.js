#!/usr/bin/env node
// Rootworks n8n activator.
// Activates (publishes) a workflow through the public API. The MCP publish tool refuses a
// workflow that has never had "Available in MCP" switched on, which every brand-new machine
// created by n8n-push.js is; this is the door that always works.
//
// Usage: node scripts/n8n-activate.js <workflowId>            activate
//        node scripts/n8n-activate.js <workflowId> --off      deactivate
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
const id = process.argv[2];
const off = process.argv.includes('--off');
if (!id) { console.error('Usage: node scripts/n8n-activate.js <workflowId> [--off]'); process.exit(1); }

(async () => {
  const res = await fetch(`${BASE}/api/v1/workflows/${id}/${off ? 'deactivate' : 'activate'}`, {
    method: 'POST', headers: { 'X-N8N-API-KEY': apiKey() },
  });
  if (!res.ok) throw new Error(`POST ${off ? 'deactivate' : 'activate'} ${id} -> HTTP ${res.status}: ${await res.text()}`);
  const out = await res.json();
  console.log(`${off ? 'deactivated' : 'activated'}: ${out.name} (${out.id}) active=${out.active}`);
})().catch((e) => { console.error(e.message); process.exit(1); });
