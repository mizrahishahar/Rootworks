// Split Calls: every qualified company becomes one row per decision-maker spec, each row
// carrying the request body for BOTH contact sources. The HTTP nodes downstream read the body
// off the row in front of them ($json.cg / $('Split Calls').item.json.sq), so one node fires
// once per row and never knows how many specs a play runs.
//
// The specs come from Parse Config (payload knobs, defaults there); nothing here is a filter,
// with one exception that has to live after BizData: a company whose top DiscoLike industry
// group is HR / staffing is a recruiting platform posting someone else's job (proven live
// 2026-08-23: Jack & Jill, HUMAN_RESOURCES 0.98, "DevOps Engineer at Phonely"). Those get no
// paid contact call; they are reported on the first row's _stats for the run log.
// Zero rows still emit one {_empty} placeholder so the Any Calls? gate reaches the close.
const cfg=$('Parse Config').first().json;
const companyRows=$('Filter & Qualify Jobs').all().map(i=>i.json).filter(c=>c&&c.domain);
const specs=Array.isArray(cfg.specs)?cfg.specs:[];

const RECRUITER=new Set(['HUMAN_RESOURCES','STAFFING_RECRUITING','STAFFING','RECRUITING']);
const parse=(b)=>{ if(typeof b!=='string') return b; try{ return JSON.parse(b); }catch(e){ return null; } };
let bizItems=[]; try{ bizItems=$('DiscoLike BizData').all(); }catch(e){}
const recruiter=[];
const companies=[];
companyRows.forEach((c,i)=>{
  const it=bizItems[i]; const b=it&&it.json?parse(it.json.body):null;
  const g=b&&typeof b==='object'?b.industry_groups:null;
  if(g&&typeof g==='object'){
    const top=Object.entries(g).sort((a,b2)=>b2[1]-a[1])[0];
    if(top&&RECRUITER.has(String(top[0]).toUpperCase())&&Number(top[1])>=0.8){ recruiter.push(c.domain); return; }
  }
  companies.push(c);
});

const out=[];
for(const c of companies){
  for(const s of specs){
    const cg={ domain:[c.domain], has_linkedin:true, max_companies:1, results_by_company:s.limit };
    if(s.cg.seniority.length) cg.seniority=s.cg.seniority;
    if(s.cg.department.length) cg.department=s.cg.department;
    if(s.cg.title&&s.cg.title.length) cg.title=s.cg.title;
    if(s.cg.negate_title&&s.cg.negate_title.length) cg.negate_title=s.cg.negate_title;
    const filters={ has_linkedin:true };
    if(s.sq.seniority.length) filters.seniority=s.sq.seniority;
    if(s.sq.function.length) filters.function=s.sq.function;
    out.push({ json: {
      domain:c.domain, company:c.company, call:s.call, limit:s.limit,
      cg,
      sq:{ companies:[{ domain:c.domain }], filters, tier:'full', per_company_limit:s.limit, confirm:true }
    }});
  }
}
const stats={ recruiter_bizdata:recruiter, calls:out.length };
if(!out.length) return [{ json: { _empty:true, _stats:stats } }];
out[0].json._stats=stats;
return out;
