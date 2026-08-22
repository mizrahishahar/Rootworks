const items = $input.all().map(i => i.json);
const mapItem = items.find(x => x && x.map);
const map = (mapItem && mapItem.map) || {};
const rows = items.filter(x => x !== mapItem);
const form = $('Contacts Launch').first().json;
const runId = String($execution.id);
const tag = ((form['Tag'] || '') + '').trim();

const stripDomain = (url) => { let d = String(url||'').trim().toLowerCase(); if(!d) return ''; d = d.replace(/^https?:\/\//,'').replace(/^www\./,'').split('/')[0].split('?')[0]; return d; };

// Decision-maker-tier seniority values, matching the enum used elsewhere in this stack.
const SEN = { c_suite:'C-Suite', vp:'VP', director:'Director', manager:'Manager', senior:'Senior', owner:'Owner', founder:'Founder', head:'Head', partner:'Partner', 'mid-level':'Unclassified', entry:'Unclassified', intern:'Unclassified' };
const mapSeniority = (v) => SEN[String(v||'').trim().toLowerCase()] || 'Unclassified';

// Company cleaning lives in the Clean Fields helper, the next node; this node only picks the raw source.

// Pipeline/bookkeeping fields to never carry through from the Domains table onto a contact -
// same exclusion list as the Storeleads/Supersoniq pipeline's Format Supersoniq node.
const DOMAIN_SKIP = new Set(['domain','company_domain','Verified','segment','query_name','ingested_at','RankInCompany','Run ID','Build Date','Tag','public_emails_clean','Created','Contact Source','Source']);

let skipped = 0;
let matched = 0;
const out = [];
for (const r of rows) {
  const first = String(r['First Name']||'').trim();
  const last = String(r['Last Name']||'').trim();
  const domain = stripDomain(r['Company Website']);
  const key = (first.toLowerCase()+last.toLowerCase()+domain).trim();
  if (!key) { skipped++; continue; }
  const dm = map[domain] || null;
  if (dm) matched++;
  // No match in the Domains table: fall back to AI-Ark's own company name only, nothing else guessed.
  const rawCompany = dm ? (dm.Company || dm.company_clean || '') : String(r['Company Name for Emails']||r['Company Name']||'').trim();
  // Raw here; the Clean Fields helper (next node) writes the cleaned Company.
  const company = String(rawCompany||'').trim();

  const dmClean = {};
  if (dm) { for (const k of Object.keys(dm)) { if (DOMAIN_SKIP.has(k)) continue; dmClean[k] = dm[k]; } }

  out.push({ json: {
    ...dmClean,
    'Contact Key': key,
    Name: r['Full Name'] || (first+' '+last).trim(), first_name: first, last_name: last,
    Title: String(r['Title']||''), Seniority: mapSeniority(r['Seniority']),
    Email: String(r['Email Business']||'').trim(), Social: String(r['LinkedIn']||'').trim(), Phone: String(r['Mobile Phone']||'').trim(),
    Domain: domain, Company: company,
    'Contact Source': 'AI Ark', Tag: tag, 'Run ID': runId
  }});
}
const sd = $getWorkflowStaticData('global');
sd.aiArkSkipped = skipped;
sd.aiArkMatched = matched;
if (!out.length) { throw new Error('No usable AI-Ark contacts after formatting. Rows skipped for an empty Contact Key: '+skipped+'.'); }
return out;