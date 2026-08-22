// Not in the CRM: is this a lead we generated? The client's sequencer says.
const c=$('Resolve Client').first().json;
const r=$input.first().json||{};
const body=(r.body!==undefined)?r.body:r;
let lead=null;
if(body&&typeof body==='object'){ if(body._id||body.email) lead=body; else if(Array.isArray(body.leads)&&body.leads.length) lead=body.leads[0]; else if(body.lead&&typeof body.lead==='object') lead=body.lead; }
if(!c.pvWorkspace) return [{ json:{ ours:false, why:'client has no PlusVibe workspace to check', campaign:'', companyName:'', title:'' } }];
if(!lead) return [{ json:{ ours:false, why:'not a lead in the client\'s PlusVibe workspace', campaign:'', companyName:'', title:'', raw:JSON.stringify(body).slice(0,300) } }];
const campaign=String(lead.campaign_name||lead.campaign||'').trim();
return [{ json:{ ours:true, why:'found in PlusVibe'+(campaign?' (campaign '+campaign+')':''), campaign, companyName:String(lead.company_name||'').trim(), title:String(lead.job_title||'').trim(), pvLeadId:String(lead._id||'') } }];
