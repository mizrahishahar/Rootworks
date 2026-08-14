#!/usr/bin/env node
// Rootworks Hub schema puller.
// Compiles the live Flowroots Hub schema (tables, fields, types, select choices,
// field descriptions) into hub/SCHEMA.md. Generated from truth; never hand-edited.
//
// Usage: node scripts/hub-pull.js
// Auth: AIRTABLE_API_KEY env var, or ~/.config/rootworks/airtable-api-key
//       (a PAT with scope schema.bases:read on the Flowroots Hub).

const fs = require('fs');
const path = require('path');

const BASE_ID = 'appQG6dK0FIOhTxOl';
const OUT = path.join(__dirname, '..', 'hub');

function apiKey() {
  if (process.env.AIRTABLE_API_KEY) return process.env.AIRTABLE_API_KEY.trim();
  const p = path.join(process.env.HOME, '.config', 'rootworks', 'airtable-api-key');
  try { return fs.readFileSync(p, 'utf8').trim(); } catch {
    console.error('No API key. Set AIRTABLE_API_KEY or write it to ~/.config/rootworks/airtable-api-key');
    process.exit(1);
  }
}

const clean = (s) => String(s || '').replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim();

(async () => {
  const res = await fetch(`https://api.airtable.com/v0/meta/bases/${BASE_ID}/tables`, {
    headers: { Authorization: `Bearer ${apiKey()}` },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  const { tables } = await res.json();

  const lines = [
    '# Flowroots Hub - schema',
    '',
    `Compiled from the live base (\`${BASE_ID}\`) by \`scripts/hub-pull.js\`. Do not hand-edit.`,
    'What the tables MEAN is in hub/flowroots-hub.md; this file is what they ARE.',
    '',
  ];

  for (const t of tables) {
    lines.push(`## ${t.name} (\`${t.id}\`)`);
    if (t.description) lines.push('', clean(t.description));
    lines.push('', '| Field | ID | Type | Notes |', '|---|---|---|---|');
    for (const f of t.fields) {
      let notes = clean(f.description);
      const choices = f.options && f.options.choices;
      if (choices && choices.length) {
        const list = choices.map((c) => c.name).join(', ');
        notes = [notes, `Choices: ${clean(list)}`].filter(Boolean).join(' - ');
      }
      lines.push(`| ${clean(f.name)} | \`${f.id}\` | ${f.type} | ${notes} |`);
    }
    lines.push('');
  }

  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, 'SCHEMA.md'), lines.join('\n'));
  console.log(`${tables.length} tables -> hub/SCHEMA.md`);
})().catch((e) => { console.error(e.message); process.exit(1); });
