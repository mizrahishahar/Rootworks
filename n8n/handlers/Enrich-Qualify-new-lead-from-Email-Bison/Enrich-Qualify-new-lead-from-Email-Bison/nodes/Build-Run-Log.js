const sd2=$getWorkflowStaticData('global'); const rs=sd2.runStartedAt||0;
const n=$('Normalize').first().json;
const cv=$('Client Vars').first().json;
const manual=!!cv.manual;
const clientRec=cv.recordId||'';
const name=(n.full_name||'').trim();
const base={
 'Automation':'Enrich & Qualify new lead from Email Bison',
 'Client': clientRec?[clientRec]:[cv.clientName||''],
 'Run at': $now.toISO(),
 'Records In': 1,
 'Records Out': 1,
 'Target': n.lead_email||'',
 'Trigger': manual?'manual':'event',
 'Execution ID': String($execution.id),
 'Execution Link': 'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id,
 'Duration s': Math.round(($now.toMillis() - (rs||$now.toMillis()))/1000)
};
let f=null; try{ f=$('Flatten').first().json; }catch(e){}
let laterUpdate=null; try{ laterUpdate=$('Update Prospect Reply').first().json; }catch(e){}
if(laterUpdate){
 // Later-reply branch: Lead in CRM? found him already in the CRM on a live run, and Later Reply
 // Guard confirmed his latest message is strictly newer than Last Engaged, so it was written.
 let exId=''; try{ exId=$('Find CRM Prospect').first().json.id||''; }catch(e){}
 let currentStatus=''; try{ currentStatus=String((($('Find CRM Prospect').first().json.fields)||{})['OutreachStatus']||''); }catch(e){}
 const statusAfter=(currentStatus==='Lost')?'Positive Reply':(currentStatus||'Positive Reply');
 const disqualified=currentStatus==='Disqualified';
 let woke=false; try{ woke=!!($('Wake Operator Later').first().json); }catch(e){}
 const desc=[
 '**Later reply, prospect already in CRM**',
 '- **Lead:** '+(name?name+' ':'')+'<'+(n.lead_email||'')+'>'+(n.job_title?', '+n.job_title:''),
 '- **Company:** '+(n.company_name||'unknown')+(n.domain?' ('+n.domain+')':''),
 '- **Prospect:** '+(exId||laterUpdate.id||'unknown')+', status '+statusAfter,
 '- **Outcome:** conversation thread and Last Engaged refreshed, Follow-ups reset, NextTouchDate cleared'+(disqualified?'; prospect is Disqualified, operator not woken':(woke?'; operator woken':'; wake not confirmed'))
 ].join('\n').replace('**\n','**\n\n');
 return [{json:Object.assign({'Status':'Succeeded','Errors':0,'Description':desc},base)}];
}
if(!f){
 // Legacy safety net: should no longer fire, since Lead in CRM? true now always routes through the
 // later-reply branch above. Kept in case a run reaches here with neither Flatten nor a later-reply
 // update (e.g. a future rewire), so the log still gets a row instead of the node erroring.
 let exId=''; try{ exId=$('Find CRM Prospect').first().json.id||''; }catch(e){}
 const desc=[
 '**Existing prospect, skipped**',
 '- **Lead:** '+(name?name+' ':'')+'<'+(n.lead_email||'')+'>'+(n.job_title?', '+n.job_title:''),
 '- **Company:** '+(n.company_name||'unknown')+(n.domain?' ('+n.domain+')':''),
 '- **Outcome:** existing prospect already in CRM'+(exId?' ('+exId+')':'')+'; reply not reprocessed, qualification and Slack post skipped'
 ].join('\n').replace('**\n','**\n\n');
 return [{json:Object.assign({'Status':'Succeeded','Errors':0,'Description':desc},base)}];
}
let prospectId='';
try{prospectId=$('Resolve Prospect').first().json.prospect_id||'';}catch(e){}
let created=false;
try{ if($('Create CRM Prospect').first().json.id){created=true;} }catch(e){}
let verdictWritten=false;
try{const v=$('Set CRM Verdict').first().json; if(v&&v.id){verdictWritten=true;}}catch(e){}
let tsWritten=false;
try{const t=$('Set Thread TS').first().json; if(t&&t.id){tsWritten=true;}}catch(e){}
let phoneVal=''; let phoneSource='none';
try{ const rp=$('Resolve Phone').first().json; phoneVal=rp.phone||''; phoneSource=rp.phone_source||'none'; }catch(e){}
const verdict=f.custom_qualification_status||'unknown';
const qualified=verdict!=='out_of_icp';
const campaign=(n.campaign_name?n.campaign_name+(n.campaign_id?' ('+n.campaign_id+')':''):(n.campaign_id||'unknown'));
const failed=[];
if(!prospectId) failed.push('prospect not created');
if(!verdictWritten) failed.push('verdict not written');
if(qualified && !tsWritten) failed.push('thread ts not saved');
let desc=[
'**'+(f.company_name||n.company_name||n.lead_email||'unknown')+' · '+verdict+(manual?' (manual trigger, fired by the Airtable automation)':'')+'**',
'',
'- **Lead:** '+(name?name+' ':'')+'<'+(n.lead_email||'')+'>'+(n.job_title?', '+n.job_title:''),
'- **Company:** '+(f.company_name||n.company_name||'unknown')+(n.domain?' ('+n.domain+')':''),
'- **Source:** Email Bison campaign '+campaign+(n.is_freemail?' (freemail address)':'')+(n.found_on_bison===false?' (lead not found on the instance)':'')+(manual?' | manual/airtable trigger':''),
'- **Verdict:** '+verdict+(f.verdict_reason?' ('+f.verdict_reason+')':'')+(f.recommended_action?' | Recommended: '+f.recommended_action:''),
'- **Base:** '+(f.base_source||'unknown')+(f.base_match?' (matched on '+f.base_match+')':'')+(f.base_reason?' ('+f.base_reason+')':''),
'- **Phone:** '+(phoneVal||'Not found')+' (source: '+phoneSource+')',
'- **CRM:** Prospects row '+(created?'created':'updated (existing row)')+(prospectId?' ('+prospectId+')':'')+(created?', contact row + ':', ')+'qualification brief + conversation thread written',
'- **Pipeline:** '+(verdictWritten?('set from verdict "'+verdict+'" (Positive Reply / Disqualified)'):'not written'),
'- **Slack:** qualification brief posted to client channel '+(cv.slackChannel||'')+(tsWritten?', thread ts written to prospect':'')
].join('\n');
if(failed.length) desc+='\n\n**FAILED ('+failed.length+')**\n'+failed.map(x=>'- '+x).join('\n');
return [{json:Object.assign({'Status':failed.length?'Succeeded with errors':'Succeeded','Errors':failed.length,'Description':desc},base)}];