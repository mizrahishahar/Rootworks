#!/usr/bin/env node
// Rootworks n8n decompiler - PULL.
// Pulls workflows from n8n and explodes them into readable source folders, placed by the cards
// (N8N-SCHEMA.md):
//   n8n/<type>/<Machine>/card.json               the machine's card: name, type, workflows, description
//   n8n/<type>/<Machine>/<Workflow>/workflow.json the graph, code replaced by @@file pointers
//   n8n/<type>/<Machine>/<Workflow>/nodes/*.js    every Code node's JavaScript as a real file
//   n8n/archive/<Workflow>/                       off in n8n and on no card
//   n8n/unsorted/<Workflow>/                      ON in n8n and on no card: UNAPPROVED
//   n8n/INDEX.md                                  generated: machine, type, door, description, active
// Cards are never touched; only workflow folders are rewritten.
//
// Usage:
//   node scripts/n8n/pull.js              pull the entire estate
//   node scripts/n8n/pull.js <id> [...]   pull specific workflow ids
//
// Auth: N8N_API_KEY env var, or ~/.config/rootworks/n8n-api-key (one line). The key never lives here.

const fs = require('fs');
const path = require('path');

const BASE = process.env.N8N_URL || 'https://n8n.flowroots.com';
const OUT = path.join(__dirname, '..', '..', 'n8n');
const TYPES = { rootflow: 'rootflows', deploy: 'deploys', handler: 'handlers', manager: 'managers', helper: 'helpers', addon: 'addons' };
const TYPE_FIELD = { rootflow: 'writes', deploy: 'sender', handler: 'event', manager: 'may_change', helper: 'called_by', addon: 'hook' };

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

// Every card in the tree: n8n/<type folder>/<Machine>/card.json. Returns [{card, dir}] and the
// id -> card index. A card whose type is unknown, or that names no workflows, stops the pull.
function loadCards() {
  const cards = []; const byId = {};
  for (const [type, folder] of Object.entries(TYPES)) {
    const root = path.join(OUT, folder);
    if (!fs.existsSync(root)) continue;
    for (const name of fs.readdirSync(root)) {
      const file = path.join(root, name, 'card.json');
      if (!fs.existsSync(file)) continue;
      const card = JSON.parse(fs.readFileSync(file, 'utf8'));
      if (card.type !== type) throw new Error(`${folder}/${name}/card.json says type "${card.type}" but sits under ${folder}/`);
      if (!card.workflows || !Object.keys(card.workflows).length) throw new Error(`${folder}/${name}/card.json names no workflows`);
      const entry = { card, dir: path.join(folder, name) };
      cards.push(entry);
      for (const id of Object.keys(card.workflows)) { if (byId[id]) throw new Error(`workflow ${id} is on two cards: ${byId[id].card.name} and ${card.name}`); byId[id] = entry; }
    }
  }
  return { cards, byId };
}

async function listAll() {
  let cursor; const all = [];
  do {
    const page = await api(`/workflows?limit=100${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''}`);
    all.push(...page.data);
    cursor = page.nextCursor;
  } while (cursor);
  return all;
}

// Where a workflow lives. On a card: under its machine. Off and uncarded: archive. On and uncarded: unsorted, flagged.
function placeOf(wf, byId) {
  const e = byId[wf.id];
  if (e) return { type: e.card.type, machine: e.card.name, dir: path.join(e.dir, slug(wf.name)), approved: true };
  if (!wf.active) return { type: 'archive', machine: '', dir: path.join('archive', slug(wf.name)), approved: true };
  return { type: 'unsorted', machine: '', dir: path.join('unsorted', slug(wf.name)), approved: false };
}

