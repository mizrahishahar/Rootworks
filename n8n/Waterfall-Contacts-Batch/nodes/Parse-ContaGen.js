// Parse ContaGen: DiscoLike /contacts/discover responses (fullResponse items aligned to CG
// Requests) -> people per domain, truncated to the band cap. An errored call (after the node's
// own retries) counts once and lands in the counters with its reason; nothing is silently dropped.
const plan=$('Plan Batch').first().json;
const byDomain={}; for(const c of plan.plan) byDomain[c.domain]=c;
let reqs=[]; try{ reqs=$('CG Requests').all().map(i=>i.json); }catch(e){}
let items=[]; try{ items=$('ContaGen Discover').all(); }catch(e){}
const parse=(b)=>{ if(typeof b!=='string') return b; try{ return JSON.parse(b); }catch(e){ return null; } };
const why=(b,raw)=>{ const m=b&&typeof b==='object'?(b.detail||b.error||b.message):null; const s=m?String(typeof m==='object'?JSON.stringify(m):m):(typeof raw==='string'?raw:(raw?JSON.stringify(raw):'')); return String(s||'empty body').slice(0,200); };
const linkedinOf=(urls)=>Array.isArray(urls)?(urls.find(u=>/linkedin\.com\/in\//i.test(String(u)))||''):'';
const firstPhone=(p)=>Array.isArray(p)&&p.length?String((p[0]&&p[0].phone)||p[0]||''):(p?String(p):'');
const people={}; const st={ called:0, returned:0, kept:0, credits:0, errors:0, firstError:'', failReasons:[] };
items.forEach((it,i)=>{
  const req=reqs[i]; if(!req) return;
  st.called++;
  const j=it.json||{};
  if(j.error&&j.statusCode===undefined){ st.errors++; const r='ContaGen: '+String((j.error&&(j.error.message||j.error.description))||'call failed').slice(0,160); if(!st.firstError) st.firstError=r; st.failReasons.push(r); return; }
  const status=Number(j.statusCode)||0; const b=parse(j.body===undefined?j:j.body);
  if(!(status>=200&&status<300)||!b||typeof b!=='object'){ st.errors++; const r='ContaGen HTTP '+status+' '+why(b,j.body); if(!st.firstError) st.firstError=r; st.failReasons.push(r); return; }
  const cr=b.credits_used!=null?b.credits_used:(b.credits!=null?b.credits:((b.usage&&b.usage.credits_used)||0)); st.credits+=Number(cr)||0;
  const results=(b.results&&typeof b.results==='object')?b.results:{};
  for(const d of req.domains){
    const entry=results[d]||null; const c=byDomain[d]; if(!entry||!c) continue;
    const contacts=Array.isArray(entry.contacts)?entry.contacts:[];
    st.returned+=contacts.length;
    const list=people[d]||(people[d]=[]);
    for(const p of contacts){
      if(list.length>=c.cap) break;
      list.push({ source:'ContaGen', sourceId:String(p.persona_id||''), name:String(p.name||'').trim(), title:String(p.title||'').trim(), seniority:String(p.seniority||''), department:String(p.department||''), email:String(p.email||'').trim(), linkedin:linkedinOf(p.social_urls), phone:firstPhone(p.phone), state:String(p.state||'') });
      st.kept++;
    }
  }
});
return [{ json: { people: people, stats: st } }];
