// Build Rows: the view's rows into the payload the caller sends, one shaping for both doors.
// The order of the gates is the doctrine and does not vary by sender:
//   identity, then DNC, then the stamp-gate, then every required variable, then the run cap.
// The view owns dedupe (Operator ruling 2026-09-02): a live view filters on Sequencers not
// containing this door's sender, and this machine never gates on that. The one dedupe here is
// the Campaigns stamp, which catches a row the view somehow offered again before anything is sent.
// DNC is read from the client base's DNC table at deploy time, on both doors.
// Max Rows is applied LAST, so the cap counts only rows that would really have been sent; the
// surplus is a named skip, never a silent drop, and the view offers it again on the next run.
const sd = $getWorkflowStaticData('global'); const dk = 'deploy_' + $execution.id; const D = sd[dk];
// isPV is the EMAIL lane: PlusVibe and Email Bison run the same gates (Final Email identity, DNC,
// stamp-gate, first name, company, required variables, run cap) and queue 200-lead chunks; only
// the lead object and the send flags differ, branched on isBison below.
const isPV = D.sender === 'PlusVibe' || D.sender === 'Email Bison';
const isBison = D.sender === 'Email Bison';
if (D.abort) { return [{ json: { ready: false, abort: true } }]; }
const rowsArr = D.viewRows || [];
D.rowsTotal = rowsArr.length;
if (!rowsArr.length) {
  D.abort = isPV ? 'view empty or not found' : 'view empty';
  D.errors.push(isPV ? ('view empty or not found: "' + (D.view || '') + '"; nothing was sent') : ('view "' + D.view + '" returned no rows; nothing was sent'));
  D.viewRows = null;
  return [{ json: { ready: false, abort: true } }];
}
const dnc = {};
if (D.dncTableId) {
  try {
    for (const it of $('Read DNC').all()) {
      const j = it.json || {};
      const recs = Array.isArray(j.records) ? j.records : [];
      for (const r of recs) { const d = String((r.fields || {})['Domain'] || '').toLowerCase().trim(); if (d) dnc[d] = 1; }
    }
  } catch (e) {}
}
// The one reader for every field. A register-shaped People table carries the company facts
// (Domain, Company, Country, State, City, Employees, Industry Groups, MX Provider, Tag, Signals)
// as lookups through the Companies link, so Airtable returns arrays (["California"]); legacy
// tables carry plain text. An array yields its first element, an object its value or name, never
// "[object Object]" and never a joined list (ruling 2026-09-02).
const val = v => { if (v === null || v === undefined) return ''; if (Array.isArray(v)) return v.length ? val(v[0]) : ''; if (typeof v === 'string') return v.trim(); if (typeof v === 'number' || typeof v === 'boolean') return String(v); if (typeof v === 'object') { if (typeof v.value === 'string') return v.value.trim(); if (typeof v.name === 'string') return v.name.trim(); } return ''; };
// A usable first name starts with a letter and has at least two letters, in any language.
const NAME_OK = (s) => { const v = String(s || '').trim(); if (!v) return false; if (v.indexOf('�') >= 0) return false; if (!/^\p{L}/u.test(v)) return false; return (v.match(/\p{L}/gu) || []).length >= 2; };
const normUrl = u => String(u || '').toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/+$/, '').split('?')[0];
const linkIds = v => (Array.isArray(v) ? v : []).map(c => (c && typeof c === 'object') ? String(c.id || '') : String(c || '')).filter(Boolean);
const emailRe = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const plan = D.plan || { varCols: [], rideCols: [] };
const requiredCore = D.requiredCore || [];
const needFirstName = D.needFirstName !== false;
// customFields accepts ONLY defined Alta prospect-field keys and 400s the whole prospect on an
// unknown one (proven 2026-09-01: one bad key rejected all 260). Keys that are really Alta system
// fields ship top-level under Alta's name; every other var key must exist as a defined prospect
// field, created once per account as part of campaign setup.
const ALTA_SYSKEY = { title: 'jobTitle', seniority: 'seniority', city: 'city', state: 'state', country: 'country', description: 'description' };
const ALTA_DEFINED = ['job_needs', 'mechanical_work', 'workload', 'real_company_name', 'open_infrastructure_positions'];
D.rows = {}; D.emailToRow = {}; D.urlToRow = {}; D.varMisses = {};
const leads = []; const pushes = [];
for (const r of rowsArr) {
  const f = r.fields || {};
  const rec = { skip: null, camps: linkIds(f['Campaigns']) };
  D.rows[r.id] = rec;
  let dom = '';
  if (isPV) {
    const email = String(f['Final Email'] || '').trim();
    rec.email = email.toLowerCase();
    if (!email) { rec.skip = 'missing Final Email'; continue; }
    if (!emailRe.test(email)) { rec.skip = 'invalid email syntax'; continue; }
    dom = (val(f['Domain']) || email.split('@')[1] || '').toLowerCase().trim();
  } else {
    const li = val(f['LinkedIn URL']);
    if (!/^https?:\/\//i.test(li)) { rec.skip = 'missing LinkedIn URL'; continue; }
    rec.url = normUrl(li);
    rec.linkedin = li;
    dom = String(val(f['Domain']) || '').toLowerCase().trim();
  }
  if (dom && dnc[dom]) { rec.skip = 'DNC: ' + dom; continue; }
  // The stamp-gate: already linked to this campaign's mirror row = already enrolled here once.
  if (D.stampMirrorRid && rec.camps.indexOf(D.stampMirrorRid) >= 0) { rec.skip = 'already in campaign (Campaigns stamp)'; continue; }
  const fnRaw = val(f['first_name']);
  const fnHe = val(f['first_name_he']);
  if (isPV && needFirstName) {
    // On a company-inbox list the first name is absent by design; the view decides by showing
    // the column or not. When it is shown, an unusable name is a skip, not a nameless send.
    if (!fnRaw && !fnHe) { rec.skip = 'missing first name'; continue; }
    if (!NAME_OK(fnRaw) && !NAME_OK(fnHe)) { rec.skip = 'unusable first name: ' + String(fnRaw || fnHe).slice(0, 40); continue; }
  }
  if (!isPV && D.urlToRow[rec.url]) { rec.skip = 'duplicate LinkedIn URL in view (row ' + D.urlToRow[rec.url] + ' already queued)'; continue; }
  const comp = val(f['company_clean']) || val(f['Company']);
  if (!comp) { rec.skip = 'missing company name'; continue; }
  // Visible standard lead fields must be filled too (PlusVibe only; Alta never blocks on them).
  let coreMiss = '';
  for (const c of requiredCore) { if (!val(f[c])) { coreMiss = c; break; } }
  if (coreMiss) { D.varMisses[coreMiss] = (D.varMisses[coreMiss] || 0) + 1; rec.skip = 'missing ' + coreMiss; continue; }
  const cv = {}; const missVars = [];
  for (const col of plan.varCols) { const v = val(f[col.name]); if (v) cv[col.key] = v.slice(0, isPV ? 2000 : 4000); else missVars.push(col.name); }
  if (missVars.length) { for (const m of missVars) { D.varMisses[m] = (D.varMisses[m] || 0) + 1; } rec.skip = 'missing ' + missVars.join(', ').slice(0, 120); continue; }
  // Convention (never-block) columns ride along when visible and filled, never skip a row.
  for (const col of (plan.rideCols || [])) { const v = val(f[col.name]); if (v && cv[col.key] === undefined) cv[col.key] = v.slice(0, isPV ? 2000 : 4000); }
  if (isPV) {
    if (D.maxRows && leads.length >= D.maxRows) { rec.skip = 'over the run cap of ' + D.maxRows + ' rows'; continue; }
    const lead = { email: String(f['Final Email'] || '').trim() };
    if (isBison) {
      // Email Bison's lead: first_name is REQUIRED by the API (a company-inbox list cannot deploy
      // here without one), title/company are its own field names, and custom variables are an
      // array of {name, value} rendered as {NAME} in the sequence. State/City/Country have no
      // lead field on Bison; when the view shows them they already ride as variables.
      const fn = NAME_OK(fnRaw) ? fnRaw : (NAME_OK(fnHe) ? fnHe : '');
      if (!fn) { rec.skip = 'missing first name (Email Bison requires one)'; continue; }
      lead.first_name = fn;
      const ln = val(f['last_name']); if (ln) lead.last_name = ln;
      const ttl = val(f['Title']); if (ttl) lead.title = ttl;
      lead.company = comp;
      const cvArr = Object.keys(cv).map(k => ({ name: k, value: cv[k] }));
      if (cvArr.length) lead.custom_variables = cvArr;
    } else {
      // State carries the full state name (Clean Fields writes it there); State Full is never read.
      const core = { first_name: NAME_OK(fnRaw) ? fnRaw : '', last_name: val(f['last_name']), company_name: comp, state: val(f['State']), city: val(f['City']), country: val(f['Country']), job_title: val(f['Title']) };
      const soc = D.linkedinCol ? val(f[D.linkedinCol]) : '';
      if (/^https?:\/\//i.test(soc)) core.linkedin_person_url = soc;
      for (const k of Object.keys(core)) { if (core[k]) lead[k] = core[k]; }
      if (Object.keys(cv).length) lead.custom_variables = cv;
    }
    D.emailToRow[rec.email] = r.id;
    leads.push(lead);
  } else {
    if (D.maxRows && pushes.length >= D.maxRows) { rec.skip = 'over the run cap of ' + D.maxRows + ' rows'; continue; }
    // Vars ride twice: extraInfoData is Alta's display blob; customFields populate the DEFINED
    // prospect fields, the only place sequence templates render from (proven 2026-09-01: values
    // visible on the card but blank in the copy until the defined field carries them).
    const body = { company: comp, linkedinUrl: rec.linkedin, extraInfoData: cv };
    const custom = {};
    for (const k of Object.keys(cv)) {
      if (ALTA_SYSKEY[k]) { body[ALTA_SYSKEY[k]] = cv[k]; continue; }
      if (ALTA_DEFINED.indexOf(k) >= 0) custom[k] = cv[k];
    }
    if (Object.keys(custom).length) body.customFields = custom;
    const fn = fnRaw || fnHe;
    if (fn) body.firstName = fn;
    const ln = val(f['last_name']); if (ln) body.lastName = ln;
    const web = val(f['Domain']); if (web) body.companyWebsite = /^https?:\/\//i.test(web) ? web : 'https://' + web;
    const email = val(f['Final Email']); if (email) body.email = email;
    D.urlToRow[rec.url] = r.id;
    pushes.push({ recordId: r.id, enroll_body: body, campaign_url: D.pullInUrl });
  }
}
D.viewRows = null;
const skipCounts = {};
for (const id of Object.keys(D.rows)) { const s = D.rows[id].skip; if (s) { const key = s.indexOf('DNC:') === 0 ? 'DNC' : s; skipCounts[key] = (skipCounts[key] || 0) + 1; } }
D.skipCounts = skipCounts;
if (isPV) {
  const chunks = [];
  for (let i = 0; i < leads.length; i += 200) chunks.push(leads.slice(i, i + 200));
  D.send = { queue: chunks, idx: 0, attempts: 0 };
  if (isBison) {
    // Bison has no dedupe modes: "patch" keeps an existing lead's other variables, and attach-leads
    // refuses a lead already In Sequence elsewhere unless allow_parallel_sending is set (it is not).
    D.flags = { existing_lead_behavior: 'patch' };
  } else {
    const flagMap = { 'Standard': { skip_lead_in_active_pause_camp: true }, 'Strict': { skip_if_in_workspace: true }, 'Active-only': { skip_lead_for_active_only_camp: true }, 'None': {} };
    D.flags = Object.assign({ is_overwrite: true }, flagMap[D.dedupe] || flagMap['Strict']);
  }
  D.ready = chunks.length > 0;
} else {
  D.pushes = pushes;
  D.ready = pushes.length > 0;
}
return [{ json: { ready: D.ready, abort: false } }];
