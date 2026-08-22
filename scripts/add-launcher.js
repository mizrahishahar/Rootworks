#!/usr/bin/env node
// Rootworks launcher injector.
// Gives a scheduled machine the on-demand door every launcher already has:
//   Launch Webhook (POST /webhook/<path>, body {recordId})
//     -> Fetch Launch Record (the pre-created Hub Automations row)
//     -> Stamp Running (Status=Running, Execution ID, Execution Link, Run at, Trigger=form)
//     -> Run Context (code: launch record id, trigger kind, optional single-client filter)
//     -> <first>  (the machine's existing first node after its schedule trigger)
// The schedule trigger is rewired through Run Context too, so every run, scheduled or
// launched, carries the same context; a scheduled run simply has no launch record.
// The end-log node (--log) is switched to upsert on Execution ID so a launched run closes
// the row it was launched from and a scheduled run still creates its own.
// Error Logger is attached. Idempotent: a machine that already has Launch Webhook is left alone.
//
// The client filter and the run-log fields are the machine's own code and are edited by hand
// after this runs: Run Context exposes sd.launch = { recordId, trigger, clientFilter, startedAt }.
//
// Usage: node scripts/add-launcher.js n8n/<slug> --path launch-x --trigger "<schedule node>" --first "<first node>" [--log "<log node>"]

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const args = process.argv.slice(2);
const dir = path.resolve(args[0] || '');
const opt = (k) => { const i = args.indexOf(k); return i > -1 ? args[i + 1] : ''; };
const hookPath = opt('--path'), triggerName = opt('--trigger'), firstName = opt('--first'), logName = opt('--log');
if (!dir || !hookPath || !triggerName || !firstName) {
  console.error('Usage: node scripts/add-launcher.js n8n/<slug> --path launch-x --trigger "<schedule node>" --first "<first node>" [--log "<log node>"]');
  process.exit(1);
}

const wfPath = path.join(dir, 'workflow.json');
const wf = JSON.parse(fs.readFileSync(wfPath, 'utf8'));
const byName = (n) => (wf.nodes || []).find((x) => x.name === n);
if (byName('Launch Webhook')) { console.log('Launch Webhook already present, nothing to do'); process.exit(0); }
const trigger = byName(triggerName), first = byName(firstName);
if (!trigger || !first) { console.error(`Node not found: ${!trigger ? triggerName : firstName}`); process.exit(1); }

const HUB = { __rl: true, mode: 'id', value: 'appQG6dK0FIOhTxOl' };
const AUTOMATIONS = { __rl: true, mode: 'id', value: 'tbli7rV6Qf3sLpV6R' };
const AIRTABLE_CRED = { airtableTokenApi: { id: 'RZ2SX89iUyF4aEWJ', name: 'Airtable' } };
const [tx, ty] = trigger.position || [0, 0];

const nodes = [
  {
    id: crypto.randomUUID(), name: 'Launch Webhook', type: 'n8n-nodes-base.webhook', typeVersion: 2.1,
    position: [tx - 896, ty + 240],
    parameters: { httpMethod: 'POST', path: hookPath, responseMode: 'onReceived', options: {} },
    webhookId: crypto.randomUUID(),
  },
  {
    id: crypto.randomUUID(), name: 'Fetch Launch Record', type: 'n8n-nodes-base.airtable', typeVersion: 2.2,
    position: [tx - 672, ty + 240],
    parameters: { resource: 'record', operation: 'get', base: HUB, table: AUTOMATIONS, id: '={{ $json.body.recordId }}', options: {} },
    credentials: AIRTABLE_CRED,
  },
  {
    id: crypto.randomUUID(), name: 'Stamp Running', type: 'n8n-nodes-base.airtable', typeVersion: 2.2,
    position: [tx - 448, ty + 240],
    parameters: {
      resource: 'record', operation: 'update', base: HUB, table: AUTOMATIONS,
      columns: {
        mappingMode: 'defineBelow',
        value: {
          id: '={{ $json.id }}',
          Status: 'Running',
          Trigger: 'form',
          'Run at': '={{ $now.toISO() }}',
          'Execution ID': '={{ $execution.id }}',
          'Execution Link': '=https://n8n.flowroots.com/workflow/{{ $workflow.id }}/executions/{{ $execution.id }}',
        },
        matchingColumns: ['id'], schema: [],
      },
      options: { typecast: true },
    },
    credentials: AIRTABLE_CRED,
    onError: 'stopWorkflow',
  },
  {
    id: crypto.randomUUID(), name: 'Run Context', type: 'n8n-nodes-base.code', typeVersion: 2,
    position: [tx - 224, ty + 120],
    parameters: { jsCode: '@@file:nodes/Run-Context.js' },
  },
];
wf.nodes.push(...nodes);

