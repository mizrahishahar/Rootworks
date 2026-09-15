const pr=$('Loop Prospects').first().json||{};
const prf=pr.fields||pr;
const ct=$input.first().json||{};
const cf=ct.fields||ct;
const sd=$getWorkflowStaticData('global');
const clientIds=Array.isArray(prf.Client)?prf.Client:[];
const cm=(sd.clientMap||{})[clientIds[0]]||{};
const lead_email=String(cf.email||'').toLowerCase().trim();
const base={ prospectId:pr.id||'', prospectName:prf.Name||'', lead_email, pvWorkspace:cm.pvWorkspace||'' };
if(!lead_email||!cm.pvWorkspace){ return [{ json: Object.assign({pvUrl:''},base) }]; }
const u1='https://api.plusvibe.ai/api/v1/unibox/emails?workspace_id='+cm.pvWorkspace+'&lead='+lead_email+'&email_type=all';
const u2='https://api.plusvibe.ai/api/v1/unibox/campaign-emails?workspace_id='+cm.pvWorkspace+'&lead='+lead_email;
return [{ json: Object.assign({pvUrl:u1},base) }, { json: Object.assign({pvUrl:u2},base) }];