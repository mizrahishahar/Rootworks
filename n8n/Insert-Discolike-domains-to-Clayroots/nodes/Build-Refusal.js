// Build Refusal: the row a badly filled launch writes. Launch Params names the reason instead of
// throwing, Launch OK? routes here, and this closes the launch row (already stamped Running with
// this Execution ID) as Failed with the reason and the link. Nothing ran.
const p=$('Launch Params').first().json||{};
const reason=String(p.refused||'the launch row was refused and no reason was recorded');
const show=(v)=>(v===''||v===null||v===undefined)?'(empty)':String(v);
const lines=[
  '**Refused before anything ran: '+reason+'**',
  '',
  '**The launch row as this Rootflow read it**',
  '- **Client:** '+show(p.clientRecId),
  '- **Clayroots Base ID:** '+(p.base||'(empty, or the Clients row could not be read)'),
  '- **Query ID:** '+show(p.queryId),
  '- **Tag:** '+show(p.tag),
  '',
  '**Failures (1)**',
  '- Launch guard: '+reason,
  '',
  'DiscoLike was not called and nothing was written to the client base.',
  'Fill the named field on the launch row, clear Execution ID and Status, and the launch automation fires it again.'
];
let dur=0; try{ dur=Math.max(0,Math.round(($now.toMillis()-new Date(p.startedAt).getTime())/1000)); }catch(e){}
const log={ 'Automation':'Discover Discolike Companies', 'Status':'Failed', 'Trigger':'form', 'Errors':1, 'Run at':$now.toISO(), 'Records In':0, 'Records Out':0, 'Duration s':dur, 'Description':lines.join('\n'), 'Execution Link':'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id, 'Execution ID':String($execution.id) };
if(p.clientRecId) log['Client']=[p.clientRecId];
return [{ json: log }];
