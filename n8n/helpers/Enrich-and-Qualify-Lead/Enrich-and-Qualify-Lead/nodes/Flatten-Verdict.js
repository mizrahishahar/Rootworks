// Enrich and Qualify Lead, step 2: the verdict, cleaned once, in one shape, merged onto the passthrough item.
// The label maps are the one copy of what every caller used to carry: qualification_label is the CRM
// QualificationStatus value, verdict_label the human line the briefs open with. brief_md is the
// Qualification Brief markdown (bold first line, bullets) the callers used to format themselves.
// The brief's last line names the source (ruling 2026-09-02): "From the client's People table" when the
// replier was resolved in the base, "Not in the base, enriched live" when DiscoLike ran.
const stripCite = (t) => String(t || '').replace(/[-]/g, '').replace(/cite(turn\d+\w+?\d+)+/gi, '').replace(/turn\d+(?:view|search|news|image|video|product|ref)\d+/gi, '').replace(/cite/gi, '').replace(/ {2,}/g, ' ').trim();
const stripEmoji = (t) => String(t || '').replace(/:[a-z0-9_+-]+:/gi, '').replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2190}-\u{21FF}\u{2300}-\u{23FF}\u{FE0F}\u{200D}]/gu, '').replace(/ {2,}/g, ' ').trim();
const s = (v) => String(v == null ? '' : v).trim();

const lead = $('Lead In').first().json || {};
const built = $('Build Prompt').first().json || {};
const q = ($input.first().json || {}).output || {};
const person = built.basePerson || {};
const company = built.baseCompany || {};
const sourceLine = built.baseSource || 'Not in the base, enriched live';

const status = String(q.qualification_status || '');
const qualificationLabel = ({ strong: 'Qualified', medium: 'Needs Review', weak: 'Needs Review', out_of_icp: 'Disqualified' })[status] || 'Needs Review';
const verdictLabel = ({ strong: 'Qualified', medium: 'Qualified (medium confidence)', weak: 'Qualified (weak fit)', out_of_icp: 'Not qualified' })[status] || 'Needs review';
const verdictReason = stripEmoji(stripCite(q.verdict_reason || '')).slice(0, 200);
const verdictLine = verdictLabel + ': ' + (verdictReason || 'see brief');
const briefBody = stripCite(q.slack_brief_markdown || '').slice(0, 2700);
const brief = (briefBody ? briefBody + '\n' : '') + sourceLine;
const briefPlain = (verdictLine + '\n\n' + stripEmoji(brief)).slice(0, 2800);
const briefLines = briefPlain.split('\n').map((x) => x.trim()).filter(Boolean);
const briefMd = briefLines.length ? ['**' + briefLines[0] + '**', ''].concat(briefLines.slice(1).map((l) => '- ' + l)).join('\n') : '';
const qualifierPhone = stripCite(q.phone || '').replace(/[^\d+]/g, '').trim();
const phone = s(person.phone) || qualifierPhone;

return [{ json: Object.assign({}, lead, {
  qualification_status: status,
  qualification_label: qualificationLabel,
  verdict_label: verdictLabel,
  verdict_line: verdictLine,
  verdict_reason: verdictReason,
  brief: brief,
  brief_plain: briefPlain,
  brief_md: briefMd,
  situation_summary: stripCite(q.situation_summary || '').slice(0, 200),
  recommended_action: stripCite(q.recommended_action || '').slice(0, 300),
  timezone: String(q.timezone || ''),
  phone: phone,
  company_name: String(q.company_name || lead.company_name || company.company || person.company || ''),
  job_title: s(lead.job_title) || s(person.title),
  linkedin_url: s(lead.linkedin_url) || s(person.linkedin_url),
  bizdata: built.bizdata || {},
  kb_found: !!built.kbFound,
  base_found: !!built.baseFound,
  base_match: built.baseMatch || '',
  base_source: sourceLine,
  base_reason: built.baseReason || '',
  base_person: person,
  base_company: company,
  base_people_record_id: built.basePeopleRecordId || '',
  base_company_record_id: built.baseCompanyRecordId || ''
}), pairedItem: { item: 0 } }];
