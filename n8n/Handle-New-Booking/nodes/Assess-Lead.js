// Tier 2: not in the CRM. Is this a lead we sequenced? The client's PlusVibe workspace says.
const c=$('Resolve Client').first().json;
const r=$input.first().json||{};
const body=(r.body!==undefined)?r.body:r;
let lead=null;
if(body&&typeof body==='object'){ if(body._id||body.email) lead=body; else if(Array.isArray(body.leads)&&body.leads.length) lead=body.leads[0]; else if(body.lead&&typeof body.lead==='object') lead=body.lead; }
if(!c.pvWorkspace) return [{ json:{ ours:false, tier:'', why:'client has no PlusVibe workspace to check', campaign:'', companyName:'', title:'' } }];
if(!lead) return [{ json:{ ours:false, tier:'', why:'not a lead in the client\'s PlusVibe workspace', campaign:'', companyName:'', title:'' } }];
const campaign=String(lead.campaign_name||lead.campaign||'').trim();
return [{ json:{ ours:true, tier:'Sequenced', why:'in the client\'s PlusVibe workspace'+(campaign?', campaign '+campaign:''), campaign, companyName:String(lead.company_name||'').trim(), title:String(lead.job_title||'').trim(), pvLeadId:String(lead._id||'') } }];
