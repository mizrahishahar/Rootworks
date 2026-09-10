let f=null; try{ f=$('Flatten').first().json; }catch(e){}
if(!f) return [];
const cv=$('Client Vars').first().json||{};
let n={}; try{ n=$('Alta Normalize').first().json||{}; }catch(e){}
let prospectId=''; try{ prospectId=$('Create CRM Prospect').first().json.id||''; }catch(e){}
let ts=''; try{ ts=$('Slack Client Channel').first().json.ts||''; }catch(e){}
let phone=''; try{ phone=$('Resolve Phone').first().json.phone||''; }catch(e){}
return [{ json: {
  recordId: cv.clientRecId||'',
  clientSlug: cv.clientSlug||'',
  prospectId: prospectId,
  lead_email: n.lead_email||'', first_name: n.first_name||'', full_name: n.full_name||'',
  company_name: f.company_name||'', verdict: f.custom_qualification_status||'',
  verdict_reason: f.verdict_reason||'',
  slack_brief_markdown: f.custom_qualification_brief||'',
  situation_summary: f.situation_summary||'',
  recommended_action: f.recommended_action||'',
  phone: phone, timezone: f.custom_timezone||'',
  reply_text: f.reply_text||'', city: n.city||'',
  source_channel: n.source_channel||'', reply_channel: n.reply_channel||'',
  campaign_id: n.alta_campaign_id||'', campaign_name: n.campaign_name||'',
  linkedin_url: n.linkedin_url||'',
  core_slack_ts: ts
}}];