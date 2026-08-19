#!/usr/bin/env node
// Rootworks launcher compiler.
// Scans every machine's source in n8n/ and compiles the webhook-launchable ones
// into n8n/LAUNCHERS.md: what you can launch, the fire-ready URL, the fields it
// takes, and whether it needs an attachment (which forces the Waiting hold).
// Truth compiled from code; never hand-edited. Rerun after every n8n pull.
//
// Usage: node scripts/launchers.js

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'n8n');
const BASE = 'https://n8n.flowroots.com/webhook';

const rows = [];
for (const dir of fs.readdirSync(ROOT)) {
  const wf = path.join(ROOT, dir, 'workflow.json');
  if (!fs.existsSync(wf)) continue;
  let json;
  try { json = JSON.parse(fs.readFileSync(wf, 'utf8')); } catch { continue; }
  const nodes = json.nodes || (json.workflow && json.workflow.nodes) || [];

  const hooks = [];
  let fields = [];
  let hasFile = false;
  for (const n of nodes) {
    const t = String(n.type || '');
    if (t.endsWith('.webhook')) {
      hooks.push(`${n.parameters?.httpMethod || 'GET'} ${BASE}/${n.parameters?.path || '?'}`);
    } else if (t.endsWith('.formTrigger')) {
      fields = ((n.parameters?.formFields?.values) || []).map((f) => {
        if (f.fieldType === 'file') { hasFile = true; return `${f.fieldLabel} (file)`; }
        return f.fieldLabel;
      });
    }
  }
  if (!hooks.length) continue;
  rows.push([dir, hooks, fields.join(', '), hasFile]);
}

const lines = [
  '# Launchers',
  '',
  'Every webhook-launchable machine, compiled from the trigger nodes in `n8n/` by `scripts/launchers.js`.',
  'Do not hand-edit; rerun the script after every pull.',
  '',
  '- **Fire** is the exact request that starts the machine.',
  '- **Fields** is what the run needs (from the machine\'s own launch form); fill only these.',
  '- **Attachment: yes** means the machine takes a file, and a file cannot be sent by API:',
  '  create the Hub Automations row with Status = Waiting and every other field filled,',
  '  then stop. The Operator attaches the file and clears the Status himself, which fires the run.',
  '',
  '| Machine | Fire | Fields | Attachment |',
  '|---|---|---|---|',
];
for (const [m, hooks, fields, hasFile] of rows) {
  lines.push(`| ${m} | ${hooks.join(' <br> ')} | ${fields} | ${hasFile ? '**yes - launch on Waiting**' : 'no'} |`);
}

const out = path.join(ROOT, 'LAUNCHERS.md');
fs.writeFileSync(out, lines.join('\n') + '\n');
console.log(`${rows.length} launchable machines -> n8n/LAUNCHERS.md`);
