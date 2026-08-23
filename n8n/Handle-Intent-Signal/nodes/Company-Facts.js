// Company Facts: reads BizData for every company that passed the hard lines, drops the ones
// DiscoLike reports closed, and hands the survivors to the ICP check as ONE list (one task,
// per DiscoLike's own rule). Industry groups are recorded on the row later, never a verdict.
// Emits one item: { domains, icp_text, companies:{domain -> {company row, biz}} }.
const cfg=$('Parse Play').first().json;
const parse=(b)=>{ if(typeof b!=='string') return b; try{ return JSON.parse(b); }catch(e){ return null; } };
const rows=$('Filter & Qualify Jobs').all().map(i=>i.json).filter(c=>c&&c.domain);
let bizItems=[]; try{ bizItems=$('DiscoLike BizData').all(); }catch(e){}
const stats={ called:0, matched:0, unknown:0, closed:0, errors:0, failed:[] };
const companies={};
const closed=[];
rows.forEach((c,i)=>{
  const it=bizItems[i]; const j=(it&&it.json)||{};
  const status=Number(j.statusCode)||0; const b=parse(j.body===undefined?null:j.body);
  stats.called++;
  let biz=null;
  if(status>=200&&status<300&&b&&typeof b==='object'&&(b.domain||b.name)){ biz=b; stats.matched++; }
  else if(status===204||status===404){ stats.unknown++; }
  else { stats.errors++; stats.failed.push({ tier:'BizData', name:c.domain, reason:'HTTP '+status+' '+String((b&&(b.detail||b.error||b.message))||'').slice(0,120) }); }
  if(biz&&biz.status&&biz.status.status==='closed'&&Number(biz.status.confidence||0)>=0.8){ stats.closed++; closed.push(c.domain); return; }
  companies[c.domain]={ company:c, biz };
});
const domains=Object.keys(companies);
const out={ domains, icp_text: cfg.icp_text, companies, closed, _stats: stats };
return [{ json: out }];
