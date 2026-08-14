const stripCite=(t)=>String(t||'').replace(/[-]/g,'').replace(/cite(turn\d+\w+?\d+)+/gi,'').replace(/turn\d+(?:view|search|news|image|video|product|ref)\d+/gi,'').replace(/cite/gi,'').replace(/ {2,}/g,' ').trim();
const q=$input.first().json.output||{};
const n=$('Alta Normalize').first().json;
const gptPhone=stripCite(q.phone||'').replace(/[^\d+]/g,'').trim();
const phone=(n.native_phone||'').trim()||gptPhone||'';
const brief=stripCite(q.slack_brief_markdown).slice(0,2800);
return [{ json: {
  lead_email:n.lead_email, first_name:n.first_name,
  company_name:q.company_name||n.company_name,
  reply_text:n.reply_text, reply_channel:n.reply_channel,
  custom_qualification_brief:brief,
  custom_qualification_status:q.qualification_status||'',
  custom_phone:phone, custom_timezone:q.timezone||'',
  recommended_action:stripCite(q.recommended_action||'').slice(0,300)
}}];