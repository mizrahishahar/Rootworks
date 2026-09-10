// Build Guard Fail Log: the row a refused run writes. Every guard in this Rootflow NAMES its
// reason and routes here instead of throwing (ruled 2026-09-10), so a bad payload, an unready
// base or an unresolvable signal is always readable on one Hub Automations row. Four guards, in
// order: the payload (Parse Launch), the Signals row (Parse Play), the client row (Client Vars,
// no Clayroots Base ID), the base's tables (Find Companies Table) and the mirror row (Resolve
// Mirror Row). Nothing was pulled, nothing was spent, nothing was written, so the row closes
// Failed with the reason, the way the reference Insert does.
const at=(n)=>{ try{ return $(n).first().json||{}; }catch(e){ return {}; } };
const launch=at('Parse Launch');
const play=at('Parse Play');
const cv=at('Client Vars');
const tables=at('Find Companies Table');
const mirror=at('Resolve Mirror Row');
let where='', reason='', client=play.client||'';
if(launch.config_ok===false){ where='the Apify webhook payload'; reason=(launch.missing||[]).join(', ')||'unknown'; }
else if(play.config_ok===false){ where='Hub Signals row '+(play.play||''); reason=(play.missing||[]).join(', ')||'unknown'; }
else if(!cv.base){ where='the Hub Clients row for '+(cv.clientName||client||'this client'); reason='Clayroots Base ID is empty'; }
else if(tables.refused){ where='the client base '+(cv.base||''); reason=String(tables.refused); }
else if(mirror.refused){ where='the Signals mirror in base '+(cv.base||''); reason=String(mirror.refused); }
else { where='a guard'; reason='refused and no reason was recorded'; }
const show=(v)=>(v===''||v===null||v===undefined)?'(empty)':String(v);
const lines=[
  '**Refused before anything ran: '+reason+'**',
  '',
  '**Where:** '+where,
  '',
  '**The payload as this Rootflow read it**',
  '- **signal (Hub Signals record id):** '+show(launch.signal),
  '- **resource.defaultDatasetId:** '+show(launch.datasetId),
  '- **tag:** '+show(launch.tag),
  '- **Client (from the Signals row):** '+show(client),
  '- **Clayroots Base ID:** '+show(cv.base),
  '',
  '**Failures (1)**',
  '- Launch guard: '+reason,
  '',
  'Apify was not read, DiscoLike was not called and nothing was written to the client base.',
  'The contract: POST /webhook/discover-hiring-companies {signal: <Hub Signals record id>, resource: {{resource}}, tag: <optional>}. The Signals row needs Client (its Clients row carries the Clayroots Base ID), Roles, Country, Max Employees, ICP.'
];
const row={
 'Automation':'Discover Hiring Companies',
 'Status':'Failed',
 'Run at': $now.toISO(),
 'Records In': 0,
 'Records Out': 0,
 'Errors': 1,
 'Target': 'Companies',
 'Trigger':'webhook',
 'Execution ID': String($execution.id),
 'Execution Link': 'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id,
 'Description': lines.join('\n')
};
if(client) row['Client']=[client];
return [{json:row}];
