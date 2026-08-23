// Filter & Qualify Jobs: 100 scraped job posts in, one row per qualified company out, every
// drop counted by reason. The full job record rides on the company row so the writer can
// stamp it on every contact. _stats on the first row feeds Build Run Log.
//
// Drops, in order: country, staffing (name / poster title / industry), body shop, headcount,
// no domain, duplicate domain, already worked. An unknown headcount passes on purpose: a blank
// LinkedIn count is not a large company, and the downstream contact calls are capped anyway.
const cfg=$('Parse Config').first().json;
let items=$('Get Scraped Jobs').all().map(i=>i.json);
if(items.length===1&&Array.isArray(items[0])) items=items[0];
items=items.filter(j=>j&&(j.companyName||j.companyWebsite||j.title));
const worked=new Set($('Get Worked Domains').all().map(i=>{ const j=i.json||{}; const d=(j.fields&&j.fields.Domain)||j.Domain||''; return String(d).toLowerCase().trim(); }).filter(Boolean));

const badName=['staffing','recruit','headhunt','talent acquisition','executive search','sourcer','consulting','outsourcing'];
const badIndustry=['staffing','recruiting','executive search','venture capital','private equity','venture'];
const has=(s,list)=>{ s=String(s||'').toLowerCase(); return list.some(w=>s.includes(w)); };

// Body-shop test: a real employer names itself in its own post ("Fortreum is seeking...",
// "About IO River"). A staffing firm pastes a bare requirements list for a client it never
// names. Verified on the 2026-08-20 dataset: 6/6. Employer-brand phrases are the second tell.
const LEGAL=/\b(inc|llc|ltd|corp|corporation|co|company|solutions|technologies|technology|group|systems|services|consulting)\b/g;
const BRAND=['equal opportunity','401(k)','401k','we offer','about us','who we are','our team','our mission','our company','join us','benefits'];
function looksLikeBodyShop(j){
  const desc=String(j.descriptionText||'');
  if(!desc) return false;
  const d=desc.toLowerCase();
  const core=String(j.companyName||'').toLowerCase().replace(LEGAL,' ').replace(/[^a-z0-9]+/g,' ').trim().split(/\s+/).filter(w=>w.length>=3)[0]||'';
  if(core&&d.includes(core)) return false;
  if(BRAND.some(w=>d.includes(w))) return false;
  return true;
}

const drops={country:0,staffing_name:0,staffing_industry:0,body_shop:0,headcount:0,no_domain:0,duplicate:0,worked:0};
const seen=new Set();
const out=[];
for(const j of items){
  const country=(j.companyAddress&&j.companyAddress.addressCountry)||'';
  if(country&&country!==cfg.country){ drops.country++; continue; }
  if(has(j.companyName,badName)||has(j.jobPosterTitle,badName)){ drops.staffing_name++; continue; }
  if(has(j.industries,badIndustry)){ drops.staffing_industry++; continue; }
  if(looksLikeBodyShop(j)){ drops.body_shop++; continue; }
  const emp=Number(j.companyEmployeesCount||0);
  if(emp>cfg.max_headcount){ drops.headcount++; continue; }
  const domain=String(j.companyWebsite||'').toLowerCase().replace('https://','').replace('http://','').replace('www.','').split('?')[0].split('#')[0].split('/')[0].trim();
  if(!domain){ drops.no_domain++; continue; }
  if(seen.has(domain)){ drops.duplicate++; continue; }
  if(worked.has(domain)){ drops.worked++; continue; }
  seen.add(domain);
  out.push({ json: {
    domain,
    company: j.companyName||'',
    headcount: emp,
    country: country||cfg.country,
    company_linkedin: j.companyLinkedinUrl||'',
    company_website: j.companyWebsite||'',
    job: {
      id: String(j.id||''),
      title: j.title||'',
      link: j.link||'',
      posted_at: j.postedAt||'',
      description: j.descriptionText||'',
      seniority: j.seniorityLevel||'',
      function: j.jobFunction||'',
      employment_type: j.employmentType||'',
      industries: j.industries||'',
      applicants: Number(j.applicantsCount)||null,
      salary: j.salary||'',
      poster_name: j.jobPosterName||'',
      poster_title: j.jobPosterTitle||'',
      poster_linkedin: j.jobPosterProfileUrl||''
    }
  }});
}
const stats={ jobs_in: items.length, qualified: out.length, drops };
if(!out.length) return [{ json: { _empty:true, _stats:stats } }];
out[0].json._stats=stats;
return out;
