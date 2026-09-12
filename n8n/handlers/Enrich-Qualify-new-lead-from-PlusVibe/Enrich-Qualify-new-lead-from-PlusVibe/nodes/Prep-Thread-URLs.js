const ws=$('Client Vars').first().json.pvWorkspace||'';
const le=String($('Normalize').first().json.lead_email||'').toLowerCase();
const u1='https://api.plusvibe.ai/api/v1/unibox/emails?workspace_id='+ws+'&lead='+le+'&email_type=all';
const u2='https://api.plusvibe.ai/api/v1/unibox/campaign-emails?workspace_id='+ws+'&lead='+le;
return [{ json: { pvUrl:u1 } }, { json: { pvUrl:u2 } }];