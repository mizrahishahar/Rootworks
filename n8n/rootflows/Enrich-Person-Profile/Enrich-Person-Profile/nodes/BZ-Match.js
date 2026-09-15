// BZ Match: the email-to-person answers (aligned to BZ Requests by index) -> a profile per person
// found, in the same eleven columns Enrich Contacts writes from Blitz: Headline, About, Role
// Description and Role Start Date from the current experience, Person City and Person Country from
// the location, Education and Skills joined, Prior Employer and Prior Title from the newest past
// experience. An answer is the person by construction (Blitz resolved the email we hold). Never
// throws. One item out: { profiles, stats }.
const errMsg=(e)=>{ if(!e) return 'call failed'; if(typeof e==='string') return e; return String((e.message||'')+' '+(e.description||'')).trim()||'call failed'; };
const first=$('BZ Requests').first().json||{};
const st=Object.assign({ candidates:0, noEmail:0, capped:0, cap:0, askedBefore:0 }, first._stats||{}, { called:0, found:0, notFound:0, errors:0, noCredential:0, firstError:'', failReasons:[] });
const profiles={};
if(first._none) return [{ json:{ profiles, stats:st } }];
const asks=$('BZ Requests').all().map(i=>i.json||{}).filter(j=>!j._none);
let answers=[]; try{ answers=$('BZ Email To Person').all(); }catch(e){}
const s=(v)=>String(v==null?'':v).trim();
const clip=(v,n)=>{ const t=s(v); return t.length>n?t.slice(0,n):t; };
const isoDate=(v)=>{ const m=s(v).match(/^(\d{4}-\d{2}-\d{2})/); return m?m[1]:''; };
const slugName=(u)=>{ const m=s(u).toLowerCase().match(/linkedin\.com\/company\/([^\/?#]+)/); return m?m[1].replace(/-+/g,' ').replace(/\b\w/g,ch=>ch.toUpperCase()):''; };
const joinList=(arr,sep)=>(Array.isArray(arr)?arr:[]).map(x=>typeof x==='string'?x:(x&&typeof x==='object'?s(x.name||x.language||x.title):s(x))).map(x=>x.trim()).filter(Boolean).join(sep);
const education=(arr)=>(Array.isArray(arr)?arr:[]).slice().sort((a,b)=>s((b||{}).end_date||(b||{}).start_date).localeCompare(s((a||{}).end_date||(a||{}).start_date))).map(e=>[s((e||{}).degree),s((e||{}).field_of_study),s((e||{}).school_name)].filter(Boolean).join(', ')).filter(Boolean).join('; ');
answers.forEach((it,i)=>{
  const ask=asks[i]; if(!ask) return;
  st.called++;
  const j=it.json||{};
  if(j.error&&j.body===undefined&&j.found===undefined&&j.person===undefined){
    const msg=errMsg(j.error);
    if(/credential/i.test(msg)){ st.noCredential++; return; }
    st.errors++; const r='Blitz email-to-person: '+msg.slice(0,160); if(!st.firstError) st.firstError=r; if(st.failReasons.length<10) st.failReasons.push(r); return;
  }
  const b=(j.body!==undefined)?j.body:j;
  const status=Number(j.statusCode)||200;
  if(status===404||b.found===false){ st.notFound++; return; }
  if(status>=300||!b||typeof b!=='object'){ st.errors++; const r='Blitz email-to-person HTTP '+status+' '+JSON.stringify(b).slice(0,120); if(!st.firstError) st.firstError=r; if(st.failReasons.length<10) st.failReasons.push(r); return; }
  const p=(b.person&&typeof b.person==='object')?b.person:b;
  const exps=(Array.isArray(p.experiences)?p.experiences:[]).filter(e=>e&&typeof e==='object');
  const here=exps.find(e=>e.job_is_current)||exps[0]||{};
  const past=exps.filter(e=>e!==here&&(e.job_is_current===false||e.job_end_date)).sort((a,c)=>s(c.job_end_date).localeCompare(s(a.job_end_date)));
  const prior=past[0]||{};
  const loc=(p.location&&typeof p.location==='object')?p.location:{};
  profiles[ask.id]={
    'Headline':clip(p.headline,500), 'About':clip(p.about_me,10000), 'Role Description':clip(here.job_description,10000), 'Role Start Date':isoDate(here.job_start_date),
    'Person City':clip(loc.city,120), 'Person Country':clip(loc.country_code,8).toUpperCase(),
    'Education':clip(education(p.education),2000), 'Skills':clip(joinList(p.skills,', '),2000), 'Languages':clip(joinList(p.languages,', '),500),
    'Prior Employer':clip(s(prior.company_name)||slugName(prior.company_linkedin_url),200), 'Prior Title':clip(prior.job_title,200), _by:'Blitz'
  };
  st.found++;
});
return [{ json:{ profiles, stats:st } }];
