// QE Pick: the roster answers (aligned to QE Companies by index) -> one email-search request per
// person, up to the cap per company, people with an email on file first. The roster is free; the
// search costs one credit only on a hit. Everyone picked is inserted, email or not: a person the
// roster named is a person, the email is the email Rootflow's problem. Errors ride in _stats.
// n8n hands a node failure over as {error}: a plain string ("Credentials not found") or an object with message and description. Read both shapes.
const errMsg=(e)=>{ if(!e) return 'call failed'; if(typeof e==='string') return e; return String((e.message||'')+' '+(e.description||'')).trim()||'call failed'; };
const reqs=$('QE Companies').all().map(i=>i.json||{});
let answers=[]; try{ answers=$('QE Roster').all(); }catch(e){}
const st={ rosterCalled:0, rosterRows:0, errors:0, noKey:0, firstError:'', failReasons:[] };
const out=[];
const na=(v)=>{ const s=String(v==null?'':v).trim(); return (s===''||s==='N/A')?'':s; };
answers.forEach((it,i)=>{
  const req=reqs[i]; if(!req||req._none) return;
  st.rosterCalled++;
  const j=it.json||{};
  if(j.error&&j.body===undefined&&j.data===undefined){
    const msg=errMsg(j.error);
    if(/credential/i.test(msg)){ st.noKey++; return; }
    st.errors++; const r='QuickEnrich contact-finder: '+msg.slice(0,160); if(!st.firstError) st.firstError=r; st.failReasons.push(r); return;
  }
  const b=(j.body!==undefined)?j.body:j;
  const status=Number(j.statusCode)||200;
  if(status>=300||!b||typeof b!=='object'||!Array.isArray(b.data)){ st.errors++; const r='QuickEnrich contact-finder HTTP '+status+' '+JSON.stringify(b).slice(0,120); if(!st.firstError) st.firstError=r; st.failReasons.push(r); return; }
  const rows=b.data.slice().sort((a,c)=>(c.has_email?1:0)-(a.has_email?1:0));
  st.rosterRows+=rows.length;
  let n=0;
  for(const p of rows){
    if(n>=req.cap) break;
    const first=na(p.first_name), last=na(p.last_name);
    if(!first) continue;
    n++;
    // The search URL carries only the parameters that have a value: an empty linkedin_url next to
    // the name + domain trio is not a documented shape.
    // A roster LinkedIn value that is not a real linkedin.com/in/ address is not sent (QuickEnrich answers
    // 422 and the search is lost); the name + domain search runs instead (run 22643, 12 such rows).
    const liRaw=na(p.employee_linkedin); const liOk=/^https?:\/\/([a-z0-9-]+\.)?linkedin\.com\/in\/[^\/?#\s]+/i.test(liRaw)?liRaw:'';
    const q={ linkedin_url:liOk, company_url:req.domain, first_name:first, last_name:last };
    const qs=Object.keys(q).filter(k=>q[k]).map(k=>k+'='+encodeURIComponent(q[k])).join('&');
    out.push({ json:{ domain:req.domain, name:(first+' '+last).trim(), title:na(p.title), linkedin:liOk, hasEmail:!!p.has_email, hasPhone:!!p.has_phone,
      query:q, url:'https://app.quickenrich.io/api/employees/search?'+qs } });
  }
});
if(!out.length) return [{ json:{ _none:true, _stats:st } }];
out[0].json._stats=st;
return out;
