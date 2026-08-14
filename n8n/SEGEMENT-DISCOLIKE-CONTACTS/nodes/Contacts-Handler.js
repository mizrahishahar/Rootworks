
const titleCase = (s) => String(s).replace(/\w\S*/g, t => t.charAt(0).toUpperCase()+t.slice(1).toLowerCase());
const cleanFirst = (full) => { if(!full) return ''; let n=String(full).split(',')[0].trim().split(/\s+/)[0]||''; n=n.replace(/[^A-Za-z\-']/g,''); return n? n.charAt(0).toUpperCase()+n.slice(1).toLowerCase():''; };
const cleanLast = (full) => { if(!full) return ''; let p=String(full).split(',')[0].trim().split(/\s+/); if(p.length<2) return ''; return titleCase(p.slice(1).join(' ').replace(/[^A-Za-z\-'\s]/g,'').trim()); };
const cleanCompany = (name) => { if(!name) return ''; let c=String(name).trim().replace(/[®™]/g,''); for(let i=0;i<2;i++){ c=c.replace(/[,\s]+(inc|llc|l\.l\.c\.|ltd|limited|corp|corporation|co|company|gmbh|plc|llp|lp|pllc|pc)\.?$/i,'').trim(); } return c.replace(/,+$/,'').trim(); };
const ST={AL:'Alabama',AK:'Alaska',AZ:'Arizona',AR:'Arkansas',CA:'California',CO:'Colorado',CT:'Connecticut',DE:'Delaware',FL:'Florida',GA:'Georgia',HI:'Hawaii',ID:'Idaho',IL:'Illinois',IN:'Indiana',IA:'Iowa',KS:'Kansas',KY:'Kentucky',LA:'Louisiana',ME:'Maine',MD:'Maryland',MA:'Massachusetts',MI:'Michigan',MN:'Minnesota',MS:'Mississippi',MO:'Missouri',MT:'Montana',NE:'Nebraska',NV:'Nevada',NH:'New Hampshire',NJ:'New Jersey',NM:'New Mexico',NY:'New York',NC:'North Carolina',ND:'North Dakota',OH:'Ohio',OK:'Oklahoma',OR:'Oregon',PA:'Pennsylvania',RI:'Rhode Island',SC:'South Carolina',SD:'South Dakota',TN:'Tennessee',TX:'Texas',UT:'Utah',VT:'Vermont',VA:'Virginia',WA:'Washington',WV:'West Virginia',WI:'Wisconsin',WY:'Wyoming',DC:'District of Columbia',PR:'Puerto Rico',ON:'Ontario',QC:'Quebec',BC:'British Columbia',AB:'Alberta',MB:'Manitoba',SK:'Saskatchewan',NS:'Nova Scotia',NB:'New Brunswick',NL:'Newfoundland and Labrador',PE:'Prince Edward Island',NT:'Northwest Territories',YT:'Yukon',NU:'Nunavut'};
const FULL=new Set(Object.values(ST).map(v=>v.toLowerCase()));
const stateFull = (raw) => { if(raw==null) return 'your area'; let s=String(raw).trim(); if(!s) return 'your area'; let u=s.toUpperCase().replace(/\./g,''); if(ST[u]) return ST[u]; if(FULL.has(s.toLowerCase())) return titleCase(s); return 'your area'; };
const pickState = (r) => stateFull(r.State!==undefined?r.State:(r.state!==undefined?r.state:(r.Region!==undefined?r.Region:(r.region!==undefined?r.region:(r.contact_region!==undefined?r.contact_region:r.company_region)))));
const pickCompany = (r) => cleanCompany((r.Company!==undefined && String(r.Company).trim()!=='')?r.Company:((r.CompanyName!==undefined && String(r.CompanyName).trim()!=='')?r.CompanyName:(r.company_name!==undefined?r.company_name:r['Company Name'])));
const flat = (r) => { const o={}; for(const k in r){ const v=r[k]; if(v===null||v===undefined) o[k]=''; else if(Array.isArray(v)) o[k]=v.join(', '); else if(typeof v==='object') o[k]=JSON.stringify(v); else o[k]=v; } return o; };
const qn = ($('Contacts Upload').first().json['Query name'])||'';
const rows = $input.all().map(i=>i.json);
const CONTACT_ONLY = new Set(['Name','Title','Seniority','Department','Email','Verified','Phone','Social','Connections','Similarity','first_name','last_name']);
const dwith = new Set();
const cmap = {};
for(const r of rows){
  const dom = String(r.Domain||'').trim().toLowerCase();
  const hasPerson = !!(r.Name && String(r.Name).trim());
  if(hasPerson){ dwith.add(dom); }
  else if(dom){ const c = cmap[dom] || (cmap[dom]={}); for(const k in r){ if(!CONTACT_ONLY.has(k) && r[k]!==undefined && String(r[k]).trim()!=='') c[k]=r[k]; } }
}
const out=[];
for(const r of rows){
  const base=flat(r);
  const dom=String(r.Domain||'').trim().toLowerCase();
  const hasPerson = !!(r.Name && String(r.Name).trim());
  if(hasPerson){
    const co = cmap[dom] || {};
    for(const k in co){ if(!CONTACT_ONLY.has(k) && (base[k]===undefined || String(base[k]).trim()==='')) base[k]=co[k]; }
    const _ver=String(r.Verified||'').trim().toLowerCase();
    if(('Verified' in r) && !['true','verified','yes','1'].includes(_ver)){ base.Email=''; }
    out.push({json:{ ...base, query_name:qn, ingested_at:$now.toISO(), segment:'contacts', first_name:cleanFirst(r.Name), last_name:cleanLast(r.Name), company_clean:pickCompany(r), 'State Full':pickState(r) }});
  } else if(!dwith.has(dom)){
    out.push({json:{ ...base, query_name:qn, ingested_at:$now.toISO(), segment:'no_contacts', company_clean:pickCompany(r), 'State Full':pickState(r) }});
  }
}
return out;