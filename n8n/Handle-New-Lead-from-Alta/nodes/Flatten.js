const stripCite=(t)=>String(t||'').replace(/[-]/g,'').replace(/cite(turn\d+\w+?\d+)+/gi,'').replace(/turn\d+(?:view|search|news|image|video|product|ref)\d+/gi,'').replace(/cite/gi,'').replace(/ {2,}/g,' ').trim();
const stripEmoji=(t)=>String(t||'').replace(/:[a-z0-9_+-]+:/gi,'').replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2190}-\u{21FF}\u{2300}-\u{23FF}\u{FE0F}\u{200D}]/gu,'').replace(/ {2,}/g,' ').trim();
const q=$input.first().json.output||{};
const n=$('Alta Normalize').first().json;
const gptPhone=stripCite(q.phone||'').replace(/[^\d+]/g,'').trim();
const phone=gptPhone||'';
const brief=stripCite(q.slack_brief_markdown).slice(0,2800);
const vlabel=({strong:'Qualified',medium:'Qualified (medium confidence)',weak:'Qualified (weak fit)',out_of_icp:'Not qualified'})[q.qualification_status]||'Needs review';
const vreason=stripEmoji(stripCite(q.verdict_reason||'')).slice(0,200);
const verdict_line=vlabel+' — '+(vreason||'see brief');
const brief_plain=(verdict_line+'\n\n'+stripEmoji(brief)).slice(0,2800);
return [{ json: {
  lead_email:n.lead_email, first_name:n.first_name, company_name:q.company_name||n.company_name,
  reply_text:n.reply_text, reply_channel:n.reply_channel, source_channel:n.source_channel,
  conversation_thread:n.conversation_thread,
  campaign_name:n.campaign_name, alta_campaign_id:n.alta_campaign_id,
  custom_qualification_brief:brief, brief_plain:brief_plain,
  custom_qualification_status:q.qualification_status||'',
  situation_summary:stripCite(q.situation_summary||'').slice(0,200),
  verdict_reason:vreason,
  custom_phone:phone, custom_timezone:q.timezone||'',
  recommended_action:stripCite(q.recommended_action||'').slice(0,300)
}}];