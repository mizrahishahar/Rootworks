// Adapter: the helper's verdict in the shape every node downstream already reads through $('Flatten').
// The judging lives in Enrich and Qualify Lead; this node only renames and carries the reply alongside.
const q = $input.first().json || {};
const n = $('Alta Normalize').first().json || {};
return [{ json: {
  lead_email: n.lead_email, first_name: n.first_name, company_name: q.company_name || n.company_name,
  reply_text: n.reply_text, reply_channel: n.reply_channel, source_channel: n.source_channel,
  conversation_thread: n.conversation_thread,
  campaign_name: n.campaign_name, alta_campaign_id: n.alta_campaign_id,
  custom_qualification_brief: q.brief || '', brief_plain: q.brief_plain || '',
  custom_qualification_status: q.qualification_status || '',
  situation_summary: q.situation_summary || '',
  verdict_reason: q.verdict_reason || '',
  custom_phone: q.phone || '', custom_timezone: q.timezone || '',
  recommended_action: q.recommended_action || '',
  bizdata: q.bizdata || {},
  base_source: q.base_source || '', base_match: q.base_match || '', base_reason: q.base_reason || ''
} }];
