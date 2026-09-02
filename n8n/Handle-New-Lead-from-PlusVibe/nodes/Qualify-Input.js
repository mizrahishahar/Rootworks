// Builds the passthrough item for Enrich and Qualify Lead (the contract is documented at the top of that
// helper's Build Prompt node): the lead as Normalize shaped it, the thread Format Thread cut, the client name
// that resolves the rubric. The rubric lookup, DiscoLike and the judge live in the helper.
const n = $('Normalize').first().json || {};
const cv = $('Client Vars').first().json || {};
const ft = $('Format Thread').first().json || {};
let fallback = '';
try { fallback = String(((($('Find Client Row').first().json || {}).fields) || {})['Qualification Prompt'] || ''); } catch (e) { fallback = ''; }
const context = [
  'PROSPECT LATEST REPLY:\n' + (ft.reply_text || ''),
  'RECENT EXCHANGE (our last message, then their reply, use this to interpret short replies like "sure"/"yes"):\n' + (ft.last_two || '')
].join('\n\n');
return [{ json: {
  client_name: cv.clientName || '',
  system_prompt_fallback: fallback,
  first_name: n.first_name || '', last_name: n.last_name || '', job_title: n.job_title || '',
  company_name: n.company_name || '', lead_email: n.lead_email || '', linkedin_url: n.linkedin_url || '',
  domain: n.domain || '', enrich_domain: n.enrich_domain || '', is_freemail: !!n.is_freemail,
  city: n.city || '', state: n.state || '', country_code: n.country_code || '',
  context: context
} }];
