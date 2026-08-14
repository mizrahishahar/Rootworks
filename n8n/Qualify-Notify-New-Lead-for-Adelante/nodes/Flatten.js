const stripCite=(t)=>String(t||'').replace(/[\ue000-\uf8ff]/g,'').replace(/cite(turn\d+\w+?\d+)+/gi,'').replace(/turn\d+(?:view|search|news|image|video|product|ref)\d+/gi,'').replace(/cite/gi,'').replace(/ {2,}/g,' ').trim();
const q=$input.first().json.output;
const n=$('Normalize').first().json;
const contactPhone=($('Extract Contact').first().json.contact_phone)||'';
const biz=$('DiscoLike BizData').first().json||{};
const companyPhone=(!n.is_freemail&&Array.isArray(biz.phones)&&biz.phones[0])?biz.phones[0]:'';
const gptPhone=stripCite(q.phone||'').replace(/[^\d+]/g,'').trim();
const phone=(n.native_phone||'').trim()||contactPhone||companyPhone||gptPhone||'';
const brief=stripCite(q.slack_brief_markdown).slice(0,2800);
return [{ json: {
  lead_email:n.lead_email, campaign_id:n.campaign_id, first_name:n.first_name, company_name:q.company_name||n.company_name,
  reply_text:$('Format Thread').first().json.reply_text, thread_context:$('Format Thread').first().json.thread_context,
  custom_qualification_brief:brief, custom_qualification_status:q.qualification_status,
  custom_phone:phone, custom_timezone:q.timezone||'', recommended_action:stripCite(q.recommended_action).slice(0,300)
}}];