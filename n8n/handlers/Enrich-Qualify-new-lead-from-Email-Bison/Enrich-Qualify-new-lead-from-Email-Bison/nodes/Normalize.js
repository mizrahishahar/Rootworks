// Normalize: the lead as the rest of this machine reads it, one shape for both doors. The live
// door already carries the lead in Bison's webhook payload (Live Input); the manual door only has
// an email. Both pass through Bison Find Lead (GET /api/leads?search=<email>) and the exact email
// match is taken here, so the fields come from the instance either way. Custom variables on Bison
// are an array of {name, value}; they are folded into a map for the few this machine reads.
const raw=$input.first().json||{};
let live=null; try{ const li=$('Live Input').first().json; if(li&&li.lead_email&&!li.manual) live=li; }catch(e){}
let man=null; try{ man=$('Manual Input').first().json; }catch(e){}
const wantEmail=String((live&&live.lead_email)||(man&&man.lead_email)||'').toLowerCase().trim();
const arr=Array.isArray(raw.data)?raw.data:(Array.isArray(raw)?raw:[]);
const hit=arr.find(l=>String(l.email||'').toLowerCase().trim()===wantEmail)||null;
// No exact hit on the instance (a lead deleted since, or a test payload): the webhook's own lead
// fields carry the run, so nothing is lost; the run log names it.
const d=hit||(live?{ id:live.lead_id||'', email:wantEmail, first_name:live.first_name||'', last_name:live.last_name||'', title:live.title||'', company:live.company||'', custom_variables:[], lead_campaign_data:[] }:{});
const first=String(d.first_name||'').trim();
const last=String(d.last_name||'').trim();
const email=String(d.email||wantEmail||'').toLowerCase();
const rawDomain=String(email.split('@')[1]||'').toLowerCase();
const FREEMAIL=new Set(['gmail.com','googlemail.com','yahoo.com','yahoo.ca','yahoo.co.uk','ymail.com','rocketmail.com','hotmail.com','hotmail.ca','hotmail.co.uk','outlook.com','outlook.ca','live.com','live.ca','msn.com','icloud.com','me.com','mac.com','aol.com','protonmail.com','proton.me','gmx.com','gmx.net','zoho.com','mail.com','yandex.com','comcast.net','verizon.net','att.net','sbcglobal.net','bellsouth.net','cox.net','charter.net','earthlink.net','bell.net','sympatico.ca','rogers.com','rogers.ca','shaw.ca','telus.net','cogeco.ca','videotron.ca','videotron.qc.ca','nbnet.nb.ca','frontier.com','windstream.net','optonline.net','roadrunner.com','rr.com','walla.com','walla.co.il']);
const is_freemail=FREEMAIL.has(rawDomain);
const cv={}; for(const x of (Array.isArray(d.custom_variables)?d.custom_variables:[])){ if(x&&x.name) cv[String(x.name).toLowerCase()]=x.value==null?'':String(x.value); }
// The campaign: the webhook names it; the manual door takes the lead's campaign that drew a reply,
// else its newest.
let campaign_id=String((live&&live.campaign_id)||(man&&man.campaign_id)||'').trim();
let campaign_name=String((live&&live.campaign_name)||'').trim();
if(!campaign_id){
  const lcd=Array.isArray(d.lead_campaign_data)?d.lead_campaign_data:[];
  const withReply=lcd.filter(c=>c&&Number(c.replies||0)>0);
  const pick=(withReply.length?withReply:lcd).slice(-1)[0];
  if(pick) campaign_id=String(pick.campaign_id||'');
}
return [{ json: {
  lead_email:email, lead_id:String(d.id||(live&&live.lead_id)||''), reply_id:String((live&&live.reply_id)||''),
  campaign_id, campaign_name,
  domain:rawDomain, enrich_domain:is_freemail?'':rawDomain, is_freemail:is_freemail,
  first_name:first, last_name:last, full_name:(first+' '+last).trim(),
  job_title:String(d.title||'').trim(), company_name:String(d.company||'').trim(),
  linkedin_url:cv['linkedin']||cv['linkedin_url']||'',
  city:'', state:cv['state']||'', country_code:'',
  existing_brief:'',
  sending_inbox:'', email_account_id:'',
  automated_reply: !!(live&&live.automated_reply),
  found_on_bison: !!hit,
  is_contact:(first.length>0)
}}];
