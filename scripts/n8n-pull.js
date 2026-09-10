#!/usr/bin/env node
// Rootworks n8n decompiler - PULL.
// Pulls workflows from n8n and explodes them into readable source folders, placed by the layout:
//   n8n/layout.json                              the approved list: id -> {name, group, rootflow, why, approved}
//   n8n/rootflows/<Rootflow>/<workflow>/         one folder per Rootflow, its workflows inside
//   n8n/rootworks/<workflow>/                    the Hub machines, the lead handlers, the deploys and syncs
//   n8n/helpers/<workflow>/                      sub-workflows several of the above call
//   n8n/archive/<workflow>/                      retired, off in n8n, kept for reading
//   n8n/unsorted/<workflow>/                     found in n8n but NOT in layout.json: UNAPPROVED
//   <workflow>/workflow.json                     the graph, code replaced by @@file pointers
//   <workflow>/nodes/<node>.js                   every Code node's JavaScript as a real file
//   n8n/INDEX.md                                 the estate manifest, grouped the same way
// Anything else in the tree (layout.json, rootflow.json declarations, INDEX.md, LAUNCHERS.md) is
// kept; only workflow folders are rewritten.
//
// Usage:
//   node scripts/n8n-pull.js              pull the entire estate
//   node scripts/n8n-pull.js <id> [...]   pull specific workflow ids
//
// Auth: N8N_API_KEY env var, or ~/.config/rootworks/n8n-api-key (one line). The key never lives here.

const fs = require('fs');
const path = require('path');

const BASE = process.env.N8N_URL || 'https://n8n.flowroots.com';
const OUT = path.join(__dirname, '..', 'n8n');
const DESC = JSON.parse(fs.readFileSync(path.join(__dirname, 'n8n-descriptions.json'), 'utf8'));
const LAYOUT = JSON.parse(fs.readFileSync(path.join(OUT, 'layout.json'), 'utf8'));
const GROUPS = LAYOUT.groups || ['rootflows', 'rootworks', 'helpers', 'archive'];

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

const CODE_PARAMS = {
  'n8n-nodes-base.code': 'jsCode',
  'n8n-nodes-base.function': 'functionCode',
  'n8n-nodes-base.functionItem': 'functionCode',
};

// The push inlines the field register as one `const REGISTER = {...};` line wherever a node file
// carries `// @@register`. The source keeps the directive, never the inlined copy.
const REGISTER_LINE = /^const REGISTER = \{.*\};$/gm;
const restoreDirective = (code) => code.replace(REGISTER_LINE, '// @@register');

async function listAll() {
  let cursor; const all = [];
  do {
    const page = await api(`/workflows?limit=100${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`);
    all.push(...page.data);
    cursor = page.nextCursor;
  } while (cursor);
  return all;
}

// Where a workflow lives, from the layout. Unlisted = unsorted, and flagged.
function placeOf(wf) {
  const e = LAYOUT.workflows[wf.id];
  if (!e) return { group: 'unsorted', rootflow: '', dir: path.join('unsorted', slug(wf.name)), approved: false };
  if (e.group === 'rootflows') return { group: 'rootflows', rootflow: e.rootflow || wf.name, dir: path.join('rootflows', slug(e.rootflow || wf.name), slug(wf.name)), approved: true, why: e.why };
  return { group: e.group, rootflow: '', dir: path.join(e.group, slug(wf.name)), approved: true, why: e.why };
}

// Remove every existing workflow folder (a folder holding workflow.json) under n8n/, nothing else.
function clearWorkflowFolders(root) {
  if (!fs.existsSync(root)) return;
  for (const name of fs.readdirSync(root)) {
    const p = path.join(root, name);
    if (!fs.statSync(p).isDirectory()) continue;
    if (fs.existsSync(path.join(p, 'workflow.json'))) { fs.rmSync(p, { recursive: true, force: true }); continue; }
    clearWorkflowFolders(p);
    if (fs.readdirSync(p).length === 0) fs.rmdirSync(p);
  }
}