const RUN_CONTEXT = `// Run Context: one shape for every run, launched or scheduled.
// sd.launch.recordId  = the Hub Automations row this run was launched from ('' on a schedule)
// sd.launch.trigger   = 'form' when launched from the Hub, 'schedule' otherwise
// sd.launch.clientFilter = the launch row's Client link (one record id) to scope the run to one client; '' = all clients
const sd=$getWorkflowStaticData('global');
let launch=null;
try{ const r=$('Fetch Launch Record').first().json; if(r&&r.id) launch=r; }catch(e){}
const f=(launch&&launch.fields)||launch||{};
const cl=Array.isArray(f.Client)&&f.Client.length?f.Client[0]:'';
const clientFilter=(cl&&typeof cl==='object')?String(cl.id||''):String(cl||'');
sd.launch={ recordId: launch?String(launch.id):'', trigger: launch?'form':'schedule', clientFilter, startedAt:$now.toMillis() };
return [{ json: Object.assign({}, sd.launch) }];
`;
fs.mkdirSync(path.join(dir, 'nodes'), { recursive: true });
fs.writeFileSync(path.join(dir, 'nodes', 'Run-Context.js'), RUN_CONTEXT);

// Rewire: trigger -> Run Context -> first; webhook chain -> Run Context.
const conns = wf.connections || (wf.connections = {});
const lanes = (conns[triggerName] && conns[triggerName].main) || [];
let removed = false;
for (const lane of lanes) {
  for (let i = lane.length - 1; i >= 0; i--) if (lane[i].node === firstName) { lane.splice(i, 1); removed = true; }
}
if (!removed) { console.error(`Edge ${triggerName} -> ${firstName} not found; refusing to guess`); process.exit(1); }
const edge = (to) => ({ node: to, type: 'main', index: 0 });
conns[triggerName] = { main: [[...(lanes[0] || []), edge('Run Context')]] };
conns['Launch Webhook'] = { main: [[edge('Fetch Launch Record')]] };
conns['Fetch Launch Record'] = { main: [[edge('Stamp Running')]] };
conns['Stamp Running'] = { main: [[edge('Run Context')]] };
conns['Run Context'] = { main: [[edge(firstName)]] };

if (logName) {
  const log = byName(logName);
  if (!log) { console.error(`Log node not found: ${logName}`); process.exit(1); }
  log.parameters.operation = 'upsert';
  log.parameters.columns = Object.assign({}, log.parameters.columns, { mappingMode: 'autoMapInputData', value: {}, matchingColumns: ['Execution ID'], schema: [] });
  log.parameters.options = Object.assign({}, log.parameters.options, { typecast: true });
  log.onError = 'stopWorkflow';
}
wf.settings = Object.assign({}, wf.settings, { errorWorkflow: 'gqm6HzVNzEMQ8Ml0' });

fs.writeFileSync(wfPath, JSON.stringify(wf, null, 2) + '\n');
console.log(`${wf.name}: Launch Webhook (/webhook/${hookPath}) -> Fetch Launch Record -> Stamp Running -> Run Context -> ${firstName}; ${triggerName} -> Run Context${logName ? `; ${logName} now upserts on Execution ID` : ''}; Error Logger attached`);
