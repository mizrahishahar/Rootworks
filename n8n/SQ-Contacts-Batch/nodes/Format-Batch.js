// Supersoniq responses for one batch -> row payloads + counters, in ONE item.
// Adapted from the retired parent-level Format Supersoniq: cmap/xmap/tag/runId/buildDate
// now arrive through Batch Input, and instead of emitting 16k row items into the parent
// this returns a single { rows: [...], ...counters } item that dies with this sub-execution.
// Never throws on a failed or empty Supersoniq response: sqAllFailed rides in the summary
// and the parent's loop control decides retry vs loud fail, mirroring SL Batch Pull.
const inp = $('Batch Input').first().json;
const cmap = inp.cmapSlice || {};
const xmap = inp.xmapSlice || {};
const runId = String(inp.runId || '');
const tag = ((inp.tag || '') + '').trim();
const buildDate = String(inp.buildDate || '') || $now.toFormat('yyyy-MM-dd');

const cap = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '';
const cleanFirst = (full) => { if (!full) return ''; const tok = String(full).split(',')[0].trim().split(/\s+/)[0] || ''; return cap(tok.replace(/[^A-Za-z'\-]/g, '')); };
const cleanLast = (full) => { if (!full) return ''; const parts = String(full).split(',')[0].trim().split(/\s+/); if (parts.length < 2) return ''; return parts.slice(1).map(p => cap(p.replace(/[^A-Za-z'\-]/g, ''))).filter(Boolean).join(' '); };
const band = (n) => { n = Number(n); if (!Number.isFinite(n) || n <= 0) return ''; if (n <= 10) return '1-10'; if (n <= 50) return '11-50'; if (n <= 200) return '51-200'; if (n <= 500) return '201-500'; if (n <= 1000) return '501-1000'; if (n <= 5000) return '1001-5000'; if (n <= 10000) return '5001-10000'; return '10001+'; };
const numOr = (v) => { if (v === null || v === undefined || String(v).trim() === '') return ''; const n = Number(v); return Number.isFinite(n) ? n : ''; };

const rows = [];
let skipped = 0, companiesMatched = 0, credits = 0, failedChunks = 0, okChunks = 0;
let firstError = '';
const withContacts = new Set();
for (const it of $('SQ Enrich').all()) {
  const resp = it.json || {};
  if (!Array.isArray(resp.results)) {
    failedChunks++;
    if (!firstError) firstError = JSON.stringify(resp).slice(0, 300);
    continue;
  }
  okChunks++;
  const results = resp.results;
  companiesMatched += results.length;
  const cr = resp.credits_used != null ? resp.credits_used : (resp.credits != null ? resp.credits : ((resp.usage && resp.usage.credits_used) || 0));
  credits += Number(cr) || 0;
  for (const r of results) {
    const contacts = Array.isArray(r.contacts) ? r.contacts : [];
    for (const ct of contacts) {
      const domain = String(ct.company_domain || '').trim().toLowerCase();
      const co = cmap[domain] || {};
      const extras = xmap[domain] || {};
      const full = ((String(ct.first_name || '') + ' ' + String(ct.last_name || '')).trim()) || String(ct.full_name || '');
      const first = cleanFirst(full); const last = cleanLast(full);
      const key = (first.toLowerCase() + last.toLowerCase() + domain).trim();
      if (!key) { skipped++; continue; }
      if (domain) withContacts.add(domain);
      // Raw here; the Clean Fields helper (downstream) writes the cleaned Company / company_clean / State Full.
      const coName = String(co.Company || ct.company_name || '').trim();
      rows.push({
        ...extras,
        'Contact Key': key,
        Name: full, first_name: first, last_name: last,
        Title: String(ct.job_title || ''), Seniority: String(ct.seniority || ''), Department: String(ct.function || ''),
        Email: String(ct.email || ''), Social: String(ct.linkedin_url || ''),
        Phone: '', Connections: '',
        Domain: domain, Company: coName, company_clean: coName,
        'Industry Groups': co['Industry Groups'] || '', Employees: band(co.Employees),
        'Business Model': co['Business Model'] || '', 'MX Provider': co['MX Provider'] || '',
        Score: '', Similarity: '', Description: co.Description || '', Keywords: '',
        City: co.City || '', State: co.State || '', 'State Full': '', Country: co.Country || '',
        Zip: '', Street: '', Source: 'Supersoniq', 'Run ID': runId, 'Build Date': buildDate, Tag: tag,
        Plan: co.Plan || '',
        'Revenue Est Monthly': numOr(co['Revenue Est Monthly']),
        'Store Age Years': numOr(co['Store Age Years']),
        'Product Count': numOr(co['Product Count']),
        'App Spend Mo': numOr(co['App Spend Mo']),
        'Key Apps': co['Key Apps'] || '', 'Tech Stack': co['Tech Stack'] || '',
        'Trustpilot Rating': numOr(co['Trustpilot Rating']),
        'Trustpilot Reviews': numOr(co['Trustpilot Reviews']),
        'Migrated From': co['Migrated From'] || '', 'Social Followers': co['Social Followers'] || '',
        'Growth 90d': numOr(co['Growth 90d']), Features: co.Features || ''
      });
    }
  }
}

return [{ json: {
  delivered: rows.length,
  skipped,
  companiesMatched,
  credits,
  failedChunks,
  sqAllFailed: okChunks === 0,
  firstError,
  withContacts: [...withContacts],
  rows
} }];
