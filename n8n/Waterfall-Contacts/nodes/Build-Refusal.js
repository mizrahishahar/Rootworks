// Build Refusal: the row a badly filled launch writes. Added 2026-09-03 after a launch POSTed a
// row with pieces missing and the run died inside Launch Params: n8n took the POST and then wrote
// nothing back, no Status, no run row, no execution link, so the refusal was invisible to the
// Operator. A refusal is an expected outcome, not a crash, so it is logged as one: Launch Params
// names the reason instead of throwing, Launch OK? routes here, and this closes the launch row
// (already stamped Running with this Execution ID) as Failed with the reason and the link.
// Nothing paid ran: the guards still sit ahead of the base read and every provider call.
const p=$('Launch Params').first().json||{};
const reason=String(p.refused||'the launch row was refused and no reason was recorded');
const show=(v)=>(v===''||v===null||v===undefined||v===0)?'(empty)':String(v);
const lines=[
  '**Refused before anything ran: '+reason+'**',
  '',
  '**Scope:** '+(p.clientRecId?('one client ('+p.clientRecId+')'):'no client resolved')+', launch '+(p._launchRecordId||'(event call, no launch row)'),
  '',
  '**The launch row as this machine read it**',
  '- **Client:** '+show(p.clientRecId),
  '- **Clayroots Base ID:** '+(p.base||'(empty, or the Clients row could not be read)'),
  '- **Table:** '+show(p.table)+' (only "Companies" is accepted)',
  '- **View:** '+show(p.view),
  '- **Max companies:** '+show(p.maxCompanies),
  '- **Tiers:** '+(p.tiers||'(blank, would have fallen back to Sources)'),
  '',
  '**Failures (1)**',
  '- Launch guard: '+reason,
  '',
  'No company view was read, no contact source was called, no credit was spent and nothing was',
  'written to the client base. Fill the named field on the launch row, clear Execution ID, and the',
  'Airtable door will fire it again.'
];
let dur=0; try{ dur=Math.max(0,Math.round(($now.toMillis()-new Date(p.startedAt).getTime())/1000)); }catch(e){}
const log={
  'Automation':'Waterfall Contacts',
  'Status':'Failed',
  'Trigger': p.trigger||'form',
  'Errors': 1,
  'Run at': $now.toISO(),
  'Records In': 0,
  'Records Out': 0,
  'Duration s': dur,
  'Description': lines.join('\n'),
  'Execution Link':'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id,
  'Execution ID': String($execution.id)
};
if(p.view) log['View']=p.view;
// Never emit an empty link array onto a field that may already hold a value: omit the key instead.
if(p.clientRecId) log['Client']=[p.clientRecId];
return [{ json: log }];
