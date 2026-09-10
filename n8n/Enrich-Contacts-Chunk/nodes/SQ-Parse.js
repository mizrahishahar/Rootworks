// SQ Parse: companies/enrich answers (aligned to SQ Requests by index; the node never errors, a
// failure is the body) -> people per domain in the shared provider contract (see GL Parse). A
// contact at a domain we did not send is dropped; an email whose domain is neither the company
// domain nor a subdomain of it is blanked, the person kept. Out of credits is a skip, never an
// error: the caller carries on with the other providers. Never throws.
// n8n hands a node failure over as {error}: a plain string ("Credentials not found") or an object with message and description. Read both shapes.
const errMsg=(e)=>{ if(!e) return 'call failed'; if(typeof e==='string') return e; return String((e.message||'')+' '+(e.description||'')).trim()||'call failed'; };
const inp=$('SQ Requests').first().json||{};
const st={ called:0, returned:0, kept:0, credits:0, errors:0, firstError:'', failReasons:[], dropped:0, emailBlanked:0, gate:inp.gate||null };
const people={};
if(inp._none){ return [{ json:{ provider:'Supersoniq', status:'skipped', reason:'nothing to ask', stats:st, people:{} } }]; }
let reqs=[]; try{ reqs=$('SQ Requests').all().map(i=>i.json||{}); }catch(e){}
let items=[]; try{ items=$('SQ Enrich').all(); }catch(e){}
const emailDomainOk=(email,domain)=>{ const at=String(email||'').lastIndexOf('@'); if(at<0) return false; const ed=String(email).slice(at+1).toLowerCase().trim(); return ed===domain||ed.endsWith('.'+domain); };
let noKey=false, noCredits=false;
items.forEach((it,i)=>{
  const req=reqs[i]; if(!req) return;
  st.called++;
  const resp=it.json||{};
  if(resp.error&&resp.results===undefined&&(typeof resp.error==='object'||typeof resp.error==='string')){
    const msg=errMsg(resp.error);
    if(/credential/i.test(msg)){ noKey=true; return; }
    st.errors++; const r='Supersoniq: '+msg.slice(0,160); if(!st.firstError) st.firstError=r; st.failReasons.push(r); return;
  }
  if(!Array.isArray(resp.results)){
    const txt=JSON.stringify(resp).slice(0,200);
    if(/credit|balance|insufficient/i.test(txt)){ noCredits=true; const r='Supersoniq: '+txt; if(!st.firstError) st.firstError=r; st.failReasons.push(r); return; }
    if(/authentication|unauthori|api key/i.test(txt)){ noKey=true; return; }
    st.errors++; const r='Supersoniq: '+txt; if(!st.firstError) st.firstError=r; st.failReasons.push(r); return;
  }
  const cr=resp.credits_used!=null?resp.credits_used:(resp.credits!=null?resp.credits:((resp.usage&&resp.usage.credits_used)||0)); st.credits+=Number(cr)||0;
  const sent=new Set(req.domains);
  for(const r of resp.results){
    const contacts=Array.isArray(r.contacts)?r.contacts:[];
    for(const ct of contacts){
      st.returned++;
      const domain=String(ct.company_domain||'').trim().toLowerCase();
      if(!domain||!sent.has(domain)){ st.dropped++; continue; }
      const list=people[domain]||(people[domain]=[]);
      if(list.length>=req.cap) continue;
      const full=((String(ct.first_name||'')+' '+String(ct.last_name||'')).trim())||String(ct.full_name||'');
      if(!full) continue;
      let email=String(ct.email||'').trim().toLowerCase();
      if(email&&!emailDomainOk(email,domain)){ email=''; st.emailBlanked++; }
      list.push({ source:'Supersoniq', sourceId:String(ct.contact_id||ct.id||''), name:full, title:String(ct.job_title||'').trim(), seniority:String(ct.seniority||''), department:String(ct.function||''), email:email, linkedin:String(ct.linkedin_url||ct.linkedin||'').trim(), phone:'' });
      st.kept++;
    }
  }
});
let status='ok', reason='';
if(noKey&&!st.kept&&!st.errors){ status='skipped'; reason='no credential on the Supersoniq node'; }
else if(noCredits&&!st.kept){ status='skipped'; reason='out of credits'; }
else if(st.errors&&items.length&&st.errors>=items.length&&!st.kept){ status='error'; reason=st.firstError; }
return [{ json:{ provider:'Supersoniq', status, reason, stats:st, people } }];
