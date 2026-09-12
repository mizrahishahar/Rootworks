#!/usr/bin/env node
// Enrich Discogen Research, the generator (2026-09-12). One workflow, the Enrich Rootflow that asks
// DiscoGen the launch row's Prompt about every company in a Companies view and writes the answer
// into the column the row names (Output Field, at Output Type; with Evidence on, the Evidence and
// Confidence companions). Launch row or record door in, the refusal gates, the own-columns create,
// one submit per 10,000 domains, a Wait-node poll until DiscoGen completes (8-hour cap), the row
// writer, one Hub row.
// Usage: node scripts/generators/build-enrich-discogen-research.js
// Writes n8n/rootflows/Enrich-Discogen-Research/Enrich-Discogen-Research/workflow.json; node code
// lives in its nodes/ folder as @@file. Push with scripts/n8n/push.js afterwards.
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..', '..', 'n8n', 'rootflows', 'Enrich-Discogen-Research');
const SLUG = 'Enrich-Discogen-Research';
const ERR = 'gqm6HzVNzEMQ8Ml0';
const AT = { airtableTokenApi: { id: 'RZ2SX89iUyF4aEWJ', name: 'Airtable' } };
const DL = { httpHeaderAuth: { id: 'jreseZ3JAhJNgkk0', name: 'Discolike API' } };
const HUB = { base: { __rl: true, mode: 'id', value: 'appQG6dK0FIOhTxOl' }, table: { __rl: true, mode: 'id', value: 'tbli7rV6Qf3sLpV6R' } };
const CLIENTS = { base: { __rl: true, mode: 'id', value: 'appQG6dK0FIOhTxOl' }, table: { __rl: true, mode: 'id', value: 'tblK0nCoNVvFf5SPa' } };
let seq = 0;
const uid = (p) => `${p}-${String(++seq).padStart(4, '0')}-4000-8000-${String(seq).padStart(12, '0')}`;
const code = (name, x, y, file, notes) => ({ parameters: { jsCode: `@@file:nodes/${file}` }, id: uid('edr1'), name, type: 'n8n-nodes-base.code', typeVersion: 2, position: [x, y], ...(notes ? { notes } : {}) });
const cond = (leftValue, operator, rightValue) => ({ conditions: { options: { caseSensitive: true, leftValue: '', typeValidation: 'loose', version: 2 }, conditions: [{ id: 'c1', leftValue, rightValue: rightValue === undefined ? '' : rightValue, operator }], combinator: 'and' }, options: {} });
const ifNode = (name, x, y, params, notes) => ({ parameters: params, id: uid('edr1'), name, type: 'n8n-nodes-base.if', typeVersion: 2.2, position: [x, y], ...(notes ? { notes } : {}) });
const ifEmpty = (name, x, y, expr, notes) => ifNode(name, x, y, cond(expr, { type: 'string', operation: 'empty', singleValue: true }), notes);
const ifNotEmpty = (name, x, y, expr, notes) => ifNode(name, x, y, cond(expr, { type: 'string', operation: 'notEmpty', singleValue: true }), notes);
const ifNone = (name, x, y, notes) => ifNode(name, x, y, cond('={{ $json._none === true }}', { type: 'boolean', operation: 'false', singleValue: true }), notes);
const ifTrue = (name, x, y, expr, notes) => ifNode(name, x, y, cond(expr, { type: 'boolean', operation: 'true', singleValue: true }), notes);
const http = (name, x, y, params, extra) => Object.assign({ parameters: params, id: uid('edr1'), name, type: 'n8n-nodes-base.httpRequest', typeVersion: 4.4, position: [x, y] }, extra || {});
const atMeta = { authentication: 'predefinedCredentialType', nodeCredentialType: 'airtableTokenApi' };
// An HTTP node on the Airtable token must carry the credential on the node too (run 24515: "Credentials not found" without it).
const atHttp = (name, x, y, params, extra) => http(name, x, y, params, Object.assign({ credentials: AT }, extra || {}));
const headerAuth = { authentication: 'genericCredentialType', genericAuthType: 'httpHeaderAuth' };
const jsonBody = { sendBody: true, specifyBody: 'json', jsonBody: '={{ JSON.stringify($json.body) }}' };
const resp = (full, never) => ({ response: { response: { fullResponse: !!full, neverError: !!never } } });
const batching = (ms, n) => ({ batching: { batch: { batchSize: n || 1, batchInterval: ms } } });
const airtable = (name, x, y, params, extra) => Object.assign({ parameters: params, id: uid('edr1'), name, type: 'n8n-nodes-base.airtable', typeVersion: 2.2, position: [x, y], credentials: AT }, extra || {});
const conn = (edges) => { const c = {}; for (const [from, to, out] of edges) { c[from] = c[from] || { main: [] }; const o = out || 0; while (c[from].main.length <= o) c[from].main.push([]); c[from].main[o].push({ node: to, type: 'main', index: 0 }); } return c; };
const check = (nodes, edges) => { const by = {}; for (const n of nodes) by[n.name] = n; for (const [a, b] of edges) { if (!by[a]) throw new Error('node missing: ' + a); if (!by[b]) throw new Error('node missing: ' + b); } const names = new Set(); for (const n of nodes) { if (names.has(n.name)) throw new Error('duplicate node: ' + n.name); names.add(n.name); } };
const idOf = () => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, SLUG, 'workflow.json'), 'utf8')).id || ''; } catch (e) { return ''; } };
const META_URL = "=https://api.airtable.com/v0/meta/bases/{{ $('Params').first().json.base }}/tables";

