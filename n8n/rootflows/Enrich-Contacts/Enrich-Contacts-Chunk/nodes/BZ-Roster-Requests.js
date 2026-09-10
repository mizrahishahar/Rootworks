// BZ Roster Requests: the domain-to-linkedin answers (one per company, aligned to BZ Companies by
// index, error items included) -> one employee-finder request per company that resolved. The cap
// is max_results (1 to 50), one page: a cap never exceeds 50, so the second page is never needed.
// Companies that did not resolve, and every error, are carried in _stats for BZ Parse.
// n8n hands a node failure over as {error}: a plain string ("Credentials not found") or an object with message and description. Read both shapes.
const errMsg=(e)=>{ if(!e) return 'call failed'; if(typeof e==='string') return e; return String((e.message||'')+' '+(e.description||'')).trim()||'call failed'; };
const reqs=$('BZ Companies').all().map(i=>i.json||{});
let answers=[]; try{ answers=$('BZ Domain To LinkedIn').all(); }catch(e){}
const st={ resolveCalled:0, resolved:0, unresolved:0, errors:0, noKey:0, firstError:'', failReasons:[] };
const out=[];
answers.forEach((it,i)=>{
  const req=reqs[i]; if(!req||req._none) return;
  st.resolveCalled++;
  const j=it.json||{};
  if(j.error&&j.body===undefined&&j.found===undefined){
    const msg=errMsg(j.error);
    if(/credential/i.test(msg)){ st.noKey++; return; }
    st.errors++; const r='Blitz domain-to-linkedin: '+msg.slice(0,160); if(!st.firstError) st.firstError=r; st.failReasons.push(r); return;
  }
  const b=(j.body!==undefined)?j.body:j;
  const status=Number(j.statusCode)||200;
  if(status>=300||!b||typeof b!=='object'){ st.errors++; const r='Blitz domain-to-linkedin HTTP '+status+' '+JSON.stringify(b).slice(0,120); if(!st.firstError) st.firstError=r; st.failReasons.push(r); return; }
  const url=String(b.company_linkedin_url||'').trim();
  if(!b.found||!url){ st.unresolved++; return; }
  st.resolved++;
  out.push({ json:{ domain:req.domain, cap:req.cap, companyLinkedin:url, body:{ company_linkedin_url:url, job_level:req.jobLevel, max_results:req.cap, page:1 } } });
});
if(!out.length) return [{ json:{ _none:true, _stats:st } }];
out[0].json._stats=st;
return out;
