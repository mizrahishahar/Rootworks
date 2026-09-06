let f=null; try{ f=$('Flatten').first().json; }catch(e){}
if(!f) return [];
const cv=$('Client Vars').first().json||{};
let n={}; try{ n=$('Normalize').first().json||{}; }catch(e){}
let prospectId=''; try{ prospectId=$('Resolve Prospect').first().json.prospect_id||''; }catch(e){}
let ts=''; try{ ts=$('Slack Client Channel').first().json.ts||''; }catch(e){}
let phone=''; try{ phone=$('Resolve Phone').first().json.phone||''; }catch(e){}
let sent_emails_text='', thread_text='';
try{ const ft=$('Format Thread').first().json||{}; sent_emails_text=String(ft.sent_emails_text||'').slice(0,8000); thread_text=String(ft.thread_context||'').slice(0,8000); }catch(e){}
return [{ json: {
  recordId: cv.recordId||'',
  clientSlug: cv.clientSlug||'',
  prospectId: prospectId,
  manual: !!cv.manual,
  lead_email: n.lead_email||'', first_name: n.first_name||'', full_name: n.full_name||'',
  company_name: f.company_name||'', verdict: f.custom_qualification_status||'',
  verdict_reason: f.verdict_reason||'',
  slack_brief_markdown: f.custom_qualification_brief||'',
  situation_summary: f.situation_summary||'',
  recommended_action: f.recommended_action||'',
  phone: phone, timezone: f.custom_timezone||'',
  reply_text: f.reply_text||'', city: n.city||'',
  campaign_id: n.campaign_id||'', campaign_name: n.campaign_name||'', sending_inbox: n.sending_inbox||'', email_account_id: n.email_account_id||'',
  sent_emails_text: sent_emails_text, thread_text: thread_text,
  core_slack_ts: ts
}}];