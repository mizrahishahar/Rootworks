// Build Prospects: the view's rows into pull-in bodies, one item per prospect to push.
// Identity, hard: LinkedIn URL (this door's key), first_name, Company (or company_clean).
// The stamp-gate: a row whose Campaigns links already carry this campaign's mirror row is
// skipped, the door's ONLY dedupe and the whole of it (Operator 2026-08-28: Alta relies
// solely on the stamp). Every required variable missing skips the row with its name.
const sd=$getWorkflowStaticData('global'); const dk='deploy_'+$execution.id; const D=sd[dk];
if(D.abort){ return [{json:{_none:true}}]; }
let rows=[];
try{ for(const it of $input.all()){ const j=it.json||{}; const recs=Array.isArray(j.records)?j.records:(j.id?[j]:[]); rows.push(...recs); } }catch(e){}
D.rowsTotal=rows.length;
if(!rows.length){ D.abort='view empty'; D.errors.push('view "'+D.view+'" returned no rows; nothing was sent'); return [{json:{_none:true}}]; }
const val=v=>{ if(v===null||v===undefined) return ''; if(typeof v==='string') return v.trim(); if(typeof v==='number'||typeof v==='boolean') return String(v); if(Array.isArray(v)) return v.filter(x=>typeof x==='string'||typeof x==='number').join(', '); if(typeof v==='object'&&typeof v.value==='string') return v.value.trim(); if(typeof v==='object'&&typeof v.name==='string') return v.name; return ''; };
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
  const fn=val(f['first_name']); if(!fn){ rec.skip='missing first_name'; continue; }
  const comp=val(f['company_clean'])||val(f['Company']); if(!comp){ rec.skip='missing company name'; continue; }
  const extra={}; const missing=[];
  for(const col of plan.varCols){ const v=val(f[col]); if(v) extra[snake(col)]=v.length>4000?v.slice(0,4000):v; else missing.push(col); }
  if(missing.length){ for(const m of missing) D.varMisses[m]=(D.varMisses[m]||0)+1; rec.skip='missing '+missing.join(', ').slice(0,120); continue; }
  for(const col of plan.rideCols){ const v=val(f[col]); if(v) extra[snake(col)]=v.length>4000?v.slice(0,4000):v; }
  const body={ firstName:fn, lastName:val(f['last_name']), company:comp, linkedinUrl:li, extraInfoData:extra };
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
