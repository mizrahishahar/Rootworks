// Builds the passthrough item for Enrich and Qualify Lead (the contract is documented at the top of that
// helper's Build Prompt node): the lead as Alta Normalize shaped it, the company data Alta sent, the reply,
// the client name that resolves the rubric. The rubric lookup, DiscoLike and the judge live in the helper.
const n = $('Alta Normalize').first().json || {};
const cv = $('Client Vars').first().json || {};
let fallback = '', clayrootsBase = '', peopleTable = '', companiesTable = '';
try { const cf = ((($('Get Client Row').first().json || {}).fields) || {}); fallback = String(cf['Qualification Prompt'] || ''); clayrootsBase = String(cf['Clayroots Base ID'] || '').trim(); peopleTable = String(cf['ClayrootsPeopleTableID'] || '').trim(); companiesTable = String(cf['ClayrootsCompaniesTableID'] || '').trim(); } catch (e) { fallback = ''; clayrootsBase = ''; peopleTable = ''; companiesTable = ''; }
const companyContext = [
  'COMPANY DATA (from Alta enrichment; fields may be missing, verify with web search):',
  'industry: ' + (n.company_industry || '') + ' | size: ' + (n.company_size || '') + ' | revenue: ' + (n.company_revenue || '') + ' | founded: ' + (n.company_founded || '') + ' | HQ: ' + (n.company_hq || ''),
  'Description: ' + (n.company_description || ''),
  'Technologies: ' + (n.company_tech || '')
].join('\n');
const context = [
  'PROSPECT LATEST REPLY:\n' + (n.reply_text || ''),
  'RECENT EXCHANGE (only their reply is available for this channel):\nTHEM: ' + (n.reply_text || '')
].join('\n\n');
return [{ json: {
  client_name: cv.clientName || '',
  clayroots_base: clayrootsBase,
  clayroots_people_table: peopleTable,
  clayroots_companies_table: companiesTable,
  system_prompt_fallback: fallback,
  first_name: n.first_name || '', last_name: n.last_name || '', job_title: n.job_title || '',
  company_name: n.company_name || '', lead_email: n.lead_email || '', linkedin_url: n.linkedin_url || '',
  domain: n.domain || '', enrich_domain: n.enrich_domain || '', is_freemail: !!n.is_freemail,
  city: n.city || '', state: n.state || '', country_code: n.country_code || '',
  source_line: 'Alta (' + (n.reply_channel || 'reply') + ' reply)',
  company_context: companyContext,
  context: context
} }];
