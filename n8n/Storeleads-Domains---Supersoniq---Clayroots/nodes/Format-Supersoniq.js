const cmap=$('Parse Domains').first().json._cmap||{};
// Generic company/domain-level carry-through. Anything the source CSV carries that is not part of
// the fixed field contract and not plumbing rides along, matching the auto-adder in Build Table
// Schema, so a new source column needs no edit here. Person-level fields stay from Supersoniq.
const CORE=new Set(['Name','Contact Key','first_name','last_name','Title','Seniority','Department','Email','Social','Phone','Connections','Domain','Company','company_clean','Industry Groups','Employees','Business Model','MX Provider','Score','Similarity','Description','Keywords','City','State','State Full','Country','Zip','Street','Source','Plan','Revenue Est Monthly','Store Age Years','Product Count','App Spend Mo','Key Apps','Tech Stack','Trustpilot Rating','Trustpilot Reviews','Migrated From','Social Followers','Growth 90d','Features','Seniority Rank']);
const XSKIP=new Set(['domain','company_domain','Verified','segment','query_name','ingested_at','RankInCompany','Run ID','Build Date','Tag','public_emails_clean','Created']);
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
const band=(n)=>{ n=Number(n); if(!Number.isFinite(n)||n<=0)return''; if(n<=10)return'1-10'; if(n<=50)return'11-50'; if(n<=200)return'51-200'; if(n<=500)return'201-500'; if(n<=1000)return'501-1000'; if(n<=5000)return'1001-5000'; if(n<=10000)return'5001-10000'; return'10001+'; };
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
      // Raw here; the Clean Fields helper (next node) writes the cleaned Company / company_clean / State Full.
      const coName=String(co.Company||ct.company_name||'').trim();
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
        City: co.City||'', State: co.State||'', 'State Full': '', Country: co.Country||'',
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