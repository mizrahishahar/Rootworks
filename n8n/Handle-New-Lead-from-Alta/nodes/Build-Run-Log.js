const sd2=$getWorkflowStaticData('global'); const rs=sd2.runStartedAt||0;
const n=$('Alta Normalize').first().json;
const cv=$('Client Vars').first().json;
const name=(n.full_name||'').trim();
const base={
 'Automation':'Handle New Lead from Alta',
 'Client': cv.clientRecId?[cv.clientRecId]:[cv.clientName||''],
 'Run at': $now.toISO(),
 'Records In': 1,
 'Records Out': 1,
 'Target': n.lead_email||n.linkedin_url||'',
 'Trigger':'event',
 'Execution ID': String($execution.id),
 'Execution Link': 'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id,
 'Duration s': Math.round(($now.toMillis() - (rs||$now.toMillis()))/1000)
};
const leadLine='- **Lead:** '+(name?name+' ':'')+'<'+(n.lead_email||n.linkedin_url||'')+'>'+(n.job_title?', '+n.job_title:'');
const companyLine='- **Company:** '+(n.company_name||'unknown')+(n.domain?' ('+n.domain+')':'');
let f=null; try{ f=$('Flatten').first().json; }catch(e){}
if(!f){
 // Reached from an early exit: either Lead in CRM? yes (thread appended) or Interested? no.
 let threadRow=null; try{ threadRow=$('Update Prospect Thread').first().json||null; }catch(e){}
 if(threadRow){
  let exId=threadRow.id||'';
  if(!exId){ try{ exId=$('Find CRM Prospect').first().json.id||''; }catch(e){} }
  const failed=[];
  if(!threadRow.id) failed.push('thread not appended');
  let desc=[
  '**Existing prospect, thread appended**',
  '',
  leadLine,
  companyLine,
  '- **Outcome:** existing prospect'+(exId?' ('+exId+')':'')+', conversation thread appended; re-qualification and Slack post skipped'
  ].join('\n');
  if(failed.length) desc+='\n\n**FAILED ('+failed.length+')**\n'+failed.map(x=>'- '+x).join('\n');
  return [{json:Object.assign({'Status':failed.length?'Succeeded with errors':'Succeeded','Errors':failed.length,'Description':desc},base)}];
 }
 let screenVerdict='';
 try{ const s=$('Screen Reply').first().json; screenVerdict=(s&&s.output&&s.output.verdict)||''; }catch(e){}
 const desc=[
 '**Not interested, skipped**',
 '',
 leadLine,
 companyLine,
 '- **Outcome:** not interested, skipped (screen verdict: '+(screenVerdict||'unknown')+'); no CRM writes, no Slack post'
 ].join('\n');
 return [{json:Object.assign({'Status':'Succeeded','Errors':0,'Description':desc},base)}];
}
let prospectId='';
try{prospectId=$('Create CRM Prospect').first().json.id||'';}catch(e){}
let verdictWritten=false;
try{const v=$('Set CRM Verdict').first().json; if(v&&v.id){verdictWritten=true;}}catch(e){}
let tsWritten=false;
try{const t=$('Set Thread TS').first().json; if(t&&t.id){tsWritten=true;}}catch(e){}
let phoneVal=''; let phoneSource='none';
try{ const rp=$('Resolve Phone').first().json; phoneVal=rp.phone||''; phoneSource=rp.phone_source||'none'; }catch(e){}
const verdict=f.custom_qualification_status||'unknown';
const qualified=verdict!=='out_of_icp';
const campaign=(n.campaign_name?n.campaign_name+(n.alta_campaign_id?' ('+n.alta_campaign_id+')':''):(n.alta_campaign_id||'unknown'));
const failed=[];
if(!prospectId) failed.push('prospect not created');
if(!verdictWritten) failed.push('verdict not written');
if(qualified && !tsWritten) failed.push('thread ts not saved');
let desc=[
'**'+(f.company_name||n.company_name||n.lead_email||'unknown')+' · '+verdict+'**',
'',
leadLine,
'- **Company:** '+(f.company_name||n.company_name||'unknown')+(n.domain?' ('+n.domain+')':''),
'- **Channel:** Alta '+(n.source_channel||n.reply_channel||'reply')+' | Campaign: '+campaign,
'- **Verdict:** '+verdict+(f.verdict_reason?' ('+f.verdict_reason+')':'')+(f.recommended_action?' | Recommended: '+f.recommended_action:''),
'- **Base:** '+(f.base_source||'unknown')+(f.base_match?' (matched on '+f.base_match+')':'')+(f.base_reason?' ('+f.base_reason+')':''),
'- **Phone:** '+(phoneVal||'Not found')+' (source: '+phoneSource+')',
'- **CRM:** Prospects row created'+(prospectId?' ('+prospectId+')':'')+', contact row + qualification brief + conversation thread written',
'- **Pipeline:** '+(verdictWritten?('set from verdict "'+verdict+'" (Positive Reply / Disqualified)'):'not written'),
'- **Slack:** qualification brief posted to client channel '+(cv.slackChannel||'')+(tsWritten?', thread ts written to prospect':'')
].join('\n');
if(failed.length) desc+='\n\n**FAILED ('+failed.length+')**\n'+failed.map(x=>'- '+x).join('\n');
return [{json:Object.assign({'Status':failed.length?'Succeeded with errors':'Succeeded','Errors':failed.length,'Description':desc},base)}];