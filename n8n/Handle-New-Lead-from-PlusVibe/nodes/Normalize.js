const raw=$input.first().json;
const rec=Array.isArray(raw)?raw[0]:(raw.lead_data?raw:(raw[0]||raw));
const d=(rec&&rec.lead_data)?rec.lead_data:(rec||{});
const first=d.first_name||'';
const email=(d.email||'').toLowerCase();
const rawDomain=String(d.domain||email.split('@')[1]||'').toLowerCase();
const FREEMAIL=new Set(['gmail.com','googlemail.com','yahoo.com','yahoo.ca','yahoo.co.uk','ymail.com','rocketmail.com','hotmail.com','hotmail.ca','hotmail.co.uk','outlook.com','outlook.ca','live.com','live.ca','msn.com','icloud.com','me.com','mac.com','aol.com','protonmail.com','proton.me','gmx.com','gmx.net','zoho.com','mail.com','yandex.com','comcast.net','verizon.net','att.net','sbcglobal.net','bellsouth.net','cox.net','charter.net','earthlink.net','bell.net','sympatico.ca','rogers.com','rogers.ca','shaw.ca','telus.net','cogeco.ca','videotron.ca','videotron.qc.ca','nbnet.nb.ca','frontier.com','windstream.net','optonline.net','roadrunner.com','rr.com','walla.com','walla.co.il']);
const is_freemail=FREEMAIL.has(rawDomain);
let webhookCampaign='';
try{ webhookCampaign=$('Live Input').first().json.pv_campaign_name||''; }catch(e){}
return [{ json: {
  lead_email:d.email||'', campaign_id:d.campaign_id||'',
  campaign_name: webhookCampaign||d.campaign_name||'',
  domain:rawDomain, enrich_domain:is_freemail?'':rawDomain, is_freemail:is_freemail,
  first_name:first, last_name:d.last_name||'', full_name:((first)+' '+(d.last_name||'')).trim(),
  job_title:d.job_title||'', company_name:d.company_name||'',
  linkedin_url:d.linkedin_person_url||'',
  city:d.city||'', state:d.state||'', country_code:d.country_code||'',
  existing_brief:d.custom_qualification_brief||'',
  sending_inbox:d.email_account_name||'', email_account_id:d.email_account_id||'',
  is_contact:(first.length>0)
}}];