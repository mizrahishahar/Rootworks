const b=$('Capture Payload').first().json.body||{};
const p=b.person||{}; const c=b.company||{}; const rep=b.reply||{};
const email=String(p.email||'').toLowerCase().trim();
let domain='';
const site=String(c.website||'').toLowerCase().trim();
if(site){ domain=site.replace(/^https?:\/\//,'').replace(/^www\./,'').split('/')[0]; }
if(!domain && email.includes('@')) domain=email.split('@')[1];
const FREEMAIL=new Set(['gmail.com','googlemail.com','yahoo.com','ymail.com','hotmail.com','outlook.com','live.com','msn.com','icloud.com','me.com','mac.com','aol.com','protonmail.com','proton.me','gmx.com','gmx.net','zoho.com','mail.com','yandex.com','comcast.net','verizon.net','att.net','sbcglobal.net','bellsouth.net','cox.net','charter.net','earthlink.net','bell.net','sympatico.ca','rogers.com','shaw.ca','telus.net','videotron.ca','frontier.com','windstream.net','optonline.net','roadrunner.com','rr.com','walla.com','walla.co.il']);
const is_freemail=FREEMAIL.has(domain);
const ch=String(rep.channel||'').toLowerCase();
const source_channel=ch.includes('link')?'LinkedIn':'Email';
const reply_text=String(rep.text||'').slice(0,5000);
const campaign_name=String(b.campaign_name||b.campaignName||'').trim();
const history=String(b.history||rep.history||'').trim();
const first_engagement=new Date().toISOString();
const fmtTs=(ts)=>{const d=new Date(ts);if(isNaN(d.getTime()))return '';return d.toLocaleString('sv-SE',{timeZone:'Asia/Jerusalem'}).slice(0,16)+' IL';};
let conversation_thread='**['+fmtTs(first_engagement)+'] THEM:**\n'+reply_text;
if(history) conversation_thread='**EARLIER (Alta history):**\n'+history+'\n\n'+conversation_thread;
return [{ json: {
  lead_email:email, first_name:p.firstName||'', last_name:p.lastName||'',
  full_name:((p.firstName||'')+' '+(p.lastName||'')).trim(),
  job_title:p.jobTitle||'', seniority:p.seniority||'',
  linkedin_url:p.linkedinUrl||'',
  city:p.city||'', state:p.state||'', country_code:p.country||'',
  company_name:c.name||'', domain, enrich_domain:is_freemail?'':domain, is_freemail,
  company_industry:c.industry||'', company_size:c.size||'', company_hq:c.hq||'',
  company_linkedin:c.linkedinUrl||'', company_description:String(c.description||'').slice(0,600),
  company_revenue:c.revenue||'', company_founded:c.foundedYear||'', company_tech:String(c.technologies||'').slice(0,300),
  reply_text, reply_channel:rep.channel||'', source_channel,
  campaign_name, alta_campaign_id:b.campaignId||'', alta_prospect_id:b.prospectId||'',
  history, conversation_thread, first_engagement,
  is_contact:((p.firstName||'').length>0)
}}];