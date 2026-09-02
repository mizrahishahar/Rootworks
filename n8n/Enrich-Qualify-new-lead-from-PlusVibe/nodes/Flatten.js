// Adapter: the helper's verdict in the shape every node downstream already reads through $('Flatten').
// The judging lives in Enrich and Qualify Lead; this node only renames and carries the thread alongside.
const q = $input.first().json || {};
const n = $('Normalize').first().json || {};
const ft = $('Format Thread').first().json || {};
return [{ json: {
  lead_email: n.lead_email, campaign_id: n.campaign_id, first_name: n.first_name, company_name: q.company_name || n.company_name,
  reply_text: ft.reply_text, thread_context: ft.thread_context,
  custom_qualification_brief: q.brief || '', brief_plain: q.brief_plain || '',
  custom_qualification_status: q.qualification_status || '',
  situation_summary: q.situation_summary || '',
  verdict_reason: q.verdict_reason || '',
  custom_phone: q.phone || '', custom_timezone: q.timezone || '', recommended_action: q.recommended_action || '',
  bizdata: q.bizdata || {},
  base_source: q.base_source || '', base_match: q.base_match || '', base_reason: q.base_reason || ''
} }];
