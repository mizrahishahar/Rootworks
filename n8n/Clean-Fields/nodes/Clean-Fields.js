// Clean Fields helper: the one copy of the cleaning rules every ClayRoots inserter applies.
// Input items carry raw row fields; output items are the same rows with the cleaned
// fields written in place. A helper owns no run-log row; its outcome is the caller's.
//
// Fields touched (each only when the source is present on the row, nothing invented):
//   Company, company_clean   <- cleanCompany(Company || company_clean || Name-for-domains)
//   State Full               <- stateFull(State)
//   first_name, last_name    <- cleanFirst/cleanLast(Name) when the row has no first_name
//   public_emails_clean      <- keepPublic(parseEmails(Public Emails)) when 'Public Emails' is on the row
//
// Rows are never dropped; a row the rules cannot clean comes back unchanged.

const titleCase = (s) => String(s).replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase());
const cleanFirst = (f) => { if (!f) return ''; let n = String(f).split(',')[0].trim().split(/\s+/)[0] || ''; n = n.replace(/[^A-Za-z\-']/g, ''); return n ? n.charAt(0).toUpperCase() + n.slice(1).toLowerCase() : ''; };
const cleanLast = (f) => { if (!f) return ''; const p = String(f).split(',')[0].trim().split(/\s+/); if (p.length < 2) return ''; return titleCase(p.slice(1).join(' ').replace(/[^A-Za-z\-'\s]/g, '').trim()); };

// cleanCompany: strips taglines, "Welcome to", pipe/dash segments, domain suffixes, ®™,
// legal-form suffixes (never when joined by "&": "Dose & Co" IS the name), normalises
// casing of all-caps / all-lower names. Returns the original when the rules cannot decide.
const cleanCompany = (nm) => {
  if (!nm) return '';
  const orig = String(nm).trim();
  let c = orig.replace(/\s{2,}/g, ' ');
  const GEN = new Set(['home', 'welcome', 'shop', 'store', 'about', 'about us', 'products', 'index', 'page', 'contact', 'contact us', 'blog', 'news']);
  const isGen = (s) => GEN.has(String(s).trim().toLowerCase());
  const TAGLINE_RE = /\b(free|shipping|sale|% ?off|buy now|shop now|official|welcome to|best|discover|explore|save up|subscribe|new arrivals|worldwide|delivery|since \d{4})\b/i;
  const looksLikeTagline = (s) => { const t = String(s || '').trim(); if (!t) return true; if (isGen(t)) return true; if (TAGLINE_RE.test(t)) return true; return t.split(/\s+/).filter(Boolean).length >= 6; };
  const pickPair = (head, tail) => {
    const h = String(head || '').trim(), t = String(tail || '').trim();
    const hTag = looksLikeTagline(h), tTag = looksLikeTagline(t);
    if (hTag && tTag) return null;
    if (hTag) return t || null; if (tTag) return h || null;
    if (!h) return t || null; if (!t) return h || null;
    const hw = h.split(/\s+/).length, tw = t.split(/\s+/).length;
    if (Math.abs(hw - tw) <= 1) return h;
    return hw < tw ? h : t;
  };
  c = c.replace(/^welcome to\s+/i, '').trim();
  const pp = c.split(' | ');
  if (pp.length > 1) {
    const cands = pp.map((s) => s.trim()).filter(Boolean);
    const clean = cands.filter((s) => !looksLikeTagline(s));
    if (clean.length === 1) { c = clean[0]; }
    else if (clean.length > 1) { clean.sort((a, b) => a.split(/\s+/).length - b.split(/\s+/).length); c = clean[0]; }
    else { return orig; }
  }
  for (let i = 0; i < 2; i++) { const d = c.search(/\s[-–—:]\s/); if (d < 3) break; const head = c.slice(0, d).trim(); const tail = c.slice(d).replace(/^\s[-–—:]\s/, '').trim(); const s = pickPair(head, tail); if (s === null) return orig; c = s; }
  if (/^[A-Za-z0-9][A-Za-z0-9-]*(\.[A-Za-z]{2,})+$/.test(c)) c = c.replace(/(\.[A-Za-z]{2,})+$/, '');
  c = c.replace(/[®™]/g, '');
  for (let i = 0; i < 2; i++) { const m = c.match(/[,\s]+(inc|llc|l\.l\.c\.|ltd|limited|corp|corporation|co|company|gmbh|plc|llp|lp|pllc|pc)\.?$/i); if (!m) break; const before = c.slice(0, m.index).trim(); const lastWord = before.split(/\s+/).pop() || ''; if (lastWord === '&') break; c = before; }
  c = c.replace(/,+$/, '').trim();
  const hasUp = /\p{Lu}/u.test(c), hasLow = /\p{Ll}/u.test(c);
  if (hasUp !== hasLow) {
    const parts = c.split(/(\s+)/); const words = parts.filter((t) => /\S/.test(t)); const MINOR = new Set(['of', 'and', 'the', 'for', 'to', 'in', 'on', 'at', 'by', 'a', 'an']);
    if (!(hasUp && words.length === 1 && c.length <= 4)) { let wi = -1; c = parts.map((t) => { if (!/\S/.test(t)) return t; wi++; const lw = t.toLowerCase(); return (wi > 0 && MINOR.has(lw)) ? lw : lw.replace(/\p{L}/u, (ch) => ch.toUpperCase()); }).join(''); }
  }
  return c;
};

const ST = { AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California', CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming', DC: 'District of Columbia', PR: 'Puerto Rico', ON: 'Ontario', QC: 'Quebec', BC: 'British Columbia', AB: 'Alberta', MB: 'Manitoba', SK: 'Saskatchewan', NS: 'Nova Scotia', NB: 'New Brunswick' };
const FULL = new Set(Object.values(ST).map((v) => v.toLowerCase()));
const stateFull = (raw) => { if (raw == null) return ''; const s = String(raw).trim(); if (!s) return ''; const u = s.toUpperCase().replace(/\./g, ''); if (ST[u]) return ST[u]; if (FULL.has(s.toLowerCase())) return titleCase(s); return s; };

const BLACK = new Set(['hr', 'careers', 'career', 'jobs', 'job', 'legal', 'privacy', 'noreply', 'no-reply', 'donotreply', 'abuse', 'postmaster', 'compliance', 'recruiting', 'recruitment', 'press', 'media', 'unsubscribe', 'webmaster', 'admin', 'info-security']);
const parseEmails = (cell) => { if (!cell) return []; const s = String(cell).trim().replace(/^\[|\]$/g, ''); return s.split(/[,;]+/).map((e) => e.replace(/['"\s]/g, '').trim()).filter((e) => e.includes('@')); };
const keepPublic = (arr) => arr.filter((e) => { const lp = e.split('@')[0].toLowerCase().split('+')[0]; return !BLACK.has(lp); });

const has = (r, k) => Object.prototype.hasOwnProperty.call(r, k);
const out = [];
for (const item of $input.all()) {
  const r = Object.assign({}, item.json || {});
  // Company: clean whichever source the row carries; write both columns when either is present.
  // Domains rows (DiscoLike shape) carry the company in Name with no Company column: Name is the source and the target.
  const isDomainsRow = !has(r, 'Company') && !has(r, 'Contact Key') && has(r, 'Name') && has(r, 'company_clean');
  const rawCompany = String((has(r, 'Company') && r.Company) || (has(r, 'company_clean') && r.company_clean) || (isDomainsRow && r.Name) || '').trim();
  if (has(r, 'Company') || has(r, 'company_clean')) {
    const cn = cleanCompany(rawCompany);
    if (has(r, 'Company')) r.Company = cn || r.Company;
    if (has(r, 'company_clean')) r.company_clean = cn || r.company_clean;
    if (isDomainsRow) r.Name = cn || r.Name;
  }
  // Only rows that carry a State Full column get it filled; a domains row has no such column and an extra key 422s the upsert.
  if (has(r, 'State') && has(r, 'State Full')) r['State Full'] = stateFull(r.State);
  // Person rows only (they carry a Contact Key); a domains row's Name is a company, never split.
  if (has(r, 'Contact Key') && has(r, 'Name') && !(r.first_name || r.last_name)) { r.first_name = cleanFirst(r.Name); r.last_name = cleanLast(r.Name); }
  if (has(r, 'Public Emails') && has(r, 'public_emails_clean')) r.public_emails_clean = keepPublic(parseEmails(r['Public Emails'])).join(', ');
  out.push({ json: r, pairedItem: { item: out.length } });
}
return out;
