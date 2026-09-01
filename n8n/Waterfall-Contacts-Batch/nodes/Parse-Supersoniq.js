// Parse Supersoniq: companies/enrich responses -> people per domain (Format Batch's parse).
// Contacts at domains we did not send are dropped; an email whose domain is neither the
// company domain nor a subdomain of it is blanked, the person kept. Their LinkedIn URLs
// never route to LinkedIn (the name-match fence lives on the table). Never throws on a
// failed response: the failure rides in the counters and the parent decides.
const plan=$('Plan Batch').first().json;
const byDomain={}; for(const c of plan.plan) byDomain[c.domain]=c;
let reqs=[]; try{ reqs=$('SQ Requests').all().map(i=>i.json); }catch(e){}
let items=[]; try{ items=$('SQ Enrich').all(); }catch(e){}
const people={}; const st={ called:0, returned:0, kept:0, credits:0, errors:0, firstError:'', failReasons:[], dropped:0, emailBlanked:0 };
const emailDomainOk=(email,domain)=>{ const at=String(email||'').lastIndexOf('@'); if(at<0) return false; const ed=String(email).slice(at+1).toLowerCase().trim(); return ed===domain||ed.endsWith('.'+domain); };
items.forEach((it,i)=>{
  const req=reqs[i]; if(!req) return;
  st.called++;
  const resp=it.json||{};
  if(!Array.isArray(resp.results)){ st.errors++; const r='Supersoniq: '+JSON.stringify(resp).slice(0,200); if(!st.firstError) st.firstError=r; st.failReasons.push(r); return; }
  const cr=resp.credits_used!=null?resp.credits_used:(resp.credits!=null?resp.credits:((resp.usage&&resp.usage.credits_used)||0)); st.credits+=Number(cr)||0;
  const sent=new Set(req.domains);
  for(const r of resp.results){
    const contacts=Array.isArray(r.contacts)?r.contacts:[];
    for(const ct of contacts){
      st.returned++;
      const domain=String(ct.company_domain||'').trim().toLowerCase();
      const c=byDomain[domain];
      if(!domain||!sent.has(domain)||!c){ st.dropped++; continue; }
      const list=people[domain]||(people[domain]=[]);
      if(list.length>=c.cap) continue;
      const full=((String(ct.first_name||'')+' '+String(ct.last_name||'')).trim())||String(ct.full_name||'');
      let email=String(ct.email||'').trim();
      if(email&&!emailDomainOk(email,domain)){ email=''; st.emailBlanked++; }
      list.push({ source:'Supersoniq', sourceId:String(ct.contact_id||ct.id||''), name:full, title:String(ct.job_title||'').trim(), seniority:String(ct.seniority||''), department:String(ct.function||''), email:email, linkedin:String(ct.linkedin_url||ct.linkedin||'').trim(), phone:'', state:'' });
      st.kept++;
    }
  }
});
return [{ json: { people: people, stats: st } }];