function decompile(wf, place) {
  const dir = path.join(OUT, place.dir);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const doc = JSON.parse(JSON.stringify(wf));
  let codeFiles = 0;
  for (const node of doc.nodes || []) {
    const param = CODE_PARAMS[node.type];
    if (param && node.parameters && typeof node.parameters[param] === 'string' && node.parameters[param].length) {
      fs.mkdirSync(path.join(dir, 'nodes'), { recursive: true });
      const file = `nodes/${slug(node.name)}.js`;
      fs.writeFileSync(path.join(dir, file), restoreDirective(node.parameters[param]));
      node.parameters[param] = `@@file:${file}`;
      codeFiles++;
    }
  }
  fs.writeFileSync(path.join(dir, 'workflow.json'), JSON.stringify(doc, null, 2) + '\n');
  return { dir: place.dir, codeFiles, nodes: (doc.nodes || []).length };
}

(async () => {
  const ids = process.argv.slice(2);
  let workflows;
  if (ids.length) {
    workflows = [];
    for (const id of ids) workflows.push(await api(`/workflows/${id}`));
  } else {
    workflows = (await listAll()).filter((wf) => !wf.isArchived);
    clearWorkflowFolders(OUT);
  }
  workflows.sort((a, b) => a.name.localeCompare(b.name));

  const rows = [];
  for (const wf of workflows) {
    const place = placeOf(wf);
    const r = decompile(wf, place);
    const description = wf.description || DESC[wf.id] || '**MISSING - add to scripts/n8n-descriptions.json**';
    if (description.startsWith('**MISSING')) console.warn(`WARNING: no description for "${wf.name}" (${wf.id})`);
    if (!place.approved) console.warn(`UNAPPROVED: "${wf.name}" (${wf.id}) is in n8n but not in n8n/layout.json`);
    rows.push({ name: wf.name, id: wf.id, active: wf.active, updatedAt: wf.updatedAt, description, ...place, ...r });
    console.log(`${place.dir}  (${wf.id})  nodes:${r.nodes}  code files:${r.codeFiles}${wf.active ? '' : '  off'}`);
  }

  if (!ids.length) {
    const cell = (s) => String(s || '').replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim();
    const row = (r) => `| [${r.name}](${encodeURI(r.dir)}/workflow.json) | ${cell(r.description)} | ${r.active ? 'yes' : 'no'} |`;
    const header = ['| Workflow | What it does / when to use it | Active |', '|---|---|---|'];
    const lines = [
      '# n8n estate',
      '',
      'Decompiled n8n source, placed by `layout.json` (the approved list: a workflow exists in n8n only with a',
      'line there, written after the Operator approved it). One folder per workflow: `workflow.json` is the',
      'graph, `nodes/*.js` are the Code nodes. Pull with `scripts/n8n-pull.js`, push one workflow back with',
      '`scripts/n8n-push.js <folder>`. n8n is the runtime; this is the version history.',
      '',
    ];
    const unsorted = rows.filter(r => !r.approved);
    if (unsorted.length) {
      lines.push('## UNAPPROVED (in n8n, not in layout.json)', '', 'Ask the Operator: approve it with a line in `layout.json`, or delete it from n8n.', '', ...header, ...unsorted.map(row), '');
    }
    for (const g of GROUPS) {
      const rs = rows.filter(r => r.group === g);
      if (!rs.length) continue;
      lines.push(`## ${g}`, '');
      if (g === 'rootflows') {
        const byRf = {};
        for (const r of rs) (byRf[r.rootflow] = byRf[r.rootflow] || []).push(r);
        for (const rf of Object.keys(byRf).sort()) {
          const decl = path.join(OUT, 'rootflows', slug(rf), 'rootflow.json');
          lines.push(`### ${rf}${fs.existsSync(decl) ? ` ([declaration](rootflows/${encodeURI(slug(rf))}/rootflow.json))` : ' (no declaration yet)'}`, '', ...header, ...byRf[rf].map(row), '');
        }
      } else {
        lines.push(...header, ...rs.map(row), '');
      }
    }
    fs.writeFileSync(path.join(OUT, 'INDEX.md'), lines.join('\n'));
  }
  console.log(`\n${rows.length} workflow(s) -> ${OUT}`);
})().catch((e) => { console.error(e.message); process.exit(1); });
