// Build Prospects: the view's rows into pull-in bodies, one item per prospect to push.
// Identity, hard: LinkedIn URL (this door's key) and Company (or company_clean); the name
// rides when present, Alta resolves the person from the URL.
// The stamp-gate: a row whose Campaigns links already carry this campaign's mirror row is
// skipped, the door's ONLY dedupe and the whole of it (Operator 2026-08-28: Alta relies
// solely on the stamp). Every required variable missing skips the row with its name.
const sd=$getWorkflowStaticData('global'); const dk='deploy_'+$execution.id; const D=sd[dk];
if(D.abort){ return [{json:{_none:true}}]; }
let rows=[];
try{ for(const it of $input.all()){ const j=it.json||{}; const recs=Array.isArray(j.records)?j.records:(j.id?[j]:[]); rows.push(...recs); } }catch(e){}
D.rowsTotal=rows.length;
if(!rows.length){ D.abort='view empty'; D.errors.push('view "'+D.view+'" returned no rows; nothing was sent'); return [{json:{_none:true}}]; }
// The one reader for every field. A register-shaped People table carries the company facts
// (Domain, Company, Tag, Employees, Country and the rest) as lookups through the Companies link,
// so Airtable returns arrays; an array yields its first value, an object its value or name,
// never a joined list (ruling 2026-09-02). Company and Domain for the identity come from those.
const val=v=>{ if(v===null||v===undefined) return ''; if(Array.isArray(v)) return v.length?val(v[0]):''; if(typeof v==='string') return v.trim(); if(typeof v==='number'||typeof v==='boolean') return String(v); if(typeof v==='object'){ if(typeof v.value==='string') return v.value.trim(); if(typeof v.name==='string') return v.name.trim(); } return ''; };
const snake=k=>String(k).replace(/[^a-zA-Z0-9]+/g,'_').replace(/^_+|_+$/g,'').toLowerCase();
const normUrl=u=>String(u||'').toLowerCase().replace(/^https?:\/\//,'').replace(/^www\./,'').replace(/\/+$/,'').split('?')[0];
const plan=D.plan||{varCols:[],rideCols:[]};
D.rows={}; D.urlToRow={}; D.varMisses={};
const out=[];
for(const r of rows){
  const f=r.fields||{};
  const rec={skip:null, camps:Array.isArray(f['Campaigns'])?f['Campaigns']:[]};
  D.rows[r.id]=rec;
  const li=val(f['LinkedIn URL']);
  if(!/^https?:\/\//i.test(li)){ rec.skip='missing LinkedIn URL'; continue; }
  rec.url=normUrl(li);
  if(D.stampMirrorRid&&rec.camps.indexOf(D.stampMirrorRid)>=0){ rec.skip='already in campaign (Campaigns stamp)'; continue; }
  if(D.urlToRow[rec.url]){ rec.skip='duplicate LinkedIn URL in view (row '+D.urlToRow[rec.url]+' already queued)'; continue; }
  // first_name is NOT identity here (Operator 2026-08-31): Alta resolves the person from the
  // LinkedIn URL, so the name rides along when present and never blocks.
  const fn=val(f['first_name']);
  const comp=val(f['company_clean'])||val(f['Company']); if(!comp){ rec.skip='missing company name'; continue; }
  const extra={}; const missing=[];
  for(const col of plan.varCols){ const v=val(f[col]); if(v) extra[snake(col)]=v.length>4000?v.slice(0,4000):v; else missing.push(col); }
  if(missing.length){ for(const m of missing) D.varMisses[m]=(D.varMisses[m]||0)+1; rec.skip='missing '+missing.join(', ').slice(0,120); continue; }
  for(const col of plan.rideCols){ const v=val(f[col]); if(v) extra[snake(col)]=v.length>4000?v.slice(0,4000):v; }
  // Vars ride twice: extraInfoData is Alta's display blob; customFields populate the DEFINED
  // prospect fields, the only place sequence templates render from (proven 2026-09-01: values
  // visible on the card but blank in the copy until the defined field carries them).
  // customFields accepts ONLY defined keys and 400s the whole prospect on an unknown one, so
  // keys that are really Alta system fields ship top-level under Alta's name, and every other
  // var key must exist as a defined prospect field (create_prospect_field, once per account);
  // that is part of campaign setup, and a missing one fails loud in the push responses.
  const SYSKEY={title:'jobTitle',seniority:'seniority',city:'city',state:'state',country:'country',description:'description'};
  // Only DEFINED prospect-field keys may enter customFields; one unknown key 400s the whole
  // prospect (proven 2026-09-01: the Job payload rides 400ed all 260). Until the door
  // self-provisions fields from Alta (queued), the defined set is listed here.
  const DEFINED=['job_needs','mechanical_work','workload','real_company_name','open_infrastructure_positions'];
  const body={ company:comp, linkedinUrl:li, extraInfoData:extra };
  const custom={};
  for(const k of Object.keys(extra)){
    if(SYSKEY[k]){ body[SYSKEY[k]]=extra[k]; continue; }
    if(DEFINED.indexOf(k)>=0) custom[k]=extra[k];
  }
  if(Object.keys(custom).length) body.customFields=custom;
  if(fn) body.firstName=fn;
  const ln=val(f['last_name']); if(ln) body.lastName=ln;
  const dom=val(f['Domain']); if(dom) body.companyWebsite=/^https?:\/\//i.test(dom)?dom:'https://'+dom;
  const email=val(f['Final Email']); if(email) body.email=email;
  D.urlToRow[rec.url]=r.id;
  out.push({json:{recordId:r.id, enroll_body:body, campaign_url:D.pullInUrl}});
}
const skipCounts={};
for(const id of Object.keys(D.rows)){ const s=D.rows[id].skip; if(s){ const key=s.indexOf('missing ')===0?s:(s.indexOf('DNC')===0?'DNC':s); skipCounts[key]=(skipCounts[key]||0)+1; } }
D.skipCounts=skipCounts;
if(!out.length) return [{json:{_none:true}}];
return out;
