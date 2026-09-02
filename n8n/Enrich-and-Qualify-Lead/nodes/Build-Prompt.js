// Enrich and Qualify Lead, step 1: the one copy of the qualification prompt.
// Passthrough helper on the Clean Fields model: one item in, one item out, no run-log row of its own;
// the caller's row carries the outcome. Callers: Handle New Lead from PlusVibe, Handle New Lead from Alta,
// Handle New Booking. The helper reads the rubric, reads what the client's base already holds about the
// replier (ruling 2026-09-02: the intake reads before it pays), enriches live only when the base has no row,
// judges and hands the verdict back. It writes nothing: the caller stamps its own CRM row with the field
// names it always used.
//
// INPUT CONTRACT, the passthrough item (field: who supplies it):
//   client_name             required. The Clients row's Client name; resolves the KB qualification-prompt row.
//                           PlusVibe/Alta: Client Vars.clientName. Booking: Resolve Client.clientName.
//   clayroots_base          the Clients row's Clayroots Base ID ('' when the client has none). With a lead_email or a
//                           linkedin_url it opens the base read: People by Final Email, then Email, then Contact Key,
//                           then LinkedIn URL; the row's Companies link for the company facts. PlusVibe: Client Vars.clayrootsBase.
//                           Alta: Get Client Row 'Clayroots Base ID'. Booking: Resolve Client.clayrootsBase.
//   system_prompt_fallback  optional. Rubric used when the KB has no row for the client. PlusVibe/Alta pass the
//                           legacy Clients field 'Qualification Prompt'. Empty too: a generic one-line rubric.
//   first_name, last_name, job_title, company_name, lead_email, linkedin_url
//                           the lead as the caller normalized it (Normalize / Alta Normalize / Normalize Booking + Attribution).
//   domain                  the company domain the caller resolved ('' when unknown).
//   enrich_domain           the domain DiscoLike is asked about; '' for freemail, then bizdata stays {}.
//   is_freemail             boolean; drives the EMAIL TYPE line.
//   city, state, country_code
//                           optional; LOCATION is written only when one is present (the booking door has none).
//   source_line             optional; written as 'SOURCE: ...'. Alta: 'Alta (linkedin reply)'.
//   company_context         optional; a caller-formatted block with its own header, inserted verbatim.
//                           Alta: the enrichment fields Alta sent with the reply.
//   context                 required; the caller-formatted event block, inserted verbatim: what happened and the
//                           thread, history or booking notes the judge must read.
//                           PlusVibe: latest reply + recent exchange. Alta: latest reply. Booking: the booking,
//                           the attribution line, prior history on the prospect row, the booking notes.
//   situation_ask           optional; what situation_summary must state. Default: the reply wording below.
//                           Booking: 'what the booking signals and what they want from the call'.
// Everything else on the item rides through untouched.
//
// OUTPUT, added to the same item by Flatten Verdict: qualification_status (strong|medium|weak|out_of_icp|''),
// qualification_label (the CRM QualificationStatus value), verdict_label, verdict_line, verdict_reason, brief,
// brief_plain, brief_md (the brief ends with the source line: "From the client's People table" or "Not in the
// base, enriched live"), situation_summary, recommended_action, timezone, phone (the base's Phone when held,
// else the qualifier's), company_name (the qualifier's canonical name when it returns one, else the input, else
// the base's Company), job_title and linkedin_url (the input's, filled from the base when empty), bizdata (the
// DiscoLike shape: from the base when the row was found, else DiscoLike JSON, {} when none), kb_found,
// base_found, base_match (Final Email | Email | Contact Key), base_source, base_reason, base_person, base_company,
// base_people_record_id, base_company_record_id.

const lead = $('Lead In').first().json || {};
const s = (v) => String(v == null ? '' : v).trim();

