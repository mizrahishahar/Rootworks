const sd2=$getWorkflowStaticData('global'); const rs=sd2.runStartedAt||0;
const n=$('Alta Normalize').first().json;
const cv=$('Client Vars').first().json;
const name=(n.full_name||'').trim();
const base={
 'Automation':'Enrich & Qualify new lead from Alta',
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
// Every reply lands a row (2026-09-17). The screen decides the status, never the insert.
let screenVerdict='';
try{ const s=$('Screen Reply').first().json; screenVerdict=(s&&s.output&&s.output.verdict)||''; }catch(e){}
const interested=screenVerdict!=='PASS'&&screenVerdict!=='AUTO';
let f=null; try{ f=$('Flatten').first().json; }catch(e){}
if(!f){
 // Reached from Lead in CRM? yes: the company already has a row, the reply is appended to its thread.
 let threadRow=null; try{ threadRow=$('Update Prospect Thread').first().json||null; }catch(e){}
 let exId=(threadRow&&threadRow.id)||'';
 if(!exId){ try{ exId=$('Find CRM Prospect').first().json.id||''; }catch(e){} }
 const failed=[];
 if(!threadRow||!threadRow.id) failed.push('thread not appended');
 let desc=[
 '**Existing prospect, thread appended**',
 '',
 leadLine,
 companyLine,
 '- **Screen:** '+(screenVerdict||'unknown'),
 '- **Outcome:** existing prospect'+(exId?' ('+exId+')':'')+', conversation thread appended; status untouched, no re-qualification, no Slack post; handed to the routine door'
 ].join('\n');
 if(failed.length) desc+='\n\n**FAILED ('+failed.length+')**\n'+failed.map(x=>'- '+x).join('\n');
 return [{json:Object.assign({'Status':failed.length?'Succeeded with errors':'Succeeded','Errors':failed.length,'Description':desc},base)}];
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
const status=!interested?'Engaged':(qualified?'Positive Reply':'Disqualified');
const carded=interested&&qualified;
const campaign=(n.campaign_name?n.campaign_name+(n.alta_campaign_id?' ('+n.alta_campaign_id+')':''):(n.alta_campaign_id||'unknown'));
const failed=[];
if(!prospectId) failed.push('prospect not created');
if(!verdictWritten) failed.push('verdict not written');
if(carded && !tsWritten) failed.push('thread ts not saved');
let desc=[
'**'+(f.company_name||n.company_name||n.lead_email||'unknown')+' · '+status+' · '+verdict+'**',
'',
leadLine,
'- **Company:** '+(f.company_name||n.company_name||'unknown')+(n.domain?' ('+n.domain+')':''),
'- **Channel:** Alta '+(n.source_channel||n.reply_channel||'reply')+' | Campaign: '+campaign,
'- **Screen:** '+(screenVerdict||'unknown (fail-open, read as interested)'),
'- **Verdict:** '+verdict+(f.verdict_reason?' ('+f.verdict_reason+')':'')+(f.recommended_action?' | Recommended: '+f.recommended_action:''),
'- **Base:** '+(f.base_source||'unknown')+(f.base_match?' (matched on '+f.base_match+')':'')+(f.base_reason?' ('+f.base_reason+')':''),
'- **Phone:** '+(phoneVal||'Not found')+' (source: '+phoneSource+')'+(interested?'':', paid tiers skipped: not a positive reply'),
'- **CRM:** Prospects row created'+(prospectId?' ('+prospectId+')':'')+', contact row + qualification brief + conversation thread written',
'- **Pipeline:** '+(verdictWritten?('OutreachStatus '+status+' (screen '+(screenVerdict||'unknown')+', verdict "'+verdict+'")'):'not written'),
'- **Slack:** '+(carded?('qualification brief posted to client channel '+(cv.slackChannel||'')+(tsWritten?', thread ts written to prospect':'')):'no card ('+status+'); the card posts only for a positive reply that is not out_of_icp'),
'- **Routine:** handed to the routine door (fires when the client row carries its URL)'
].join('\n');
if(failed.length) desc+='\n\n**FAILED ('+failed.length+')**\n'+failed.map(x=>'- '+x).join('\n');
return [{json:Object.assign({'Status':failed.length?'Succeeded with errors':'Succeeded','Errors':failed.length,'Description':desc},base)}];
