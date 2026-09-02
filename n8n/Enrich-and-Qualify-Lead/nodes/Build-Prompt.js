// Enrich and Qualify Lead, step 1: the one copy of the qualification prompt.
// Passthrough helper on the Clean Fields model: one item in, one item out, no run-log row of its own;
// the caller's row carries the outcome. Callers: Handle New Lead from PlusVibe, Handle New Lead from Alta,
// Handle New Booking. The helper reads the rubric, enriches, judges and hands the verdict back. It writes
// nothing: the caller stamps its own CRM row with the field names it always used.
//
// INPUT CONTRACT, the passthrough item (field: who supplies it):
//   client_name             required. The Clients row's Client name; resolves the KB qualification-prompt row.
//                           PlusVibe/Alta: Client Vars.clientName. Booking: Resolve Client.clientName.
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
// brief_plain, brief_md, situation_summary, recommended_action, timezone, phone, company_name (the qualifier's
// canonical name when it returns one, else the input), bizdata (DiscoLike JSON, {} when none), kb_found.

const lead = $('Lead In').first().json || {};
const s = (v) => String(v == null ? '' : v).trim();

// The rubric: the client's KB qualification-prompt row, else the caller's fallback, else a generic line.
let kb = '';
try { const r = $('Find Qual Prompt').first().json || {}; const f = r.fields || r; kb = String(f['Content'] || '').replace(/\\([_*[\]`#|>~-])/g, '$1').trim(); } catch (e) { kb = ''; }
const kbFound = !!kb;
const systemPrompt = kb || s(lead.system_prompt_fallback) || ('You qualify inbound leads for ' + (s(lead.client_name) || 'the client') + ', a B2B company. Decide whether the lead is a fit and return the structured JSON asked for.');

// Firmographics: DiscoLike bizdata for the enrich domain; {} when there was no domain to ask about or nothing came back.
let biz = {};
if (s(lead.enrich_domain)) { try { const b = $input.first().json; if (b && typeof b === 'object' && !Array.isArray(b)) biz = b; } catch (e) { biz = {}; } }

const name = (s(lead.first_name) + ' ' + s(lead.last_name)).trim();
const contact = s(lead.lead_email) || s(lead.linkedin_url);
const emailType = lead.is_freemail
  ? 'PERSONAL/FREEMAIL, the domain is the email provider, NOT the company; web-search the real company + phone'
  : (s(lead.lead_email) ? 'business domain' : 'no email, LinkedIn lead');
const location = [s(lead.city), s(lead.state), s(lead.country_code)].filter(Boolean).join(', ');
const situationAsk = s(lead.situation_ask) || 'what the prospect signaled and what they want next, interpreting the latest reply in context of our last message. Resolve vague replies like "sure"/"yes"/"ok" into the actual thing they agreed to or asked for (e.g. "Said yes to a quick walkthrough video" or "Asked us to send more on how it works before a call")';

const head = ['LEAD: ' + [name, s(lead.job_title) || 'title unknown', s(lead.company_name) || s(lead.domain) || 'company unknown', contact].join(' | ')];
if (s(lead.source_line)) head.push('SOURCE: ' + s(lead.source_line));
head.push('EMAIL TYPE: ' + emailType);
if (location) head.push('LOCATION: ' + location);
head.push('DOMAIN: ' + s(lead.domain));
if (s(lead.linkedin_url)) head.push('LINKEDIN: ' + s(lead.linkedin_url));

const parts = [head.join('\n')];
if (s(lead.company_context)) parts.push(s(lead.company_context));
parts.push('COMPANY FIRMOGRAPHICS (DiscoLike, empty/ignore for freemail):\n' + JSON.stringify(biz));
if (s(lead.context)) parts.push(s(lead.context));
parts.push('Run the qualification. Output structured JSON. "situation_summary": ONE plain-English line (max 140 chars) stating ' + situationAsk + '. "verdict_reason": ONE plain-English line (max 120 chars) stating why this lead is or is not a fit, citing the deciding factor. Never paste the raw reply or notes verbatim; no names, signatures, or URLs.');

return [{ json: { systemPrompt, kbFound, promptText: parts.join('\n\n'), bizdata: biz }, pairedItem: { item: 0 } }];