const nodes = [
  // entries
  Object.assign(http('Door', 0, 200, { httpMethod: 'POST', path: 'enrich-discogen-research', responseMode: 'onReceived', options: {} }), { type: 'n8n-nodes-base.webhook', typeVersion: 2.1, notes: 'The one door. {recordId} from the Hub launch automation opens a launch-row run; any other body is the record door (baseId, clientRecordId, view, prompt, outputField, outputType, webSearch, evidence, overwrite, maxCompanies, tag). Answers 200 on receipt; the run carries on alone.' }),
  ifNotEmpty('Launch Row?', 220, 200, "={{ ($json.body || {}).recordId || '' }}"),
  airtable('Fetch Launch Record', 440, 100, { resource: 'record', operation: 'get', ...HUB, id: '={{ $json.body.recordId }}', options: {} }),
  airtable('Stamp Running', 660, 100, { resource: 'record', operation: 'update', ...HUB, columns: { mappingMode: 'defineBelow', value: { id: '={{ $json.id }}', Status: 'Running', Tally: '', 'Run at': '={{ $now.toISO() }}', 'Execution ID': '={{ $execution.id }}', 'Execution Link': '=https://n8n.flowroots.com/workflow/{{ $workflow.id }}/executions/{{ $execution.id }}' }, matchingColumns: ['id'], schema: [] }, options: { typecast: true } }),
  airtable('Resolve Base', 880, 100, { resource: 'record', operation: 'get', ...CLIENTS, id: "={{ (($json.fields || {}).Client || [])[0] || 'recMISSING' }}", options: {} }, { onError: 'continueRegularOutput' }),
  code('Launch Params', 1100, 100, 'Launch-Params.js'),
  code('Event Params', 440, 300, 'Event-Params.js'),
  code('Params', 1320, 200, 'Params.js'),
  ifEmpty('Launch OK?', 1540, 200, "={{ $json.refused || '' }}", 'The refusal gate: a bad launch row is closed Failed with the reason (Build Refusal), nothing read, nothing paid.'),
  // table and columns
  atHttp('Check Table', 1760, 100, { url: META_URL, ...atMeta, options: { ...resp(false, true) } }),
  code('Resolve Table', 1980, 100, 'Resolve-Table.js'),
  ifEmpty('Table OK?', 2200, 100, "={{ $json.refused || '' }}"),
  code('Check Columns', 2420, 0, 'Check-Columns.js'),
  ifEmpty('Columns OK?', 2640, 0, "={{ $json.refused || '' }}"),
  ifNode('Any Columns?', 2860, -100, cond('={{ ($json.toCreate || []).length }}', { type: 'number', operation: 'gt' }, 0)),
  code('Plan Columns', 3080, -200, 'Plan-Columns.js'),
  atHttp('Create Columns', 3300, -200, { method: 'POST', url: '={{ $json.url }}', ...atMeta, ...jsonBody, options: { ...batching(300), ...resp(false, true) } }, { notes: 'The own columns, created on first use through the meta API: Output Field at Output Type, and with Evidence on the Evidence and Confidence companions.' }),
  atHttp('Reread Meta', 3520, -200, { url: META_URL, ...atMeta, options: { ...resp(false, true) } }),
  code('Verify Columns', 3740, -200, 'Verify-Columns.js'),
  // rows
  airtable('Fetch Rows', 3960, -100, { resource: 'record', operation: 'search', base: { __rl: true, mode: 'id', value: "={{ $('Params').first().json.base }}" }, table: { __rl: true, mode: 'id', value: "={{ $('Resolve Table').first().json.tableId }}" }, returnAll: true, options: { view: { __rl: true, mode: 'id', value: "={{ $('Resolve Table').first().json.viewId }}" }, fields: "={{ $('Check Columns').first().json.fetchFields }}" } }, { alwaysOutputData: true, notes: 'Every row of the view, Domain and the own columns only, so a 10,000-row view stays light.' }),
  code('Pick Rows', 4180, -100, 'Pick-Rows.js'),
  ifEmpty('Rows OK?', 4400, -100, "={{ $json.refused || '' }}", 'The spend gate: more domains than Max companies is a refusal on the row.'),
  code('Make Tasks', 4620, -100, 'Make-Tasks.js'),
  ifNone('Any Tasks?', 4840, -100),
  http('DG Submit', 5060, -200, { method: 'POST', url: 'https://api.discolike.com/v1/discogen/process', ...headerAuth, ...jsonBody, options: { ...batching(2000), ...resp(true, true), timeout: 120000 } }, { credentials: DL, onError: 'continueRegularOutput', notes: 'POST /v1/discogen/process: the Prompt against every domain of the chunk, context website, web_search per the row, the account\'s default LLM and search provider. One task per 10,000 domains, never split smaller, never parallel. Header Auth credential Discolike API. No credential, 400 (no provider on the account), 402 or a dead API is an error on the task, never a crash.' }),
  code('Init Tasks', 5280, -200, 'Init-Tasks.js'),
  code('Poll Input', 5500, -200, 'Poll-Input.js'),
  http('DG Poll', 5720, -200, { method: 'GET', url: '=https://api.discolike.com/v1/discogen/status/{{ $json.taskId }}', ...headerAuth, options: { ...batching(1000), ...resp(true, true), timeout: 60000 } }, { credentials: DL, onError: 'continueRegularOutput', notes: 'GET /v1/discogen/status/{task_id}, one call per open task per round.' }),
  code('Poll Gate', 5940, -200, 'Poll-Gate.js'),
  ifTrue('Pending?', 6160, -200, '={{ $json._loop }}'),
  Object.assign(http('Wait', 6380, -320, { amount: '={{ $json._nextWaitSec }}', unit: 'seconds' }), { type: 'n8n-nodes-base.wait', typeVersion: 1.1, webhookId: uid('edr1'), notes: 'The poll wait: 30 s at first, 60 after two minutes, 120 after ten, 300 after thirty; the loop runs up to eight hours.' }),
  code('Results', 6600, -100, 'Results.js'),
  ifNotEmpty('Any Writes?', 6820, -100, "={{ $json.id || '' }}"),
  code('Chunk Rows', 7040, -200, 'Chunk-Rows.js'),
  atHttp('Write Rows', 7260, -200, { method: 'PATCH', url: "=https://api.airtable.com/v0/{{ $('Params').first().json.base }}/{{ $('Resolve Table').first().json.tableId }}", ...atMeta, ...jsonBody, options: { ...batching(200), ...resp(true, true), timeout: 60000 } }, { onError: 'continueRegularOutput', notes: 'PATCH ten rows a request, typecast on (a Single select mints its choices), 200 ms apart.' }),
  code('Write Check', 7480, -100, 'Write-Check.js'),
  code('Build Log', 7700, -100, 'Build-Log.js'),
  code('Build Refusal', 7700, 300, 'Build-Refusal.js'),
  airtable('Log Run', 7920, 100, { resource: 'record', operation: 'upsert', ...HUB, columns: { mappingMode: 'autoMapInputData', value: {}, matchingColumns: ['Execution ID'], schema: [] }, options: { typecast: true } }, { onError: 'stopWorkflow', notes: 'The one Hub row: the launch row on a Hub launch (Execution ID stamped at the trigger), a new row on an event call. Fails loudly into the Error Logger.' })
];
const edges = [
  ['Door', 'Launch Row?'], ['Launch Row?', 'Fetch Launch Record', 0], ['Launch Row?', 'Event Params', 1],
  ['Fetch Launch Record', 'Stamp Running'], ['Stamp Running', 'Resolve Base'], ['Resolve Base', 'Launch Params'], ['Launch Params', 'Params'], ['Event Params', 'Params'],
  ['Params', 'Launch OK?'], ['Launch OK?', 'Check Table', 0], ['Launch OK?', 'Build Refusal', 1],
  ['Check Table', 'Resolve Table'], ['Resolve Table', 'Table OK?'], ['Table OK?', 'Check Columns', 0], ['Table OK?', 'Build Refusal', 1],
  ['Check Columns', 'Columns OK?'], ['Columns OK?', 'Any Columns?', 0], ['Columns OK?', 'Build Refusal', 1],
  ['Any Columns?', 'Plan Columns', 0], ['Any Columns?', 'Fetch Rows', 1], ['Plan Columns', 'Create Columns'], ['Create Columns', 'Reread Meta'], ['Reread Meta', 'Verify Columns'], ['Verify Columns', 'Fetch Rows'],
  ['Fetch Rows', 'Pick Rows'], ['Pick Rows', 'Rows OK?'], ['Rows OK?', 'Make Tasks', 0], ['Rows OK?', 'Build Refusal', 1],
  ['Make Tasks', 'Any Tasks?'], ['Any Tasks?', 'DG Submit', 0], ['Any Tasks?', 'Results', 1],
  ['DG Submit', 'Init Tasks'], ['Init Tasks', 'Poll Input'], ['Poll Input', 'DG Poll'], ['DG Poll', 'Poll Gate'], ['Poll Gate', 'Pending?'], ['Pending?', 'Wait', 0], ['Pending?', 'Results', 1], ['Wait', 'Poll Input'],
  ['Results', 'Any Writes?'], ['Any Writes?', 'Chunk Rows', 0], ['Any Writes?', 'Write Check', 1], ['Chunk Rows', 'Write Rows'], ['Write Rows', 'Write Check'], ['Write Check', 'Build Log'],
  ['Build Log', 'Log Run'], ['Build Refusal', 'Log Run']
];
check(nodes, edges);
const id = idOf();
const doc = { name: 'Enrich Discogen Research', active: false, nodes, connections: conn(edges), settings: { executionOrder: 'v1', errorWorkflow: ERR }, staticData: null, meta: { templateCredsSetupCompleted: true }, pinData: {}, tags: [] };
if (id) doc.id = id;
fs.mkdirSync(path.join(ROOT, SLUG, 'nodes'), { recursive: true });
fs.writeFileSync(path.join(ROOT, SLUG, 'workflow.json'), JSON.stringify(doc, null, 2) + '\n');
console.log('wrote', SLUG, nodes.length, 'nodes', id ? '(id ' + id + ')' : '(new)');
