// GL Match: the search answers (aligned to GL Requests by index; the node hands a failure over as
// {error}) -> at most one profile per person. A returned row is the person only when it proves it:
// the same email, the same LinkedIn slug, or the same cleaned first and last name at the same
// domain. Anything else is a stranger and is dropped. The profile columns are read the way Enrich
// Contacts reads them (GetLeads answers raw column names on JSON and labels elsewhere, so every
// field is read through a normalized key). One item out: { profiles:{ <rowId>: extra }, stats }.
// Never throws.
const errMsg=(e)=>{ if(!e) return 'call failed'; if(typeof e==='string') return e; return String((e.message||'')+' '+(e.description||'')).trim()||'call failed'; };
const first=$('GL Requests').first().json||{};
const st=Object.assign({ people:0, byEmail:0, byLinkedin:0, byName:0, noKey:0 }, first._stats||{}, { called:0, returned:0, matched:0, strangers:0, errors:0, credits:0, firstError:'', failReasons:[], noCredential:0, budget:false });
const profiles={};
if(first._none) return [{ json:{ profiles, stats:st } }];
const asks=$('GL Requests').all().map(i=>i.json||{}).filter(j=>!j._none);
let answers=[]; try{ answers=$('GL Search').all(); }catch(e){}
const held={}; for(const i of $('Read Held').all()){ const j=i.json||{}; if(j.id) held[j.id]=j.fields||{}; }
const one=(v)=>String(Array.isArray(v)?(v[0]||''):(v==null?'':v)).trim();
const nk=(s)=>String(s).toLowerCase().replace(/[^a-z0-9]/g,'');
const pick=(row,cands)=>{ for(const c of cands){ const v=row[c]; if(v!==undefined&&v!==null&&String(v).trim()!==''&&String(v).trim()!=='N/A') return String(v).trim(); } return ''; };
const raw=(row,cands)=>{ for(const c of cands){ const v=row[c]; if(v!==undefined&&v!==null&&v!==''&&v!=='N/A') return v; } return null; };
const flat=(r)=>{ const o={}; for(const k of Object.keys(r||{})){ const v=r[k]; if(v&&typeof v==='object'&&!Array.isArray(v)){ for(const k2 of Object.keys(v)) o[nk(k2)]=v[k2]; } o[nk(k)]=v; } return o; };
const clip=(v,n)=>{ const t=String(v==null?'':v).trim(); return t.length>n?t.slice(0,n):t; };
// GetLeads writes the epoch (1970-01-01) where it has no date; anything before 1971 is no date.
const isoDate=(v)=>{ const m=String(v==null?'':v).trim().match(/^(\d{4}-\d{2}-\d{2})/); return (m&&Number(m[1].slice(0,4))>=1971)?m[1]:''; };
const parseVariant=(v)=>{ if(v==null) return []; if(typeof v==='string'){ const t=v.trim(); if(!t||t==='N/A') return []; if(/^[\[{]/.test(t)){ try{ v=JSON.parse(t); }catch(e){ return t.split(/[;|]\s*|,\s*/).map(x=>x.trim()).filter(Boolean); } } else return t.split(/[;|]\s*|,\s*/).map(x=>x.trim()).filter(Boolean); } if(Array.isArray(v)) return v; if(typeof v==='object') return [v]; return [String(v)]; };
const entry=(x,keys)=>{ if(x==null) return ''; if(typeof x!=='object') return String(x).trim(); const parts=[]; for(const k of keys){ const val=x[k]; if(val!=null&&String(val).trim()&&String(val).trim()!=='N/A') parts.push(String(val).trim()); } return parts.length?parts.join(', '):(x.name?String(x.name).trim():''); };
const joinVariant=(v,keys,sep)=>parseVariant(v).map(x=>entry(x,keys)).filter(Boolean).join(sep);
const cleanName=(s)=>String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z]/g,'');
const slugOf=(u)=>{ const m=String(u||'').toLowerCase().match(/linkedin\.com\/in\/([^\/?#]+)/); return m?m[1].replace(/\/+$/,''):''; };
const splitEmails=(s)=>one(s).split(/[,;\s]+/).map(e=>e.trim().toLowerCase()).filter(e=>e.indexOf('@')>0);
const norm=(d)=>one(d).toLowerCase().replace(/^https?:\/\//,'').replace(/^www\./,'').replace(/\/.*$/,'');
answers.forEach((it,i)=>{
  const ask=asks[i]; if(!ask) return;
  st.called++;
  const j=it.json||{};
  if(j.error&&j.contacts===undefined){
    const msg=errMsg(j.error);
    if(/credential/i.test(msg)){ st.noCredential++; return; }
    if(/fair.?use|not enough credits|credits_exhausted|payment required|\b402\b/i.test(msg)){ st.budget=true; }
    st.errors++; const r='GetLeads: '+msg.slice(0,160); if(!st.firstError) st.firstError=r; if(st.failReasons.length<10) st.failReasons.push(r); return;
  }
  if(!Array.isArray(j.contacts)){ st.errors++; const r='GetLeads: '+String(j.message||'unreadable answer').slice(0,160); if(!st.firstError) st.firstError=r; if(st.failReasons.length<10) st.failReasons.push(r); return; }
  st.credits+=Number(j.query_credits_used)||0;
  const f=held[ask.id]||{};
  const myEmails=new Set([one(f['Final Email']).toLowerCase()].concat(splitEmails(f.Email)).filter(Boolean));
  const mySlug=slugOf(f['LinkedIn URL']);
  const myFirst=cleanName(f.first_name), myLast=cleanName(f.last_name), myDomain=norm(f.Domain);
  for(const rawRow of j.contacts){
    st.returned++;
    const r=flat(rawRow);
    const email=pick(r,['email','emailaddress','workemail']).toLowerCase();
    const slug=slugOf(pick(r,['contactlinkedinurl','linkedinurl','linkedin']));
    const rFirst=cleanName(pick(r,['firstname'])), rLast=cleanName(pick(r,['lastname']));
    const rDomain=norm(pick(r,['companydomain','domain','workemaildomain','emaildomain']))||(email.indexOf('@')>0?email.slice(email.lastIndexOf('@')+1):'');
    const proof=(email&&myEmails.has(email))||(slug&&mySlug&&slug===mySlug)||(myFirst&&myLast&&rFirst===myFirst&&rLast===myLast&&myDomain&&(rDomain===myDomain||rDomain.endsWith('.'+myDomain)));
    if(!proof){ st.strangers++; continue; }
    if(profiles[ask.id]) continue;
    profiles[ask.id]={
      'Headline':clip(pick(r,['profileheadline','linkedinheadline','headline']),500),
      'About':clip(pick(r,['aboutme','persondescription','about']),10000),
      'Role Description':clip(pick(r,['currentroledescription','jobdescription']),10000),
      'Role Start Date':isoDate(pick(r,['currentrolestartdate','jobstartdate'])),
      'Person City':clip(pick(r,['workcity','joblocationcity']),120),
      'Person Country':clip(pick(r,['workcountrycode','joblocationcountrycode']),8).toUpperCase(),
      'Education':clip(joinVariant(raw(r,['education']),['degree','field_of_study','field','school_name','school'],'; '),2000),
      'Skills':clip(joinVariant(raw(r,['skills']),['name','skill'],', '),2000),
      'Languages':clip(joinVariant(raw(r,['languages']),['name','language'],', '),500),
      'Prior Employer':'', 'Prior Title':'', _by:'GetLeads'
    };
    st.matched++;
  }
});
return [{ json:{ profiles, stats:st } }];
