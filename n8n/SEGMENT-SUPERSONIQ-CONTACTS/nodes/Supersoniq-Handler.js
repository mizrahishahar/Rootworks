
const titleCase = (s) => String(s).replace(/\w\S*/g, t => t.charAt(0).toUpperCase()+t.slice(1).toLowerCase());
const cleanNamePart = (n) => { if(!n) return ''; return titleCase(String(n).trim().replace(/[^A-Za-z\-'\s]/g,'').trim()); };
const cleanCompany = (name) => { if(!name) return ''; let c=String(name).trim().replace(/[\u00AE\u2122]/g,''); for(let i=0;i<2;i++){ c=c.replace(/[,\s]+(inc|llc|l\.l\.c\.|ltd|limited|corp|corporation|co|company|gmbh|plc|llp|lp|pllc|pc)\.?$/i,'').trim(); } return c.replace(/,+$/,'').trim(); };
const ST={AL:'Alabama',AK:'Alaska',AZ:'Arizona',AR:'Arkansas',CA:'California',CO:'Colorado',CT:'Connecticut',DE:'Delaware',FL:'Florida',GA:'Georgia',HI:'Hawaii',ID:'Idaho',IL:'Illinois',IN:'Indiana',IA:'Iowa',KS:'Kansas',KY:'Kentucky',LA:'Louisiana',ME:'Maine',MD:'Maryland',MA:'Massachusetts',MI:'Michigan',MN:'Minnesota',MS:'Mississippi',MO:'Missouri',MT:'Montana',NE:'Nebraska',NV:'Nevada',NH:'New Hampshire',NJ:'New Jersey',NM:'New Mexico',NY:'New York',NC:'North Carolina',ND:'North Dakota',OH:'Ohio',OK:'Oklahoma',OR:'Oregon',PA:'Pennsylvania',RI:'Rhode Island',SC:'South Carolina',SD:'South Dakota',TN:'Tennessee',TX:'Texas',UT:'Utah',VT:'Vermont',VA:'Virginia',WA:'Washington',WV:'West Virginia',WI:'Wisconsin',WY:'Wyoming',DC:'District of Columbia',PR:'Puerto Rico',ON:'Ontario',QC:'Quebec',BC:'British Columbia',AB:'Alberta',MB:'Manitoba',SK:'Saskatchewan',NS:'Nova Scotia',NB:'New Brunswick',NL:'Newfoundland and Labrador',PE:'Prince Edward Island',NT:'Northwest Territories',YT:'Yukon',NU:'Nunavut'};
const FULL=new Set(Object.values(ST).map(v=>v.toLowerCase()));
const stateFull = (raw) => { if(raw==null) return 'your area'; let s=String(raw).trim(); if(!s) return 'your area'; let u=s.toUpperCase().replace(/\./g,''); if(ST[u]) return ST[u]; if(FULL.has(s.toLowerCase())) return titleCase(s); return 'your area'; };
const flat = (r) => { const o={}; for(const k in r){ const v=r[k]; if(v===null||v===undefined) o[k]=''; else if(Array.isArray(v)) o[k]=v.join(', '); else if(typeof v==='object') o[k]=JSON.stringify(v); else o[k]=v; } return o; };
const pick = (r, keys) => { for(const k of keys){ if(r[k]!==undefined && String(r[k]).trim()!=='') return String(r[k]).trim(); } return ''; };
const qn = ($('Supersoniq Upload').first().json['Query name'])||'';
const rows = $input.all().map(i=>i.json);
const CONSUMED = new Set(['ref','company_id','contact_id','full_name','first_name','last_name','job_title','seniority','function','email','email_kind','contact_email_status','contact_email_mx_record','email_esp_provider','company_name','company_domain','domain','company_website','company_linkedin_url','company_industry_primary','company_industry_tags','company_size','company_size_bucket','company_staff_headcount','company_revenue','contact_city','contact_region','contact_country','company_city','company_region','company_country','linkedin_url','Name','Company','Title','Seniority','Email','Verified','Social','Industry Groups','Employees','Revenue Range','City','State','Country','Description','Source','Domain']);
const norm = rows.map(r => {
  const f = flat(r);
  const o = {};
  for(const k in f){ if(!CONSUMED.has(k)) o[k]=f[k]; }
  const domain = pick(r,['Domain','domain','company_domain']).toLowerCase();
  const first = cleanNamePart(pick(r,['first_name'])).split(/\s+/)[0]||'';
  const last = cleanNamePart(pick(r,['last_name']));
  const name = pick(r,['Name']) || pick(r,['full_name']) || (first && (first+' '+last).trim()) || '';
  const status = pick(r,['contact_email_status']).toLowerCase();
  const verRaw = pick(r,['Verified']);
  const verified = verRaw !== '' ? ['true','verified','yes','1'].includes(verRaw.toLowerCase()) : status==='verified';
  const emailRaw = pick(r,['Email','email']);
  o.Name = name;
  o.first_name = first;
  o.last_name = last;
  o.Domain = domain;
  o.Company = pick(r,['Company','CompanyName','Company Name','company_name']);
  o.Title = pick(r,['Title','job_title']);
  o.Seniority = pick(r,['Seniority','seniority']);
  o.Social = pick(r,['Social','linkedin_url']);
  o.Verified = verified ? 'true' : 'false';
  o.Email = verified ? emailRaw : '';
  o['Industry Groups'] = pick(r,['Industry Groups','company_industry_primary']);
  o.Employees = pick(r,['Employees','company_staff_headcount','company_size']);
  o['Revenue Range'] = pick(r,['Revenue Range','company_revenue']);
  o.City = pick(r,['City','contact_city','company_city']);
  o.State = pick(r,['State','contact_region','company_region']);
  o.Country = pick(r,['Country','contact_country','company_country']);
  o.Description = pick(r,['Description','description']);
  o.Source = pick(r,['Source']) || 'Supersoniq';
  return o;
});
const CONTACT_ONLY = new Set(['Name','Title','Seniority','Department','Email','Verified','Phone','Social','Connections','Similarity','first_name','last_name']);
const dwith = new Set();
const cmap = {};
for(const r of norm){
  const dom = r.Domain;
  const hasPerson = !!(r.Name && String(r.Name).trim());
  if(hasPerson){ dwith.add(dom); }
  else if(dom){ const c = cmap[dom] || (cmap[dom]={}); for(const k in r){ if(!CONTACT_ONLY.has(k) && r[k]!==undefined && String(r[k]).trim()!=='') c[k]=r[k]; } }
}
const out=[];
for(const r of norm){
  const dom = r.Domain;
  const hasPerson = !!(r.Name && String(r.Name).trim());
  if(hasPerson){
    const base = Object.assign({}, r);
    const co = cmap[dom] || {};
    for(const k in co){ if(!CONTACT_ONLY.has(k) && (base[k]===undefined || String(base[k]).trim()==='')) base[k]=co[k]; }
    out.push({json:{ ...base, query_name:qn, ingested_at:$now.toISO(), segment:'contacts', company_clean:cleanCompany(base.Company), 'State Full':stateFull(base.State) }});
  } else if(!dwith.has(dom)){
    out.push({json:{ ...r, query_name:qn, ingested_at:$now.toISO(), segment:'no_contacts', company_clean:cleanCompany(r.Company), 'State Full':stateFull(r.State) }});
  }
}
return out;