// Filter & Qualify Reviews: N scraped Trustpilot rows in, ONE row per qualified company out,
// every drop counted by reason. The signal payload (negative-review count, freshest date, the
// quotes, the reply share, the trust score) rides on the company row so the writer can stamp
// it on every contact. _stats on the first row feeds Build Run Log.
//
// THE FRESH PIECE of this handler; everything downstream is the hiring handler reused.
//
// Source shape: blackfalcondata/trustpilot-reviews-scraper, reviews mode. Stars (1-2) and
// topics (customer_service) are filtered SERVER-SIDE in the Apify task config; the rating<=2
// check here is a belt, counted when it fires. includeCompanyInfo adds company-metadata rows
// (totalReviews, countryCode, contactEmail) to the same dataset; both row kinds are read,
// neither is required. Proven live 2026-08-27 on 10 big + 10 small DTC brands.
//
// Drops, in order: not negative (belt) · no domain · hosted platform · wrong country ·
// already in table. Notes against the hiring handler's hard lines:
//   - Country: company country comes only from a company-metadata row (countryCode).
//     reviewerCountry is the REVIEWER's country, never the company's, and never gates.
//     Unknown company country passes on purpose, mirroring the hiring rule.
//   - Max Employees / headcount: Trustpilot carries no headcount. No gate here; BizData lands
//     Employees on the row and the Signals row's ICP sentence carries the size qualification.
//   - Staffing words / body-shop test: job-post pathologies, no review analog. Not rewritten.
//   - Duplicate: grouping by domain IS the dedupe; the counter stays for repeated
//     company-metadata rows.
const cfg=$('Parse Play').first().json;
let items=$('Get Scraped Reviews').all().map(i=>i.json);
if(items.length===1&&Array.isArray(items[0])) items=items[0];
items=items.filter(r=>r&&typeof r==='object');

const worked=new Set($('Get Worked Domains').all().map(i=>{ const j=i.json||{}; const d=(j.fields&&j.fields.Domain)||j.Domain||''; return String(d).toLowerCase().trim(); }).filter(Boolean));

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

const drops={not_negative:0,no_domain:0,hosted_platform:0,country:0,duplicate:0,worked:0};
const byDomain={};
for(const r of reviews){
  if(Number(r.rating)>2){ drops.not_negative++; continue; }
  const d=norm(r.companyDomain);
  if(!d){ drops.no_domain++; continue; }
  if(isHosted(d)){ drops.hosted_platform++; continue; }
  if(!byDomain[d]) byDomain[d]={ domain:d, name:String(r.companyName||'').trim(), reviews:[] };
  byDomain[d].reviews.push(r);
}

const out=[];
for(const d of Object.keys(byDomain)){
  const c=byDomain[d];
  const meta=companyMeta[d]||{};
  const country=String(meta.countryCode||meta.country||'').trim().toUpperCase();
  if(country&&country!==String(cfg.country||'').toUpperCase()){ drops.country++; continue; }
  if(worked.has(d)){ drops.worked++; continue; }
  c.reviews.sort((a,b)=>String(b.publishedDate||'').localeCompare(String(a.publishedDate||'')));
  const latest=c.reviews[0]||{};
  const replied=c.reviews.filter(r=>r.hasCompanyReply===true).length;
  const clip=(s,n)=>String(s||'').replace(/\s+/g,' ').trim().slice(0,n);
  const quotes=c.reviews.slice(0,3).map(r=>'"'+clip(r.title,80)+'" - '+clip(r.text,220)).join('\n');
  const titles=c.reviews.slice(0,5).map(r=>clip(r.title,80)).filter(Boolean).join(' · ');
  const trust=c.reviews.map(r=>r.companyTrustScore).find(v=>v!==undefined&&v!==null);
  const trustScore=(trust!==undefined&&trust!==null)?Number(trust):(meta.trustScore!==undefined?Number(meta.trustScore):null);
  out.push({ json: {
    domain: d,
    company: c.name||String(meta.companyName||'').trim(),
    headcount: 0,
    country: country||cfg.country,
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
