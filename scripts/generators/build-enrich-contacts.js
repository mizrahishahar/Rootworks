#!/usr/bin/env node
// Enrich Contacts, the generator (2026-09-10). Three workflows:
//   Enrich Contacts        the Rootflow: launch row, plan, ONE loop over every chunk in provider
//                          priority order, the launch row refreshed when a provider closes, the
//                          Contacts Pulled At stamp, the email hand-off, the log
//   Enrich Contacts Chunk  one execution per chunk: a switch on the provider (Blitz, GetLeads,
//                          QuickEnrich, Supersoniq), the vendor calls, the parse, the writer call
//   Enrich Contacts Writer the one merge-and-write into People (built once, not regenerated here)
// Usage: node scripts/generators/build-enrich-contacts.js chunk|parent
// Writes workflow.json into n8n/rootflows/Enrich-Contacts/{Enrich-Contacts-Chunk, Enrich-Contacts}; node code lives in
// their nodes/ folders and is referenced as @@file. Push with scripts/n8n-push.js afterwards.
const fs = require('fs');
const path = require('path');
// The Rootflow folder under the layout: n8n/rootflows/Enrich-Contacts/<workflow>/
const ROOT = path.resolve(__dirname, '..', '..', 'n8n', 'rootflows', 'Enrich-Contacts');
const ERR = 'gqm6HzVNzEMQ8Ml0';
const WRITER_ID = 'rc2IqbRdeTHjLP6F';
const AT = { airtableTokenApi: { id: 'RZ2SX89iUyF4aEWJ', name: 'Airtable' } };
const HUB = { base: { __rl: true, mode: 'id', value: 'appQG6dK0FIOhTxOl' }, table: { __rl: true, mode: 'id', value: 'tbli7rV6Qf3sLpV6R' } };
const what = process.argv[2];
let seq = 0;
const uid = (p) => `${p}-${String(++seq).padStart(4, '0')}-4000-8000-${String(seq).padStart(12, '0')}`;
const code = (name, file, x, y, notes) => ({ parameters: { jsCode: `@@file:nodes/${file}` }, id: uid('ec10'), name, type: 'n8n-nodes-base.code', typeVersion: 2, position: [x, y], ...(notes ? { notes } : {}) });
const trigger = (name, x, y, notes) => ({ parameters: { inputSource: 'passthrough' }, id: uid('ec10'), name, type: 'n8n-nodes-base.executeWorkflowTrigger', typeVersion: 1.2, position: [x, y], ...(notes ? { notes } : {}) });
const ifNone = (name, x, y) => ({ parameters: { conditions: { options: { caseSensitive: true, leftValue: '', typeValidation: 'loose', version: 2 }, conditions: [{ id: 'n1', leftValue: '={{ $json._none === true }}', rightValue: '', operator: { type: 'boolean', operation: 'false', singleValue: true } }], combinator: 'and' }, options: {} }, id: uid('ec10'), name, type: 'n8n-nodes-base.if', typeVersion: 2.2, position: [x, y] });
const ifTrue = (name, x, y, expr, notes) => ({ parameters: { conditions: { options: { caseSensitive: true, leftValue: '', typeValidation: 'loose', version: 2 }, conditions: [{ id: 't1', leftValue: expr, rightValue: '', operator: { type: 'string', operation: 'notEmpty', singleValue: true } }], combinator: 'and' }, options: {} }, id: uid('ec10'), name, type: 'n8n-nodes-base.if', typeVersion: 2.2, position: [x, y], ...(notes ? { notes } : {}) });
const http = (name, x, y, params, extra) => Object.assign({ parameters: params, id: uid('ec10'), name, type: 'n8n-nodes-base.httpRequest', typeVersion: 4.4, position: [x, y], retryOnFail: true, maxTries: 3, waitBetweenTries: 5000, onError: 'continueRegularOutput' }, extra || {});
const headerAuth = { authentication: 'genericCredentialType', genericAuthType: 'httpHeaderAuth' };
const jsonBody = { sendBody: true, specifyBody: 'json', jsonBody: '={{ JSON.stringify($json.body) }}' };
const resp = (full) => ({ response: { response: { fullResponse: !!full, neverError: false } } });
const batching = (ms) => ({ batching: { batch: { batchSize: 1, batchInterval: ms } } });
const cred = (id, name) => ({ credentials: { httpHeaderAuth: { id, name } } });
const loop = (name, x, y, notes) => ({ parameters: { batchSize: 1, options: {} }, id: uid('ec10'), name, type: 'n8n-nodes-base.splitInBatches', typeVersion: 3, position: [x, y], ...(notes ? { notes } : {}) });
const exec = (name, wfId, cached, x, y, notes) => ({ parameters: { workflowId: { __rl: true, mode: 'id', value: wfId, cachedResultName: cached }, workflowInputs: { mappingMode: 'passThrough', value: {}, matchingColumns: [], schema: [] }, mode: 'once', options: { waitForSubWorkflow: true } }, id: uid('ec10'), name, type: 'n8n-nodes-base.executeWorkflow', typeVersion: 1.3, position: [x, y], onError: 'continueRegularOutput', ...(notes ? { notes } : {}) });
const hubUpsert = (name, x, y, notes) => ({ parameters: { resource: 'record', operation: 'upsert', ...HUB, columns: { mappingMode: 'autoMapInputData', value: {}, matchingColumns: ['Execution ID'], schema: [] }, options: { typecast: true } }, id: uid('ec10'), name, type: 'n8n-nodes-base.airtable', typeVersion: 2.2, position: [x, y], onError: 'stopWorkflow', credentials: AT, ...(notes ? { notes } : {}) });
const atSearch = (name, x, y, baseExpr, tableExpr, fields, notes) => ({ parameters: { resource: 'record', operation: 'search', base: { __rl: true, mode: 'id', value: baseExpr }, table: { __rl: true, mode: 'id', value: tableExpr }, filterByFormula: '={{ $json.formula }}', returnAll: true, options: { fields } }, id: uid('ec10'), name, type: 'n8n-nodes-base.airtable', typeVersion: 2.2, position: [x, y], alwaysOutputData: true, onError: 'continueRegularOutput', credentials: AT, ...(notes ? { notes } : {}) });
const atPatch = (name, x, y, url, notes) => ({ parameters: { method: 'PATCH', url, authentication: 'predefinedCredentialType', nodeCredentialType: 'airtableTokenApi', ...jsonBody, options: { ...batching(200), response: { response: { fullResponse: true, neverError: true } }, timeout: 60000 } }, id: uid('ec10'), name, type: 'n8n-nodes-base.httpRequest', typeVersion: 4.4, position: [x, y], onError: 'continueRegularOutput', credentials: AT, ...(notes ? { notes } : {}) });
const switchOn = (name, x, y, keys, notes) => ({ parameters: { rules: { values: keys.map(k => ({ conditions: { options: { caseSensitive: true, leftValue: '', typeValidation: 'strict', version: 2 }, conditions: [{ leftValue: '={{ $json.provider }}', rightValue: k, operator: { type: 'string', operation: 'equals' } }], combinator: 'and' }, renameOutput: true, outputKey: k })) }, options: {} }, id: uid('ec10'), name, type: 'n8n-nodes-base.switch', typeVersion: 3.2, position: [x, y], ...(notes ? { notes } : {}) });
const conn = (edges) => { const c = {}; for (const [from, to, out] of edges) { c[from] = c[from] || { main: [] }; const o = out || 0; while (c[from].main.length <= o) c[from].main.push([]); c[from].main[o].push({ node: to, type: 'main', index: 0 }); } return c; };
const check = (nodes, edges) => { const by = {}; for (const n of nodes) by[n.name] = n; for (const [a, b] of edges) { if (!by[a]) throw new Error('node missing: ' + a); if (!by[b]) throw new Error('node missing: ' + b); } };
const write = (slug, doc) => { fs.writeFileSync(path.join(ROOT, slug, 'workflow.json'), JSON.stringify(doc, null, 2) + '\n'); console.log('wrote', slug, doc.nodes.length, 'nodes'); };
const idOf = (slug) => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, slug, 'workflow.json'), 'utf8')).id || ''; } catch (e) { return ''; } };

