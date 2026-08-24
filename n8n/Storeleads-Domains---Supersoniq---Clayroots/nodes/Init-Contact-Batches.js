// Slice the CSV's domains into batches for SQ Contacts Batch and open the loop.
// Built 2026-08-24 after run 4678 OOM-crashed the instance at 16.5k contacts: the
// single-pass chain held every contact seven times over on a 1GB heap. The batch
// loop is the same architecture that fixed the Domains side (SL Batch Pull): the
// parent holds domain lists and counters, never contact payloads.
const pd = $('Parse Domains').first().json;
const domains = pd._domains || [];
const cmap = pd._cmap || {};
if (!domains.length) { throw new Error('No domains to enrich after parsing the CSV.'); }
const form = $('Contacts Launch').first().json;

// Country codes (moved verbatim from the retired parent-level Build SQ Requests).
const asArr = (v) => { if (v === undefined || v === null || v === '') return []; if (Array.isArray(v)) return v.map(x => String(x).trim()).filter(Boolean); return String(v).split(',').map(s => s.trim()).filter(Boolean); };
const CC = { 'United States': 'US', 'Israel': 'IL', 'United Kingdom': 'GB', 'Canada': 'CA', 'Australia': 'AU', 'Germany': 'DE', 'France': 'FR', 'Netherlands': 'NL' };
const countries = asArr(form['Contact location']).map(c => CC[c] || '').filter(Boolean);

// Extras carry-through map (moved verbatim from the retired Format Supersoniq): anything
// the source CSV carries that is not part of the fixed field contract and not plumbing
// rides along, so a new source column needs no edit here.
const CORE = new Set(['Name', 'Contact Key', 'first_name', 'last_name', 'Title', 'Seniority', 'Department', 'Email', 'Social', 'Phone', 'Connections', 'Domain', 'Company', 'company_clean', 'Industry Groups', 'Employees', 'Business Model', 'MX Provider', 'Score', 'Similarity', 'Description', 'Keywords', 'City', 'State', 'State Full', 'Country', 'Zip', 'Street', 'Source', 'Plan', 'Revenue Est Monthly', 'Store Age Years', 'Product Count', 'App Spend Mo', 'Key Apps', 'Tech Stack', 'Trustpilot Rating', 'Trustpilot Reviews', 'Migrated From', 'Social Followers', 'Growth 90d', 'Features', 'Seniority Rank']);
const XSKIP = new Set(['domain', 'company_domain', 'Verified', 'segment', 'query_name', 'ingested_at', 'RankInCompany', 'Run ID', 'Build Date', 'Tag', 'public_emails_clean', 'Created']);
const xmap = {};
for (const r of $('Read CSV').all().map(i => i.json)) {
  const d = String(r.Domain || r.domain || r.company_domain || '').trim().toLowerCase();
  if (!d) continue;
  const x = xmap[d] || (xmap[d] = {});
  for (const k of Object.keys(r)) { if (CORE.has(k) || XSKIP.has(k)) continue; const v = r[k]; if ((x[k] === undefined || x[k] === '') && v !== undefined && v !== null && String(v).trim() !== '') x[k] = String(v).trim(); }
}

const tag = ((form['Tag'] || '') + '').trim();
const _st = ($('Config').first().json || {}).startedAt;
let buildDate = '';
try { buildDate = DateTime.fromISO(String(_st)).toFormat('yyyy-MM-dd'); } catch (e) { buildDate = ''; }
if (!buildDate || buildDate === 'Invalid DateTime') { buildDate = $now.toFormat('yyyy-MM-dd'); }

// 250 domains per batch: worst case 250 x 12 per-company limit = 3,000 contacts in one
// sub-execution, comfortable on the 1GB heap even with Clean Fields' copies.
const BATCH = 250;
const batches = [];
for (let i = 0; i < domains.length; i += BATCH) {
  const ds = domains.slice(i, i + BATCH);
  const cs = {}, xs = {};
  for (const d of ds) { if (cmap[d]) cs[d] = cmap[d]; if (xmap[d]) xs[d] = xmap[d]; }
  batches.push({ domains: ds, cmap: cs, xmap: xs });
}

const sd = $getWorkflowStaticData('global');
sd.cbState = { bIndex: 0, bNum: 0, retried: false, totals: { delivered: 0, written: 0, skipped: 0, credits: 0, companiesMatched: 0, failedChunks: 0 }, withContacts: {} };
return [{ json: { action: 'continue', bIndex: 0, batchCount: batches.length, countries, tag, buildDate, batches } }];
