// QE Parse: the email-search answers (aligned to QE Pick by index) -> people per domain in the
// shared provider contract (see GL Parse). A person whose search found nothing is still a person
// (name, title, LinkedIn from the roster), written without an email. Seniority and department are
// derived from the title by the caller's merge. Never throws.
// n8n hands a node failure over as {error}: a plain string ("Credentials not found") or an object with message and description. Read both shapes.
const errMsg=(e)=>{ if(!e) return 'call failed'; if(typeof e==='string') return e; return String((e.message||'')+' '+(e.description||'')).trim()||'call failed'; };
const st={ called:0, returned:0, kept:0, credits:0, errors:0, firstError:'', failReasons:[], rosterCalled:0, rosterRows:0, noKey:0, emails:0 };
const people={};
let first={}; try{ first=$('QE Pick').first().json||{}; }catch(e){}
const rs=first._stats||{};
for(const k of ['rosterCalled','rosterRows','noKey']) st[k]=Number(rs[k])||0;
st.errors+=Number(rs.errors)||0; if(rs.firstError&&!st.firstError) st.firstError=rs.firstError; for(const r of (rs.failReasons||[])) st.failReasons.push(r);
let picks=[]; try{ picks=$('QE Pick').all().map(i=>i.json||{}).filter(j=>!j._none); }catch(e){}
let answers=[]; try{ answers=$('QE Email').all(); }catch(e){}
const na=(v)=>{ const s=String(v==null?'':v).trim(); return (s===''||s==='N/A')?'':s; };
answers.forEach((it,i)=>{
  const p=picks[i]; if(!p) return;
  st.called++;
  const j=it.json||{};
  let email='', phone='', sourceId='';
  if(j.error&&j.body===undefined&&j.data===undefined){
    const msg=errMsg(j.error);
    if(/credential/i.test(msg)){ st.noKey++; return; }
    st.errors++; const r='QuickEnrich email search: '+msg.slice(0,160); if(!st.firstError) st.firstError=r; st.failReasons.push(r);
  } else {
    const b=(j.body!==undefined)?j.body:j;
    const status=Number(j.statusCode)||200;
    if(status>=300||!b||typeof b!=='object'){ st.errors++; const r='QuickEnrich email search HTTP '+status+' '+JSON.stringify(b).slice(0,120); if(!st.firstError) st.firstError=r; st.failReasons.push(r); }
    else { const d=(b.data&&!Array.isArray(b.data))?b.data:((Array.isArray(b.data)&&b.data[0])||{}); email=na(d.email).toLowerCase(); phone=na(d.employee_phone); if(email){ st.emails++; st.credits+=1; } }
  }
  const list=people[p.domain]||(people[p.domain]=[]);
  st.returned++;
  list.push({ source:'QuickEnrich', sourceId:sourceId, name:p.name, title:p.title, seniority:'', department:'', email:email, linkedin:p.linkedin, phone:phone });
  st.kept++;
});
let status='ok', reason='';
const attempted=st.rosterCalled+st.called;
if(st.noKey&&!st.kept&&!st.errors){ status='skipped'; reason='no credential on the QuickEnrich nodes'; }
else if(attempted&&st.errors>=attempted&&!st.kept){ status='error'; reason=st.firstError; }
else if(!attempted){ status='skipped'; reason='nothing to ask'; }
return [{ json:{ provider:'QuickEnrich', status, reason, stats:st, people } }];