// Remove every existing workflow folder (a folder holding workflow.json) under n8n/, nothing else.
// A machine folder keeps its card, so it survives; an empty folder is removed.
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
  let codeFiles = 0; const doors = [];
  for (const node of doc.nodes || []) {
    const param = CODE_PARAMS[node.type];
    if (param && node.parameters && typeof node.parameters[param] === 'string' && node.parameters[param].length) {
      fs.mkdirSync(path.join(dir, 'nodes'), { recursive: true });
      const file = `nodes/${slug(node.name)}.js`;
      fs.writeFileSync(path.join(dir, file), restoreDirective(node.parameters[param]));
      node.parameters[param] = `@@file:${file}`;
      codeFiles++;
    }
    if (String(node.type || '').endsWith('.webhook')) doors.push(`${(node.parameters && node.parameters.httpMethod) || 'GET'} /webhook/${(node.parameters && node.parameters.path) || '?'}`);
  }
  fs.writeFileSync(path.join(dir, 'workflow.json'), JSON.stringify(doc, null, 2) + '\n');
  return { dir: place.dir, codeFiles, nodes: (doc.nodes || []).length, doors };
}

(async () => {
  const ids = process.argv.slice(2);
  const { cards, byId } = loadCards();
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
  const live = new Set(workflows.map((w) => w.id));
  for (const wf of workflows) {
    const place = placeOf(wf, byId);
    const r = decompile(wf, place);
    if (!place.approved) console.warn(`UNAPPROVED: "${wf.name}" (${wf.id}) is ON in n8n and on no card`);
    rows.push({ name: wf.name, id: wf.id, active: wf.active, ...place, ...r });
    console.log(`${place.dir}  (${wf.id})  nodes:${r.nodes}  code files:${r.codeFiles}${wf.active ? '' : '  off'}`);
  }
  if (!ids.length) {
    for (const e of cards) for (const id of Object.keys(e.card.workflows)) if (/^[A-Za-z0-9]{16}$/.test(id) && !live.has(id)) console.warn(`STALE CARD: ${e.card.name} names workflow ${id} (${e.card.workflows[id]}) which is not in n8n`);
  }

  if (!ids.length) {
    const cell = (s) => String(s || '').replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim();
    const lines = [
      '# n8n',
      '',
      'Generated by `scripts/n8n/pull.js` from the cards and the webhook nodes. Do not hand-edit. What a machine is: N8N-SCHEMA.md.',
      '',
    ];
    const unsorted = rows.filter((r) => !r.approved);
    if (unsorted.length) {
      lines.push('## UNAPPROVED', '', 'On in n8n, on no card. Ask the Operator: a card, or off.', '', '| Workflow | Door |', '|---|---|', ...unsorted.map((r) => `| [${r.name}](${encodeURI(r.dir)}/workflow.json) | ${r.doors.join(', ')} |`), '');
    }
    for (const [type, folder] of Object.entries(TYPES)) {
      const es = cards.filter((e) => e.card.type === type).sort((a, b) => a.card.name.localeCompare(b.card.name));
      if (!es.length) continue;
      const f = TYPE_FIELD[type];
      lines.push(`## ${folder}`, '', `| Machine | ${f} | Door | Description | On |`, '|---|---|---|---|---|');
      for (const e of es) {
        const wfs = rows.filter((r) => e.card.workflows[r.id]);
        const doors = [].concat(...wfs.map((r) => r.doors));
        const on = wfs.length ? (wfs.every((r) => r.active) ? 'yes' : wfs.some((r) => r.active) ? 'part' : 'no') : 'missing';
        lines.push(`| [${cell(e.card.name)}](${encodeURI(e.dir)}/card.json) | ${cell(e.card[f])} | ${doors.map(cell).join(', ')} | ${cell(e.card.description)} | ${on} |`);
      }
      lines.push('');
    }
    const arch = rows.filter((r) => r.type === 'archive');
    if (arch.length) lines.push('## archive', '', arch.map((r) => `- [${r.name}](${encodeURI(r.dir)}/workflow.json)`).join('\n'), '');
    fs.writeFileSync(path.join(OUT, 'INDEX.md'), lines.join('\n'));
  }
  console.log(`\n${rows.length} workflow(s) -> ${OUT}`);
})().catch((e) => { console.error(e.message); process.exit(1); });