// ---------- Enrich Contacts Chunk ----------
if (what === 'chunk') {
  const id = idOf('Enrich-Contacts-Chunk');
  if (!id) throw new Error('Enrich-Contacts-Chunk/workflow.json must carry the id (the former Blitz chunk worker)');
  const Y = { Blitz: -450, GetLeads: -150, QuickEnrich: 150, Supersoniq: 450 };
  const X = 660;
  const nodes = [
    trigger('Chunk Trigger', 0, 0, 'Enrich Contacts Chunk (2026-09-10): one chunk of companies in, the Rootflow contract on the item {base, peopleTableId, peopleFields, contactSourceMulti, dncDomains, provider, idx, count, companies:[{recordId, domain, cap, floor}]}. The provider picks the branch; the branch asks its vendor at its documented pace, parses, hands the people to Enrich Contacts Writer (awaited) and answers counters. Its own execution, so its payloads die with it.'),
    switchOn('Provider?', 220, 0, ['Blitz', 'GetLeads', 'QuickEnrich', 'Supersoniq'], 'One branch per provider. Priority is the order the Rootflow sends chunks in, not this switch.'),
    // Blitz
    code('BZ Companies', 'BZ-Companies.js', X, Y.Blitz), ifNone('Any BZ Companies?', X + 220, Y.Blitz),
    Object.assign(http('BZ Domain To LinkedIn', X + 440, Y.Blitz - 120, { method: 'POST', url: 'https://api.blitz-api.ai/v2/enrichment/domain-to-linkedin', ...headerAuth, ...jsonBody, options: { ...batching(120), ...resp(true), timeout: 60000 } }, { notes: 'Blitz: the company LinkedIn page for a domain. 10 requests a second per endpoint documented; paced at 8.' }), cred('UtqF0yZTXaZzKocn', 'Blitz')),
    code('BZ Roster Requests', 'BZ-Roster-Requests.js', X + 660, Y.Blitz), ifNone('Any BZ Roster?', X + 880, Y.Blitz),
    Object.assign(http('BZ Employee Finder', X + 1100, Y.Blitz - 120, { method: 'POST', url: 'https://api.blitz-api.ai/v2/search/employee-finder', ...headerAuth, ...jsonBody, options: { ...batching(120), ...resp(true), timeout: 60000 } }, { notes: 'Blitz: everyone at one company page, job_level filtered, max_results = the cap (50 at most, one page).' }), cred('UtqF0yZTXaZzKocn', 'Blitz')),
    code('BZ Parse', 'BZ-Parse.js', X + 1320, Y.Blitz),
    // GetLeads
    code('GL Requests', 'GL-Requests.js', X, Y.GetLeads), ifNone('Any GL Requests?', X + 220, Y.GetLeads),
    Object.assign(http('GL Search', X + 440, Y.GetLeads - 120, { method: 'POST', url: 'https://app.getleads.io/api/v1/contacts/search', ...headerAuth, ...jsonBody, options: { ...batching(700), ...resp(false), timeout: 180000 } }, { notes: 'GetLeads contact search, one call per (floor, cap) group sized so one 5,000-row page holds the whole answer (GL Requests). No node pagination (paging on a JSON body repeated the same page and aborted, run 22643). Every returned row costs one fair-use row, never cash.' }), cred('fsDQV3D9bINmYCrD', 'GetLeads')),
    code('GL Parse', 'GL-Parse.js', X + 660, Y.GetLeads),
    // QuickEnrich
    code('QE Companies', 'QE-Companies.js', X, Y.QuickEnrich), ifNone('Any QE Companies?', X + 220, Y.QuickEnrich),
    Object.assign(http('QE Roster', X + 440, Y.QuickEnrich - 120, { method: 'POST', url: 'https://app.quickenrich.io/api/employees/contact-finder', ...headerAuth, sendHeaders: true, headerParameters: { parameters: [{ name: 'Accept', value: 'application/json' }] }, ...jsonBody, options: { ...batching(500), ...resp(true), timeout: 60000 } }, { notes: 'QuickEnrich: the free roster of a domain (no emails, has_email flags and LinkedIn URLs). 120 requests a minute documented; paced at 120.' }), cred('bHGK0aG9f2Y8kokT', 'QuickEnrich')),
    code('QE Pick', 'QE-Pick.js', X + 660, Y.QuickEnrich), ifNone('Any QE Picks?', X + 880, Y.QuickEnrich),
    Object.assign(http('QE Email', X + 1100, Y.QuickEnrich - 120, { method: 'GET', url: '={{ $json.url }}', ...headerAuth, sendHeaders: true, headerParameters: { parameters: [{ name: 'Accept', value: 'application/json' }] }, options: { ...batching(70), ...resp(true), timeout: 60000 } }, { notes: 'QuickEnrich: the email search per person (a real LinkedIn URL first, else name + domain), one credit only on a hit. 1,000 requests a minute documented; paced at about 850.' }), cred('bHGK0aG9f2Y8kokT', 'QuickEnrich')),
    code('QE Parse', 'QE-Parse.js', X + 1320, Y.QuickEnrich),
    // Supersoniq, gated
    code('Relevant Filters', 'Relevant-Filters.js', X, Y.Supersoniq, 'The Supersoniq gate: one formula per 100 domains for the relevant People rows at this chunk\'s domains.'),
    atSearch('Read Relevant People', X + 220, Y.Supersoniq, "={{ $('Chunk Trigger').first().json.base }}", "={{ $('Chunk Trigger').first().json.peopleTableId }}", ['Domain'], 'Relevant people already held at the chunk\'s domains (the free providers ran first); SQ Requests asks Supersoniq only for companies below 5. A base without a relevance rule has none, so every company passes.'),
    code('SQ Requests', 'SQ-Requests.js', X + 440, Y.Supersoniq), ifNone('Any SQ Requests?', X + 660, Y.Supersoniq),
    (() => { const n = Object.assign(http('SQ Enrich', X + 880, Y.Supersoniq - 120, { method: 'POST', url: 'https://api.supersoniq.app/partner/v1/companies/enrich', ...headerAuth, sendBody: true, specifyBody: 'json', jsonBody: '={{ $json.body }}', options: { response: { response: { neverError: true } }, timeout: 120000 } }, { notes: 'Supersoniq companies/enrich, up to 1,000 domains a call, per_company_limit 10, seniors only (Director and up), tier full so the email rides. One credit per delivered contact.' }), cred('CQpoAyABVQwob0vN', 'supersoniq'), { retryOnFail: false }); delete n.maxTries; delete n.waitBetweenTries; return n; })(),
    code('SQ Parse', 'SQ-Parse.js', X + 1100, Y.Supersoniq),
    // shared tail
    code('Writer Input', 'Writer-Input.js', X + 1760, 0),
    exec('Call Writer', WRITER_ID, 'Enrich Contacts Writer', X + 1980, 0, 'Awaited. The writer merges this chunk into People and answers counters; a crash comes back as an error item and is counted.'),
    code('Chunk Response', 'Chunk-Response.js', X + 2200, 0)
  ];
  const edges = [
    ['Chunk Trigger', 'Provider?'],
    ['Provider?', 'BZ Companies', 0], ['Provider?', 'GL Requests', 1], ['Provider?', 'QE Companies', 2], ['Provider?', 'Relevant Filters', 3],
    ['BZ Companies', 'Any BZ Companies?'], ['Any BZ Companies?', 'BZ Domain To LinkedIn', 0], ['Any BZ Companies?', 'BZ Parse', 1], ['BZ Domain To LinkedIn', 'BZ Roster Requests'], ['BZ Roster Requests', 'Any BZ Roster?'], ['Any BZ Roster?', 'BZ Employee Finder', 0], ['Any BZ Roster?', 'BZ Parse', 1], ['BZ Employee Finder', 'BZ Parse'], ['BZ Parse', 'Writer Input'],
    ['GL Requests', 'Any GL Requests?'], ['Any GL Requests?', 'GL Search', 0], ['Any GL Requests?', 'GL Parse', 1], ['GL Search', 'GL Parse'], ['GL Parse', 'Writer Input'],
    ['QE Companies', 'Any QE Companies?'], ['Any QE Companies?', 'QE Roster', 0], ['Any QE Companies?', 'QE Parse', 1], ['QE Roster', 'QE Pick'], ['QE Pick', 'Any QE Picks?'], ['Any QE Picks?', 'QE Email', 0], ['Any QE Picks?', 'QE Parse', 1], ['QE Email', 'QE Parse'], ['QE Parse', 'Writer Input'],
    ['Relevant Filters', 'Read Relevant People'], ['Read Relevant People', 'SQ Requests'], ['SQ Requests', 'Any SQ Requests?'], ['Any SQ Requests?', 'SQ Enrich', 0], ['Any SQ Requests?', 'SQ Parse', 1], ['SQ Enrich', 'SQ Parse'], ['SQ Parse', 'Writer Input'],
    ['Writer Input', 'Call Writer'], ['Call Writer', 'Chunk Response']
  ];
  check(nodes, edges);
  write('Enrich-Contacts-Chunk', { id, name: 'Enrich Contacts Chunk', active: false, nodes, connections: conn(edges), settings: { executionOrder: 'v1', errorWorkflow: ERR }, staticData: null, meta: { templateCredsSetupCompleted: true }, pinData: {}, tags: [] });
}

