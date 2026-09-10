// Build Refusal: the row a refused run writes. Two guards reach here and neither throws: Launch
// Params (a badly filled launch row) and Check Columns (People is missing a field this Rootflow
// needs and does not own). The row is closed as Failed with the reason, on the launch row itself
// when there was one (Stamp Running already put this Execution ID on it) and as its own Hub row
// otherwise. Nothing ran and no phone credit was spent.
let p={}; try{ p=$('Params').first().json||{}; }catch(e){}
if(!p.base){ try{ p=$('Launch Params').first().json||{}; }catch(e){} }
let reason=String(p.refused||'');
let missing='';
if(!reason){ try{ const c=$('Check Columns').first().json||{}; reason=String(c.refused||''); missing=(c.missing||[]).join(', '); }catch(e){} }
if(!reason) reason='the run was refused and no reason was recorded';
const show=(v)=>(v===''||v===null||v===undefined)?'(empty)':String(v);
const lines=[
  '**Refused before anything ran: '+reason+'**',
  '',
  '**The launch row as this Rootflow read it**',
  '- **Client:** '+show(p.clientRecId),
  '- **Clayroots Base ID:** '+(p.base||'(empty, or the Clients row could not be read)'),
  '- **Table:** People (implied)',
  '- **View:** '+show(p.view),
  '- **Tag:** '+show(p.tag)
];
if(missing) lines.push('', '**Missing fields:** '+missing+'. Enrich Phones creates only its own phone lane; the core belongs to the scaffold and to Enrich Contacts.');
lines.push(
  '',
  '**Failures (1)**',
  '- Guard: '+reason,
  '',
  'No provider was called, no credit was spent and nothing was written to the client base.',
  'Fix the named thing, clear Execution ID and Status on the launch row, and the launch automation fires it again.'
);
let dur=0; try{ dur=Math.max(0,Math.round(($now.toMillis()-new Date(p.startedAt).getTime())/1000)); }catch(e){}
const log={ 'Automation':'Enrich Phones', 'Status':'Failed', 'Trigger':p.trigger||'form', 'Errors':1, 'Run at':$now.toISO(), 'Records In':0, 'Records Out':0, 'Duration s':dur, 'View':p.view||'', 'Description':lines.join('\n'), 'Execution Link':'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id, 'Execution ID':String($execution.id) };
if(p.clientRecId) log['Client']=[p.clientRecId];
return [{ json: log }];
