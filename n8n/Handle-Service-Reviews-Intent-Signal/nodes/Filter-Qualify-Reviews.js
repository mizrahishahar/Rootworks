// Filter & Qualify Reviews: N scraped Trustpilot rows in, ONE row per qualified company out,
// every drop counted by reason. The signal payload (negative-review count, freshest date, the
// quotes, the reply share, the trust score) rides on the company row so the writer can stamp
// it on the Companies row. _stats on the first row feeds Build Run Log.
//
// THE FRESH PIECE of this handler; everything downstream is the hiring handler reused.
//
// Source shape: blackfalcondata/trustpilot-reviews-scraper, reviews mode. Stars (1-2) and
// topics (customer_service) are filtered SERVER-SIDE in the Apify task config; the rating<=2
// check here is a belt, counted when it fires. includeCompanyInfo adds company-metadata rows
// (totalReviews, countryCode, contactEmail) to the same dataset; both row kinds are read,
// neither is required. Proven live 2026-08-27 on 10 big + 10 small DTC brands.
//
// Drops, in order: not negative (belt) · no domain · hosted platform · wrong country.
// The "already in table" line is gone (Operator ruling 2026-09-02): a company that signals
// again is updated in place and re-enters the queue. Notes against the hiring hard lines:
//   - Country: the COMPANY's country, against the Signals row's comma list ("US, GB"), read
//     only from a company-metadata row (countryCode). reviewerCountry is the REVIEWER's
//     country and never gates: who wrote the review is irrelevant (Operator 2026-09-01).
//     Unknown company country passes on purpose, mirroring the hiring rule; the watchlist
//     and the ICP sentence carry the geography where Trustpilot stays silent.
//   - Max Employees / headcount: Trustpilot carries no headcount. No gate here; BizData lands
//     Employees on the row and the Signals row's ICP sentence carries the size qualification.
//   - Staffing words / body-shop test: job-post pathologies, no review analog. Not rewritten.
//   - Duplicate: grouping by domain IS the dedupe; the counter stays for repeated
//     company-metadata rows.
const cfg=$('Parse Play').first().json;
let items=$('Get Scraped Reviews').all().map(i=>i.json);
if(items.length===1&&Array.isArray(items[0])) items=items[0];
items=items.filter(r=>r&&typeof r==='object');

// A company whose "website" lives on a free-hosting subdomain is not a company (hiring
// handler's fence, reused verbatim).
const HOSTED=['vercel.app','github.io','netlify.app','webflow.io','wixsite.com','carrd.co','notion.site','framer.website','framer.app','glitch.me','herokuapp.com','pages.dev','web.app','firebaseapp.com','squarespace.com','weebly.com','wordpress.com','godaddysites.com','mystrikingly.com','super.site'];
const isHosted=(d)=>HOSTED.some(h=>d===h||d.endsWith('.'+h));
const norm=(d)=>String(d||'').toLowerCase().replace('https://','').replace('http://','').replace('www.','').split('?')[0].split('#')[0].split('/')[0].trim();

// Split the dataset: review rows carry a rating; company-metadata rows carry totalReviews
// (or type 'company') and no rating.
const isCompanyRow=(r)=>(r.type==='company'||r.type==='companyInfo'||(r.rating===undefined&&(r.totalReviews!==undefined||r.trustScore!==undefined)));
const companyMeta={};
const reviews=[];
let metaRows=0;
for(const r of items){
  if(isCompanyRow(r)){ metaRows++; const d=norm(r.companyDomain||r.domain||r.website); if(d&&!companyMeta[d]) companyMeta[d]=r; continue; }
  if(r.rating!==undefined) reviews.push(r);
}

const drops={not_negative:0,no_domain:0,hosted_platform:0,country:0,duplicate:0};
const byDomain={};
for(const r of reviews){
  if(Number(r.rating)>2){ drops.not_negative++; continue; }
  const d=norm(r.companyDomain);
  if(!d){ drops.no_domain++; continue; }
  if(isHosted(d)){ drops.hosted_platform++; continue; }
  if(!byDomain[d]) byDomain[d]={ domain:d, name:String(r.companyName||'').trim(), reviews:[] };
  byDomain[d].reviews.push(r);
}

// Reviewers paste their own phone numbers and street addresses into rants; those quotes become
// table columns and copy variables, so PII is stripped before anything is written.
const stripPII=(s)=>String(s||'')
  .replace(/\+?\d[\d\s().-]{7,}\d/g,'[...]')
  .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g,'[...]')
  .replace(/\b\d{1,5}\s+[A-Za-z][A-Za-z' ]*\s(?:street|st|avenue|ave|road|rd|lane|ln|drive|dr|boulevard|blvd|court|ct|way|place|pl)\b\.?/gi,'[...]');

const countries=(Array.isArray(cfg.countries)&&cfg.countries.length)?cfg.countries:String(cfg.country||'').split(',').map(x=>x.trim().toUpperCase()).filter(Boolean);
const out=[];
for(const d of Object.keys(byDomain)){
  const c=byDomain[d];
  const meta=companyMeta[d]||{};
  const country=String(meta.countryCode||meta.country||'').trim().toUpperCase();
  if(country&&countries.length&&!countries.includes(country)){ drops.country++; continue; }
  c.reviews.sort((a,b)=>String(b.publishedDate||'').localeCompare(String(a.publishedDate||'')));
  const latest=c.reviews[0]||{};
  const replied=c.reviews.filter(r=>r.hasCompanyReply===true).length;
  const clip=(s,n)=>stripPII(String(s||'').replace(/\s+/g,' ').trim()).slice(0,n);
  const quotes=c.reviews.slice(0,3).map(r=>'"'+clip(r.title,80)+'" - '+clip(r.text,220)).join('\n');
  const titles=c.reviews.slice(0,5).map(r=>clip(r.title,80)).filter(Boolean).join(' · ');
  const trust=c.reviews.map(r=>r.companyTrustScore).find(v=>v!==undefined&&v!==null);
  const trustScore=(trust!==undefined&&trust!==null)?Number(trust):(meta.trustScore!==undefined?Number(meta.trustScore):null);
  out.push({ json: {
    domain: d,
    company: c.name||String(meta.companyName||'').trim(),
    headcount: 0,
    country: country,
    company_website: 'https://'+d,
    signal: {
      count: c.reviews.length,
      latest_date: latest.publishedDate||'',
      latest_url: latest.reviewUrl||'',
      titles, quotes,
      replied, replied_label: replied+'/'+c.reviews.length,
      trust_score: trustScore,
      total_reviews: (meta.totalReviews!==undefined&&meta.totalReviews!==null)?Number(meta.totalReviews):null,
      trustpilot_url: 'https://www.trustpilot.com/review/'+d,
      contact_email: String(meta.contactEmail||'').trim()
    }
  }});
}

const stats={ reviews_in: reviews.length, meta_rows: metaRows, companies_in: Object.keys(byDomain).length, qualified: out.length, drops };
if(!out.length) return [{ json: { _empty:true, _stats:stats } }];
out[0].json._stats=stats;
return out;
