#!/usr/bin/env node
// Rootworks n8n decompiler - PULL.
// Pulls workflows from n8n and explodes them into readable source folders:
//   n8n/<workflow-slug>/workflow.json      the full graph, code replaced by @@file pointers
//   n8n/<workflow-slug>/nodes/<node>.js    every Code/Function node's JavaScript as a real file
//   n8n/INDEX.md                           the estate manifest
//
// Usage:
//   node tools/n8n/pull.js              pull the entire estate
//   node tools/n8n/pull.js <id> [...]   pull specific workflow ids
//
// Auth: N8N_API_KEY env var, or ~/.config/rootworks/n8n-api-key (one line).
// The key never lives in this repo.

const fs = require('fs');
const path = require('path');

const BASE = process.env.N8N_URL || 'https://n8n.flowroots.com';
const OUT = path.join(__dirname, '..', '..', 'n8n');
// The public API returns description:null; the real ones live only in the MCP layer.
// This map (id -> description) fills the INDEX; add a line when a workflow is born.
const DESC = JSON.parse(fs.readFileSync(path.join(__dirname, 'descriptions.json'), 'utf8'));

function apiKey() {
  if (process.env.N8N_API_KEY) return process.env.N8N_API_KEY.trim();
  const p = path.join(process.env.HOME, '.config', 'rootworks', 'n8n-api-key');
  try { return fs.readFileSync(p, 'utf8').trim(); } catch {
    console.error('No API key. Set N8N_API_KEY or write it to ~/.config/rootworks/n8n-api-key');
    process.exit(1);
  }
}
const KEY = apiKey();

async function api(route) {
  const res = await fetch(`${BASE}/api/v1${route}`, { headers: { 'X-N8N-API-KEY': KEY } });
  if (!res.ok) throw new Error(`GET ${route} -> HTTP ${res.status}: ${await res.text()}`);
  return res.json();
}

const slug = (s) => String(s).replace(/[^\w.\- ]+/g, '').trim().replace(/\s+/g, '-');

// node type -> the parameter holding its code
const CODE_PARAMS = {
  'n8n-nodes-base.code': 'jsCode',
  'n8n-nodes-base.function': 'functionCode',
  'n8n-nodes-base.functionItem': 'functionCode',
};

async function listAll() {
  let cursor; const all = [];
  do {
    const page = await api(`/workflows?limit=100${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`);
    all.push(...page.data);
    cursor = page.nextCursor;
  } while (cursor);
  return all;
}

function decompile(wf) {
  const dir = path.join(OUT, slug(wf.name));
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const doc = JSON.parse(JSON.stringify(wf));
  let codeFiles = 0;
  for (const node of doc.nodes || []) {
    const param = CODE_PARAMS[node.type];
    if (param && node.parameters && typeof node.parameters[param] === 'string' && node.parameters[param].length) {
      fs.mkdirSync(path.join(dir, 'nodes'), { recursive: true });
      const file = `nodes/${slug(node.name)}.js`;
      fs.writeFileSync(path.join(dir, file), node.parameters[param]);
      node.parameters[param] = `@@file:${file}`;
      codeFiles++;
    }
  }
  fs.writeFileSync(path.join(dir, 'workflow.json'), JSON.stringify(doc, null, 2) + '\n');
  return { dir: path.relative(OUT, dir), codeFiles, nodes: (doc.nodes || []).length };
}

(async () => {
  const ids = process.argv.slice(2);
  let workflows;
  if (ids.length) {
    workflows = [];
    for (const id of ids) workflows.push(await api(`/workflows/${id}`));
  } else {
    // Archived workflows are retired; the repo mirrors the living app only.
    workflows = (await listAll()).filter((wf) => !wf.isArchived);
    fs.rmSync(OUT, { recursive: true, force: true });
  }
  workflows.sort((a, b) => a.name.localeCompare(b.name));

  const rows = [];
  for (const wf of workflows) {
    const r = decompile(wf);
    const description = wf.description || DESC[wf.id] || '**MISSING - add to tools/n8n/descriptions.json**';
    if (description.startsWith('**MISSING')) console.warn(`WARNING: no description for "${wf.name}" (${wf.id})`);
    rows.push({ name: wf.name, id: wf.id, active: wf.active, updatedAt: wf.updatedAt, description, ...r });
    console.log(`${wf.name}  (${wf.id})  nodes:${r.nodes}  code files:${r.codeFiles}`);
  }

  if (!ids.length) {
    const lines = [
      '# n8n estate',
      '',
      'Decompiled n8n source. One folder per workflow: `workflow.json` is the graph,',
      '`nodes/*.js` are the Code nodes. Pull with `tools/n8n/pull.js`, push one workflow',
      'back with `tools/n8n/push.js <folder>`. n8n is the runtime; this is the version history.',
      '',
      '| Workflow | What it does / when to use it | Active |',
      '|---|---|---|',
      ...rows.map(r => `| [${r.name}](${encodeURI(r.dir)}/workflow.json) | ${(r.description || '').replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim()} | ${r.active ? 'yes' : 'no'} |`),
      '',
    ];
    fs.writeFileSync(path.join(OUT, 'INDEX.md'), lines.join('\n'));
  }
  console.log(`\n${rows.length} workflow(s) -> ${OUT}`);
})().catch((e) => { console.error(e.message); process.exit(1); });
