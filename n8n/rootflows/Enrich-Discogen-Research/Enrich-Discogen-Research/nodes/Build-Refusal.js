// Build Refusal: the row a refused launch writes. A refusal is an expected outcome, not a crash:
// Launch Params, Resolve Table, Check Columns or Pick Rows named the reason instead of throwing, and
// this closes the row (already stamped Running with this Execution ID on a Hub launch) as Failed
// with the reason and the link. Nothing was submitted and nothing was paid for.
const p=$('Params').first().json||{};
const reasonOf=(name)=>{ try{ const j=$(name).first().json||{}; return String(j.refused||''); }catch(e){ return ''; } };
const reason=reasonOf('Pick Rows')||reasonOf('Check Columns')||reasonOf('Resolve Table')||String(p.refused||'')||'the launch was refused and no reason was recorded';
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
  '- **Prompt:** '+(p.prompt?String(p.prompt).replace(/\s+/g,' ').slice(0,200):'(empty)'),
  '- **Output Field:** '+show(p.outputField)+'; **Output Type:** '+show(p.outputType),
  '- **Web Search:** '+(p.webSearch?'on':'off')+'; **Evidence:** '+(p.evidence?'on':'off')+'; **Overwrite:** '+(p.overwrite?'on':'off'),
  '- **Max companies:** '+show(p.maxCompanies),
  '- **Tag:** '+show(p.tag),
  '',
  '**Failures (1)**',
  '- Launch guard: '+reason,
  '',
  'No DiscoGen task was submitted and nothing was written to the client base.',
  'Fix the named field on the launch row, clear Execution ID, and the Airtable door will fire it again.'
];
let dur=0; try{ dur=Math.max(0,Math.round(($now.toMillis()-new Date(p.startedAt).getTime())/1000)); }catch(e){}
const log={
  'Automation':'Enrich Discogen Research',
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
if(p.clientRecId) log['Client']=[p.clientRecId];
return [{ json: log }];