// The rubric: the client's KB qualification-prompt row, else the caller's fallback, else a generic line.
let kb = '';
try { const r = $('Find Qual Prompt').first().json || {}; const f = r.fields || r; kb = String(f['Content'] || '').replace(/\\([_*[\]`#|>~-])/g, '$1').trim(); } catch (e) { kb = ''; }
const kbFound = !!kb;
const systemPrompt = kb || s(lead.system_prompt_fallback) || ('You qualify inbound leads for ' + (s(lead.client_name) || 'the client') + ', a B2B company. Decide whether the lead is a fit and return the structured JSON asked for.');

// What the base holds: Base Facts ran only when the People row was found (every other leg went to DiscoLike).
let base = null;
try { const b = $('Base Facts').first().json; if (b && b.base_found) base = b; } catch (e) { base = null; }
let baseReason = '';
if (!base) {
  if (!s(lead.clayroots_base)) baseReason = 'client has no Clayroots base on its registry row';
  else if (!s(lead.lead_email) && !s(lead.linkedin_url)) baseReason = 'no reply email or LinkedIn URL to resolve against the base';
  else {
    try { const t = $('Resolve Base Tables').first().json || {}; if (!t.ready) baseReason = t.reason || 'base tables not resolved'; } catch (e) { baseReason = 'base tables not read'; }
    if (!baseReason) { try { baseReason = ($('Pick Person').first().json || {}).reason || 'no People row matched'; } catch (e) { baseReason = 'no People row matched'; } }
  }
}
const person = base ? (base.person || {}) : {};
const company = base ? (base.company || {}) : {};

// Firmographics: the base's Companies row when the replier was found; else DiscoLike bizdata for the enrich
// domain; {} when there was no domain to ask about or nothing came back.
let biz = {};
if (base) biz = base.bizdata || {};
else if (s(lead.enrich_domain)) { try { const b = $('DiscoLike BizData').first().json; if (b && typeof b === 'object' && !Array.isArray(b)) biz = b; } catch (e) { biz = {}; } }

const jobTitle = s(lead.job_title) || s(person.title);
const linkedin = s(lead.linkedin_url) || s(person.linkedin_url);
const companyName = s(lead.company_name) || s(company.company) || s(person.company);
const name = (s(lead.first_name) + ' ' + s(lead.last_name)).trim() || s(person.name);
const contact = s(lead.lead_email) || linkedin;
const emailType = lead.is_freemail
  ? 'PERSONAL/FREEMAIL, the domain is the email provider, NOT the company; web-search the real company + phone'
  : (s(lead.lead_email) ? 'business domain' : 'no email, LinkedIn lead');
const location = [s(lead.city), s(lead.state), s(lead.country_code)].filter(Boolean).join(', ') || (base ? [s(company.city), s(company.state), s(company.country)].filter(Boolean).join(', ') : '');
const situationAsk = s(lead.situation_ask) || 'what the prospect signaled and what they want next, interpreting the latest reply in context of our last message. Resolve vague replies like "sure"/"yes"/"ok" into the actual thing they agreed to or asked for (e.g. "Said yes to a quick walkthrough video" or "Asked us to send more on how it works before a call")';

const head = ['LEAD: ' + [name, jobTitle || 'title unknown', companyName || s(lead.domain) || 'company unknown', contact].join(' | ')];
if (s(lead.source_line)) head.push('SOURCE: ' + s(lead.source_line));
head.push('EMAIL TYPE: ' + emailType);
if (location) head.push('LOCATION: ' + location);
head.push('DOMAIN: ' + (s(lead.domain) || s(company.domain)));
if (linkedin) head.push('LINKEDIN: ' + linkedin);

const parts = [head.join('\n')];
if (base) {
  const sigCount = Array.isArray(company.signals) ? company.signals.length : 0;
  const campCount = Array.isArray(person.campaigns) ? person.campaigns.length : 0;
  parts.push('PERSON (from the client\'s People table, matched on ' + (base.base_match || 'the base') + '; this is our own list data, trust it over guesses):\n' + [
    'title: ' + (s(person.title) || 'unknown'), 'seniority: ' + (s(person.seniority) || 'unknown'), 'department: ' + (s(person.department) || 'unknown'),
    'linkedin: ' + (s(person.linkedin_url) || 'none'), 'phone: ' + (s(person.phone) || 'none'),
    'email status: ' + (s(person.status) || 'unknown'), 'list tag: ' + (s(person.tag) || s(company.tag) || 'none'),
    'signals: ' + (sigCount ? sigCount + ' intent signal(s)' + (s(company.signal_at) ? ', latest ' + s(company.signal_at) : '') : 'none'),
    'campaigns: ' + (campCount ? campCount + ' campaign(s) on our side' : 'none recorded')
  ].join(' | '));
}
if (s(lead.company_context)) parts.push(s(lead.company_context));
parts.push((base ? 'COMPANY FIRMOGRAPHICS (from the client\'s Companies table):\n' : 'COMPANY FIRMOGRAPHICS (DiscoLike, empty/ignore for freemail):\n') + JSON.stringify(biz));
if (s(lead.context)) parts.push(s(lead.context));
parts.push('Run the qualification. Output structured JSON. "situation_summary": ONE plain-English line (max 140 chars) stating ' + situationAsk + '. "verdict_reason": ONE plain-English line (max 120 chars) stating why this lead is or is not a fit, citing the deciding factor. Never paste the raw reply or notes verbatim; no names, signatures, or URLs.');

return [{ json: {
  systemPrompt, kbFound, promptText: parts.join('\n\n'), bizdata: biz,
  baseFound: !!base, baseMatch: base ? (base.base_match || '') : '',
  baseSource: base ? "From the client's People table" : 'Not in the base, enriched live',
  baseReason, basePerson: person, baseCompany: company,
  basePeopleRecordId: base ? (base.base_people_record_id || '') : '', baseCompanyRecordId: base ? (base.base_company_record_id || '') : ''
}, pairedItem: { item: 0 } }];
