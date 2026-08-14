const sd2=$getWorkflowStaticData('global'); const rs=sd2.runStartedAt||0;
let P={};
try{ P=$('Payload').first().json||{}; }catch(e){}
let ts='';
try{ const s=$('Slack BDR').first().json||{}; ts=s.ts||s.message_timestamp||''; }catch(e){}
let hasContext=false;
try{ hasContext=!!$('Build Context Reply').first().json.has_context; }catch(e){}
let ctxPosted=false;
try{ const c=$('Slack Context Reply').first().json||{}; if(c.ts||c.message_timestamp){ctxPosted=true;} }catch(e){}
let tsWritten=false;
try{ const t=$('Set Thread TS').first().json; if(t&&t.id){tsWritten=true;} }catch(e){}
const failed=[];
if(hasContext&&!ctxPosted) failed.push('context reply not posted');
if(!tsWritten) failed.push('thread ts not written');
const status=failed.length?'Succeeded with errors':'Succeeded';
let desc=[
'**'+(P.company_name||'unknown')+' · '+(P.verdict||'unknown')+'**',
'',
'- **Lead:** <'+(P.lead_email||'')+'> at '+(P.company_name||'unknown')+' | verdict: '+(P.verdict||'unknown'),
'- **Fired by:** Handle New Lead from PlusVibe',
'- **Card:** posted to moveplnr-bdr (C0AQ013Q8FN)'+(ts?' (ts '+ts+')':''),
'- **Context:** email thread context reply '+(ctxPosted?'posted in card thread':(hasContext?'not posted':'skipped, no context to post')),
'- **Thread TS:** prospect Slack Thread TS '+(tsWritten?'updated to the BDR card thread':'not updated')
].join('\n');
if(failed.length) desc+='\n\n**FAILED ('+failed.length+')**\n'+failed.map(x=>'- '+x).join('\n');
return [{json:{
 'Automation':'Log lead on BDR channel for moveplnr',
 'Client': P.recordId?[P.recordId]:['recyZTRr7Hb5S6Ozr'],
 'Status':status,
 'Run at': $now.toISO(),
 'Records In': 1,
 'Records Out': 1,
 'Errors': failed.length,
 'Target': (P.lead_email||'')+' -> C0AQ013Q8FN',
 'Trigger':'event',
 'Execution ID': String($execution.id),
 'Execution Link': 'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id,
 'Duration s': Math.round(($now.toMillis() - (rs||$now.toMillis()))/1000),
 'Description': desc
}}];