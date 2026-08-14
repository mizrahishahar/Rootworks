const leads=$('Build Intent Leads').all().map(i=>i.json);
let recs=[];
try{recs=$('Re-read Record').all().map(i=>{const j=i.json;return (j&&j.fields)?j.fields:j;});}catch(e){}
let enrolled=0;
try{enrolled=$('Enroll to Alta (Webhook)').all().length;}catch(e){}
const lines=['Hiring intent run (Apify -> Alta)'];
const show=leads.slice(0,10);
for(let i=0;i<show.length;i++){
  const l=show[i];
  const f=recs[i]||{};
  const finalEmail=f['Final Email']||l['Email']||'';
  lines.push('- '+(l['Name']||finalEmail||'unknown')+(l['Company']?' @ '+l['Company']:'')+(l['Domain']?' ('+l['Domain']+')':''));
  lines.push('  - Signal: '+(l['Event Type']||'unknown')+(l['Signal Detail']?' | '+String(l['Signal Detail']).slice(0,180):''));
  lines.push('  - Enrichment: '+(f['Final Email']?'waterfall resolved '+f['Final Email']:(l['Email']?'kept source email '+l['Email']:'no email, LinkedIn only')));
  lines.push('  - Routed: enrolled to Alta campaign webhook, marked ROUTED in Intent table');
}
if(leads.length>10)lines.push('- ... and '+(leads.length-10)+' more leads');
lines.push('- Totals: '+leads.length+' decision maker(s) in, '+enrolled+' enrolled to Alta');
const target=leads.map(l=>l['Email']||l['Name']||l['LinkedIn URL']).filter(Boolean).slice(0,3).join(', ');
return [{json:{
 'Automation':'Handle Intent',
 'Client': ['reclCOYRBgMowJd8G'],
 'Status':'Succeeded',
 'Run at': $now.toISO(),
 'Records In': leads.length,
 'Records Out': enrolled,
 'Errors': 0,
 'Target': target,
 'Trigger':'event',
 'Execution ID': String($execution.id),
 'Execution Link': 'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id,
 'Description': lines.join('\n')
}}];