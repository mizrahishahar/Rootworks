#!/usr/bin/env node
// Rootworks n8n decompiler - PUSH.
// Recompiles a decompiled workflow folder (workflow.json + nodes/*.js) and updates
// the live workflow in n8n. Pushes ONE workflow per invocation, deliberately.
//
// Usage:
//   node scripts/n8n/push.js n8n/<type>/<Machine>/<Workflow>            update the live workflow (or create it, if its card names it)
//   node scripts/n8n/push.js n8n/<type>/<Machine>/<Workflow> --dry      print the payload summary, send nothing
//
// Directives inside a code file:
//   @@file:nodes/X.js        (in workflow.json) the node's code is that file
//   // @@register            (a line in a code file) the field register is inlined at that line as
//                            `const REGISTER = <JSON>;`, evaluated from
//                            n8n/Create-Client-Rootworks-Infrastructure/nodes/Scaffold-Register.js at
//                            push time. n8n-pull.js strips the constant and restores the directive on
//                            the way back.
//   // @@standard:<name>     (a line in a code file) the json block that closes standards/<name>.md is
//                            inlined at that line as `const STANDARD = /* @@standard:<name> */ <JSON>;`.
//                            A machine consumes its standard and never holds a copy: the page is the
//                            one place a number lives, and every push carries the page as it is now.
//                            The push refuses when the page, or its json block, is missing or invalid.
//                            n8n-pull.js restores the directive on the way back.
//
// Auth: N8N_API_KEY env var, or ~/.config/rootworks/n8n-api-key (one line).
// The key never lives in this repo.

const fs = require('fs');
const path = require('path');
const { loadRegister } = require('./register');

const BASE = process.env.N8N_URL || 'https://n8n.flowroots.com';
const REGISTER_DIRECTIVE = /^\/\/ @@register$/gm;
const STANDARD_DIRECTIVE = /^\/\/ @@standard:([a-z0-9-]+)$/gm;
const STANDARDS_DIR = path.join(__dirname, '..', '..', 'standards');

function apiKey() {
  if (process.env.N8N_API_KEY) return process.env.N8N_API_KEY.trim();
  const p = path.join(process.env.HOME, '.config', 'rootworks', 'n8n-api-key');
  try { return fs.readFileSync(p, 'utf8').trim(); } catch {
    console.error('No API key. Set N8N_API_KEY or write it to ~/.config/rootworks/n8n-api-key');
    process.exit(1);
  }
}

// The json block that closes a standards page: the last ```json fence in the file.
const standardCache = {};
function loadStandard(name) {
  if (standardCache[name]) return standardCache[name];
  const file = path.join(STANDARDS_DIR, `${name}.md`);
  if (!fs.existsSync(file)) {
    console.error(`REFUSED: // @@standard:${name} names standards/${name}.md, which does not exist.`);
    process.exit(1);
  }
  const text = fs.readFileSync(file, 'utf8');
  const blocks = [...text.matchAll(/```json\s*\n([\s\S]*?)\n```/g)];
  if (!blocks.length) {
    console.error(`REFUSED: standards/${name}.md has no json block for the machines to read.`);
    process.exit(1);
  }
  let json;
  try { json = JSON.parse(blocks[blocks.length - 1][1]); } catch (e) {
    console.error(`REFUSED: the json block in standards/${name}.md does not parse: ${e.message}`);
    process.exit(1);
  }
  standardCache[name] = JSON.stringify(json);
  return standardCache[name];
}

const dirArg = process.argv[2];
const dry = process.argv.includes('--dry');
if (!dirArg) { console.error('Usage: node scripts/n8n/push.js n8n/<type>/<Machine>/<Workflow> [--dry]'); process.exit(1); }

const dir = path.resolve(dirArg);
const doc = JSON.parse(fs.readFileSync(path.join(dir, 'workflow.json'), 'utf8'));

let inlined = 0;
let registerLine = null;
const registered = [];
const standardized = [];
for (const node of doc.nodes || []) {
  for (const [param, value] of Object.entries(node.parameters || {})) {
    if (typeof value === 'string' && value.startsWith('@@file:')) {
      const file = path.join(dir, value.slice('@@file:'.length));
      let code = fs.readFileSync(file, 'utf8');
      if (REGISTER_DIRECTIVE.test(code)) {
        REGISTER_DIRECTIVE.lastIndex = 0;
        if (!registerLine) registerLine = `const REGISTER = ${JSON.stringify(loadRegister())};`;
        code = code.replace(REGISTER_DIRECTIVE, () => registerLine);
        registered.push(node.name);
      }
      REGISTER_DIRECTIVE.lastIndex = 0;
      code = code.replace(STANDARD_DIRECTIVE, (_, name) => {
        standardized.push(`${node.name} <- standards/${name}.md`);
        return `const STANDARD = /* @@standard:${name} */ ${loadStandard(name)};`;
      });
      STANDARD_DIRECTIVE.lastIndex = 0;
      node.parameters[param] = code;
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
if (registered.length) {
  console.log(`register inlined (${registerLine.length} chars) into: ${registered.join(', ')}`);
  if (dry) console.log(`  ${registerLine.slice(0, 200)}...`);
}
if (standardized.length) console.log(`standard inlined: ${standardized.join(', ')}`);
if (dry) { console.log('dry run, nothing sent'); process.exit(0); }

(async () => {
  if (!doc.id) {
    // Brand-new workflow. THE APPROVAL LAW (ruled 2026-09-10, cards since 2026-09-12): a workflow
    // exists in n8n only when a card names it (N8N-SCHEMA.md), and a card is written after the
    // Operator approved the machine in chat. A new workflow has no id yet, so the card lists it under
    // its exact name as the key; the id replaces the key here once n8n assigns it. No card: no creation.
    const cardPath = path.join(dir, '..', 'card.json');
    if (!fs.existsSync(cardPath)) {
      console.error(`REFUSED: no card.json beside ${path.relative(process.cwd(), dir)}. A new workflow needs the Operator's approval first: write the machine's card (n8n/<type>/<Machine>/card.json) naming this workflow, and push again.`);
      process.exit(1);
    }
    const card = JSON.parse(fs.readFileSync(cardPath, 'utf8'));
    const pendingKey = Object.keys(card.workflows || {}).find(k => !/^[A-Za-z0-9]{16}$/.test(k) && card.workflows[k] === doc.name);
    if (!pendingKey) {
      console.error(`REFUSED: "${doc.name}" is not on ${card.name}'s card. Add it under workflows keyed by its name ("${doc.name}": "${doc.name}") and push again.`);
      process.exit(1);
    }
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
    const entry = card.workflows[pendingKey]; delete card.workflows[pendingKey]; card.workflows[out.id] = entry;
    fs.writeFileSync(cardPath, JSON.stringify(card, null, 2) + '\n');
    console.log(`created: ${out.name} (${out.id}), id written back to workflow.json and to the card`);
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