// ---------- Enrich Contacts ----------
if (what === 'parent') {
  const CHUNK_ID = idOf('Enrich-Contacts-Chunk');
  if (!CHUNK_ID) throw new Error('push Enrich-Contacts-Chunk first');
  const doc = JSON.parse(fs.readFileSync(path.join(ROOT, 'Enrich-Contacts', 'workflow.json'), 'utf8'));
  const keep = ['Launch Webhook', 'Fetch Launch Record', 'Stamp Running', 'Sub Trigger', 'Event Row', 'Resolve Base', 'Launch Params', 'Launch OK?', 'AT List Tables', 'Find Tables', 'Read Companies View', 'Pick Companies', 'Any Companies?', 'Get DNC Domains', 'Plan Companies', 'Stamp Rows', 'Stamp Companies', 'AT List Views', 'Find Waterfall View', 'Waterfall View?', 'Fire Waterfall', 'Build Log', 'Build Refusal', 'Log Run'];
  const by = {}; for (const n of doc.nodes) by[n.name] = n;
  for (const k of keep) if (!by[k]) throw new Error('parent node missing: ' + k);
  const nodes = keep.map(k => by[k]);
  by['Sub Trigger'].notes = 'Event entry: one item carrying the same keys as a launch row (Client, View, Tag, and Domains for the insert doors). This is how an insert door calls this machine after landing: View "Not Sourced", Domains = what it landed. No launch row, no Running stamp; the first provider close creates the run row on Execution ID.';
  by['AT List Views'].notes = 'After the loop closed and the companies were stamped: read the base meta again; the email door fires once if People carries a view named exactly "Not Waterfalled".';
  let x = 2860;
  nodes.push(code('Make Chunks', 'Make-Chunks.js', x, -120, 'Every chunk of the run, one flat list in provider priority order; the per-provider accumulators start here.'));
  nodes.push(loop('Chunk Loop', x + 220, -120, 'One chunk at a time, one execution each (Enrich Contacts Chunk). Done output: stamp, hand-off, log.'));
  nodes.push(code('Chunk Input', 'Chunk-Input.js', x + 440, 0));
  nodes.push(exec('Call Chunk', CHUNK_ID, 'Enrich Contacts Chunk', x + 660, 0, 'Awaited. One execution per chunk; a crash comes back as an error item and is counted, the loop moves on.'));
  nodes.push(code('Chunk Tick', 'Chunk-Tick.js', x + 880, 0));
  nodes.push(ifTrue('Lane Closed?', x + 1100, 0, '={{ $json.laneClosed || \'\' }}', 'True after a provider\'s last chunk: the launch row is refreshed before the next provider starts.'));
  nodes.push(code('Lane Progress', 'Lane-Progress.js', x + 1320, 120));
  nodes.push(hubUpsert('Stamp Progress', x + 1540, 120, 'The launch row refreshed after each provider closed: Status Running, the running funnel, Tally; on Execution ID (created here on an event run).'));
  by['Stamp Rows'].position = [x + 440, -300]; by['Stamp Companies'].position = [x + 660, -300]; by['AT List Views'].position = [x + 880, -300]; by['Find Waterfall View'].position = [x + 1100, -300]; by['Waterfall View?'].position = [x + 1320, -300]; by['Fire Waterfall'].position = [x + 1540, -420]; by['Build Log'].position = [x + 1760, -300]; by['Log Run'].position = [x + 1980, -300]; by['Build Refusal'].position = [x + 1760, -560];
  const edges = [
    ['Launch Webhook', 'Fetch Launch Record'], ['Fetch Launch Record', 'Stamp Running'], ['Stamp Running', 'Resolve Base'],
    ['Sub Trigger', 'Event Row'], ['Event Row', 'Resolve Base'], ['Resolve Base', 'Launch Params'], ['Launch Params', 'Launch OK?'],
    ['Launch OK?', 'AT List Tables', 0], ['Launch OK?', 'Build Refusal', 1], ['Build Refusal', 'Log Run'],
    ['AT List Tables', 'Find Tables'], ['Find Tables', 'Read Companies View'], ['Read Companies View', 'Pick Companies'], ['Pick Companies', 'Any Companies?'],
    ['Any Companies?', 'Get DNC Domains', 0], ['Any Companies?', 'Build Log', 1], ['Get DNC Domains', 'Plan Companies'], ['Plan Companies', 'Make Chunks'], ['Make Chunks', 'Chunk Loop'],
    ['Chunk Loop', 'Stamp Rows', 0], ['Chunk Loop', 'Chunk Input', 1], ['Chunk Input', 'Call Chunk'], ['Call Chunk', 'Chunk Tick'], ['Chunk Tick', 'Lane Closed?'],
    ['Lane Closed?', 'Lane Progress', 0], ['Lane Closed?', 'Chunk Loop', 1], ['Lane Progress', 'Stamp Progress'], ['Stamp Progress', 'Chunk Loop'],
    ['Stamp Rows', 'Stamp Companies'], ['Stamp Companies', 'AT List Views'], ['AT List Views', 'Find Waterfall View'], ['Find Waterfall View', 'Waterfall View?'], ['Waterfall View?', 'Fire Waterfall', 0], ['Waterfall View?', 'Build Log', 1], ['Fire Waterfall', 'Build Log'], ['Build Log', 'Log Run']
  ];
  check(nodes, edges);
  write('Enrich-Contacts', { id: doc.id, name: 'Enrich Contacts', active: doc.active, nodes, connections: conn(edges), settings: doc.settings, staticData: null, meta: doc.meta || {}, pinData: {}, tags: doc.tags || [] });
  for (const f of fs.readdirSync(path.join(ROOT, 'Enrich-Contacts', 'nodes'))) { if (/-Lane-Input\.js$|-Progress\.js$|^Relevant-Filters\.js$/.test(f) && f !== 'Lane-Progress.js') { fs.unlinkSync(path.join(ROOT, 'Enrich-Contacts', 'nodes', f)); console.log('removed', f); } }
}
