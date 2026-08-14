const cmap=$('Parse Domains').first().json._cmap||{};
// Generic company/domain-level carry-through. Anything the source CSV carries that is not part of
// the fixed field contract and not plumbing rides along, matching the auto-adder in Build Table
// Schema, so a new source column needs no edit here. Person-level fields stay from Supersoniq.
const CORE=new Set(['Name','Contact Key','first_name','last_name','Title','Seniority','Department','Email','Social','Phone','Connections','Domain','Company','company_clean','Industry Groups','Employees','Business Model','MX Provider','Score','Similarity','Description','Keywords','City','State','State Full','Country','Zip','Street','Source','Plan','Revenue Est Monthly','Store Age Years','Product Count','App Spend Mo','Key Apps','Tech Stack','Trustpilot Rating','Trustpilot Reviews','Migrated From','Social Followers','Growth 90d','Features','Seniority Rank']);
const XSKIP=new Set(['domain','company_domain','Verified','segment','query_name','ingested_at','RankInCompany','Run ID','Build Date','Tag']);
const xmap={};
for(const r of $('Read CSV').all().map(i=>i.json)){
  const d=String(r.Domain||r.domain||r.company_domain||'').trim().toLowerCase();
  if(!d)continue;
  const x=xmap[d]||(xmap[d]={});
  for(const k of Object.keys(r)){ if(CORE.has(k)||XSKIP.has(k))continue; const v=r[k]; if((x[k]===undefined||x[k]==='')&&v!==undefined&&v!==null&&String(v).trim()!=='')x[k]=String(v).trim(); }
}
const runId=String($execution.id);
const tag=((($('Contacts Launch').first().json['Tag'])||'')+'').trim();
const _st=($('Config').first().json||{}).startedAt;
let buildDate='';
try{ buildDate=DateTime.fromISO(String(_st)).toFormat('yyyy-MM-dd'); }catch(e){ buildDate=''; }
if(!buildDate||buildDate==='Invalid DateTime'){ buildDate=$now.toFormat('yyyy-MM-dd'); }
const cap=(s)=>s?s.charAt(0).toUpperCase()+s.slice(1).toLowerCase():'';
const cleanFirst=(full)=>{ if(!full)return''; const tok=String(full).split(',')[0].trim().split(/\s+/)[0]||''; return cap(tok.replace(/[^A-Za-z'\-]/g,'')); };
const cleanLast=(full)=>{ if(!full)return''; const parts=String(full).split(',')[0].trim().split(/\s+/); if(parts.length<2)return''; return parts.slice(1).map(p=>cap(p.replace(/[^A-Za-z'\-]/g,''))).filter(Boolean).join(' '); };
const cleanCompany=(nm)=>{if(!nm)return'';const orig=String(nm).trim();let c=orig;
const GEN=new Set(['home','welcome','shop','store','about','about us','products','index','page','contact','contact us','blog','news']);
const isGen=(s)=>GEN.has(String(s).trim().toLowerCase());
const pick=(a)=>{for(const p of a){if(p&&String(p).trim()&&!isGen(p))return String(p).trim();}return null;};
c=c.replace(/^welcome to\s+/i,'').trim();
const pp=c.split(' | '); if(pp.length>1){const s=pick(pp); if(s===null) return orig; c=s;}
for(let i=0;i<2;i++){const d=c.search(/\s[-–—]\s/); if(d<3) break; const head=c.slice(0,d).trim(); const tail=c.slice(d).replace(/^\s[-–—]\s/,'').trim(); const s=pick([head,tail]); if(s===null) return orig; c=s;}
if(/^[A-Za-z0-9][A-Za-z0-9-]*(\.[A-Za-z]{2,})+$/.test(c)) c=c.replace(/(\.[A-Za-z]{2,})+$/,'');
c=c.replace(/[®™]/g,'');
for(let i=0;i<2;i++){c=c.replace(/[,\s]+(inc|llc|l\.l\.c\.|ltd|limited|corp|corporation|co|company|gmbh|plc|llp|lp|pllc|pc)\.?$/i,'').trim();}
c=c.replace(/,+$/,'').trim();
const hasUp=/\p{Lu}/u.test(c), hasLow=/\p{Ll}/u.test(c);
if(hasUp!==hasLow){const parts=c.split(/(\s+)/); const words=parts.filter(t=>/\S/.test(t)); const MINOR=new Set(['of','and','the','for','to','in','on','at','by','a','an']);
if(!(hasUp&&words.length===1&&c.length<=4)){let wi=-1; c=parts.map(t=>{if(!/\S/.test(t))return t; wi++; const lw=t.toLowerCase(); return (wi>0&&MINOR.has(lw))?lw:lw.replace(/\p{L}/u,(ch)=>ch.toUpperCase());}).join('');}}
return c;};
const band=(n)=>{ n=Number(n); if(!Number.isFinite(n)||n<=0)return''; if(n<=10)return'1-10'; if(n<=50)return'11-50'; if(n<=200)return'51-200'; if(n<=500)return'201-500'; if(n<=1000)return'501-1000'; if(n<=5000)return'1001-5000'; if(n<=10000)return'5001-10000'; return'10001+'; };
const STATES={AL:'Alabama',AK:'Alaska',AZ:'Arizona',AR:'Arkansas',CA:'California',CO:'Colorado',CT:'Connecticut',DE:'Delaware',FL:'Florida',GA:'Georgia',HI:'Hawaii',ID:'Idaho',IL:'Illinois',IN:'Indiana',IA:'Iowa',KS:'Kansas',KY:'Kentucky',LA:'Louisiana',ME:'Maine',MD:'Maryland',MA:'Massachusetts',MI:'Michigan',MN:'Minnesota',MS:'Mississippi',MO:'Missouri',MT:'Montana',NE:'Nebraska',NV:'Nevada',NH:'New Hampshire',NJ:'New Jersey',NM:'New Mexico',NY:'New York',NC:'North Carolina',ND:'North Dakota',OH:'Ohio',OK:'Oklahoma',OR:'Oregon',PA:'Pennsylvania',RI:'Rhode Island',SC:'South Carolina',SD:'South Dakota',TN:'Tennessee',TX:'Texas',UT:'Utah',VT:'Vermont',VA:'Virginia',WA:'Washington',WV:'West Virginia',WI:'Wisconsin',WY:'Wyoming',DC:'District of Columbia',PR:'Puerto Rico',ON:'Ontario',QC:'Quebec',BC:'British Columbia',AB:'Alberta',MB:'Manitoba',SK:'Saskatchewan',NS:'Nova Scotia',NB:'New Brunswick'};
const stateFull=(s)=>{ const v=String(s||'').trim(); if(!v)return''; const up=v.toUpperCase(); if(STATES[up])return STATES[up]; return v.split(/\s+/).map(cap).join(' '); };
const numOr=(v)=>{ if(v===null||v===undefined||String(v).trim()==='')return''; const n=Number(v); return Number.isFinite(n)?n:''; };
const out=[];
let skipped=0;
for(const it of $input.all()){
  const resp=it.json||{};
  const results=Array.isArray(resp.results)?resp.results:[];
  for(const r of results){
    const contacts=Array.isArray(r.contacts)?r.contacts:[];
    for(const ct of contacts){
      const domain=String(ct.company_domain||'').trim().toLowerCase();
      const co=cmap[domain]||{};
      const extras=xmap[domain]||{};
      const full=((String(ct.first_name||'')+' '+String(ct.last_name||'')).trim())||String(ct.full_name||'');
      const first=cleanFirst(full); const last=cleanLast(full);
      const key=(first.toLowerCase()+last.toLowerCase()+domain).trim();
      if(!key){ skipped++; continue; }
      const coName=cleanCompany(co.Company||String(ct.company_name||''));
      out.push({ json: {
        ...extras,
        'Contact Key': key,
        Name: full, first_name: first, last_name: last,
        Title: String(ct.job_title||''), Seniority: String(ct.seniority||''), Department: String(ct.function||''),
        Email: String(ct.email||''), Social: String(ct.linkedin_url||''),
        Phone:'', Connections:'',
        Domain: domain, Company: coName, company_clean: coName,
        'Industry Groups': co['Industry Groups']||'', Employees: band(co.Employees),
        'Business Model': co['Business Model']||'', 'MX Provider': co['MX Provider']||'',
        Score:'', Similarity:'', Description: co.Description||'', Keywords:'',
        City: co.City||'', State: co.State||'', 'State Full': stateFull(co.State), Country: co.Country||'',
        Zip:'', Street:'', Source:'Supersoniq', 'Run ID': runId, 'Build Date': buildDate, Tag: tag,
        Plan: co.Plan||'',
        'Revenue Est Monthly': numOr(co['Revenue Est Monthly']),
        'Store Age Years': numOr(co['Store Age Years']),
        'Product Count': numOr(co['Product Count']),
        'App Spend Mo': numOr(co['App Spend Mo']),
        'Key Apps': co['Key Apps']||'', 'Tech Stack': co['Tech Stack']||'',
        'Trustpilot Rating': numOr(co['Trustpilot Rating']),
        'Trustpilot Reviews': numOr(co['Trustpilot Reviews']),
        'Migrated From': co['Migrated From']||'', 'Social Followers': co['Social Followers']||'',
        'Growth 90d': numOr(co['Growth 90d']), Features: co.Features||''
      }});
    }
  }
}
const sd=$getWorkflowStaticData('global');
sd.contactsSkipped=skipped;
sd.contactsWritten=out.length;
if(!out.length){ throw new Error('Supersoniq returned no usable contacts for '+($('Parse Domains').first().json._domain_count)+' domain(s). Rows skipped for an empty Contact Key: '+skipped+'.'); }
return out;