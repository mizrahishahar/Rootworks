// BZ Parse: the employee-finder answers (aligned to BZ Roster Requests by index) -> people per
// domain, plus the provider verdict in the shared provider contract (see GL Parse). Employee
// Finder returns no email, no seniority and no department per row: the title comes from the
// person's current experience at this company, seniority and department are derived from the
// title by the caller's merge. Never throws.
// n8n hands a node failure over as {error}: a plain string ("Credentials not found") or an object with message and description. Read both shapes.
const errMsg=(e)=>{ if(!e) return 'call failed'; if(typeof e==='string') return e; return String((e.message||'')+' '+(e.description||'')).trim()||'call failed'; };
const st={ called:0, returned:0, kept:0, credits:0, errors:0, firstError:'', failReasons:[], resolveCalled:0, resolved:0, unresolved:0, noKey:0 };
const people={};
let first={}; try{ first=$('BZ Roster Requests').first().json||{}; }catch(e){}
const rs=first._stats||{};
for(const k of ['resolveCalled','resolved','unresolved','noKey']) st[k]=Number(rs[k])||0;
st.errors+=Number(rs.errors)||0; if(rs.firstError&&!st.firstError) st.firstError=rs.firstError; for(const r of (rs.failReasons||[])) st.failReasons.push(r);
let reqs=[]; try{ reqs=$('BZ Roster Requests').all().map(i=>i.json||{}).filter(j=>!j._none); }catch(e){}
let answers=[]; try{ answers=$('BZ Employee Finder').all(); }catch(e){}
const norm=(d)=>String(d||'').trim().toLowerCase().replace(/^https?:\/\//,'').replace(/^www\./,'').replace(/\/.*$/,'');
answers.forEach((it,i)=>{
  const req=reqs[i]; if(!req) return;
  st.called++;
  const j=it.json||{};
  if(j.error&&j.body===undefined&&j.results===undefined){
    const msg=errMsg(j.error);
    if(/credential/i.test(msg)){ st.noKey++; return; }
    st.errors++; const r='Blitz employee-finder: '+msg.slice(0,160); if(!st.firstError) st.firstError=r; st.failReasons.push(r); return;
  }
  const b=(j.body!==undefined)?j.body:j;
  const status=Number(j.statusCode)||200;
  if(status>=300||!b||!Array.isArray(b.results)){ st.errors++; const r='Blitz employee-finder HTTP '+status+' '+JSON.stringify(b).slice(0,120); if(!st.firstError) st.firstError=r; st.failReasons.push(r); return; }
  const list=people[req.domain]||(people[req.domain]=[]);
  for(const p of b.results){
    st.returned++;
    if(list.length>=req.cap) continue;
    const exps=Array.isArray(p.experiences)?p.experiences:[];
    const here=exps.find(e=>e&&e.job_is_current&&(norm(e.company_domain)===req.domain||String(e.company_linkedin_url||'').replace(/\/+$/,'')===req.companyLinkedin.replace(/\/+$/,'')))||exps.find(e=>e&&e.job_is_current)||exps[0]||{};
    const name=String(p.full_name||((String(p.first_name||'')+' '+String(p.last_name||'')).trim())).trim();
    if(!name) continue;
    list.push({ source:'Blitz', sourceId:String(p.linkedin_id||p.id||''), name:name, title:String(here.job_title||p.headline||'').trim(), seniority:'', department:'', email:'', linkedin:String(p.linkedin_url||'').trim(), phone:'' });
    st.kept++;
  }
});
let status='ok', reason='';
const attempted=st.resolveCalled+st.called;
if(st.noKey&&!st.kept&&!st.errors){ status='skipped'; reason='no credential on the Blitz nodes'; }
else if(attempted&&st.errors>=attempted&&!st.kept){ status='error'; reason=st.firstError; }
else if(!attempted){ status='skipped'; reason='nothing to ask'; }
return [{ json:{ provider:'Blitz', status, reason, stats:st, people } }];
