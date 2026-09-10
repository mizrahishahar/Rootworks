// GL Parse: every page GetLeads answered -> people per domain, plus the provider verdict. The one
// item out is the provider contract every Enrich Contacts provider answers with:
//   { provider, status: ok | skipped | error, reason, stats:{called, returned, kept, credits, errors,
//     firstError, failReasons[]}, people:{ <domain>: [ {source, sourceId, name, title, seniority,
//     department, email, linkedin, phone} ] } }
// It never throws. A missing credential, an exhausted fair-use budget or a dead API are a status
// on this item and a line in the caller's log; the caller moves on to the next provider (ruled
// 2026-09-08: unlimited providers, nothing blocks on one of them).
//
// Rows are matched to the plan by the row's own company domain, never by call order: the node pages
// on next_offset, so one request can answer with several items and alignment by index is not
// safe. Column names in the REST answer are the catalog's raw names; the docs say display labels on
// MCP and CSV, raw names on JSON, so every field is read through a normalized-key lookup that
// accepts either spelling.
// n8n hands a node failure over as {error}: a plain string ("Credentials not found") or an object with message and description. Read both shapes.
const errMsg=(e)=>{ if(!e) return 'call failed'; if(typeof e==='string') return e; return String((e.message||'')+' '+(e.description||'')).trim()||'call failed'; };
const inp=$('GL Requests').first().json||{};
const plan=$('Chunk Trigger').first().json||{};
const byDomain={}; for(const c of (Array.isArray(plan.companies)?plan.companies:[])){ if(c&&c.domain) byDomain[String(c.domain).toLowerCase()]=c; }
const st={ called:0, returned:0, kept:0, credits:0, errors:0, firstError:'', failReasons:[], dropped:0, pages:0 };
const people={};
const norm=(d)=>String(d||'').trim().toLowerCase().replace(/^https?:\/\//,'').replace(/^www\./,'').replace(/\/.*$/,'');
const nk=(s)=>String(s).toLowerCase().replace(/[^a-z0-9]/g,'');
const pick=(row,cands)=>{ for(const c of cands){ const v=row[c]; if(v!==undefined&&v!==null&&String(v).trim()!==''&&String(v).trim()!=='N/A') return String(v).trim(); } return ''; };
const flat=(r)=>{ const o={}; for(const k of Object.keys(r||{})){ const v=r[k]; if(v&&typeof v==='object'&&!Array.isArray(v)){ for(const k2 of Object.keys(v)) o[nk(k2)]=v[k2]; } o[nk(k)]=v; } return o; };
let items=[];
if(inp._none){ return [{ json:{ provider:'GetLeads', status:'skipped', reason:'nothing to ask', stats:st, people:{} } }]; }
try{ items=$('GL Search').all(); }catch(e){ items=[]; }
let noKey=false, budget=false;
for(const it of items){
  const j=it.json||{};
  st.pages++;
  if(j.error&&j.contacts===undefined){
    const msg=errMsg(j.error);
    if(/credential/i.test(msg)){ noKey=true; continue; }
    if(/fair.?use|not enough credits|credits_exhausted|payment required|\b402\b/i.test(msg)){ budget=true; const r='GetLeads: '+msg.slice(0,160); if(!st.firstError) st.firstError=r; st.failReasons.push(r); continue; }
    st.errors++; const r='GetLeads: '+msg.slice(0,160); if(!st.firstError) st.firstError=r; st.failReasons.push(r); continue;
  }
  if(j.ok===false||(!Array.isArray(j.contacts)&&j.message)){
    const msg=String(j.message||j.code||'answer without contacts');
    if(/fair.?use|not enough credits|credits_exhausted/i.test(msg+' '+String(j.code||''))){ budget=true; const r='GetLeads: '+msg.slice(0,160); if(!st.firstError) st.firstError=r; st.failReasons.push(r); continue; }
    st.errors++; const r='GetLeads: '+msg.slice(0,160); if(!st.firstError) st.firstError=r; st.failReasons.push(r); continue;
  }
  if(!Array.isArray(j.contacts)){ st.errors++; const r='GetLeads: unreadable answer '+JSON.stringify(j).slice(0,120); if(!st.firstError) st.firstError=r; st.failReasons.push(r); continue; }
  st.credits+=Number(j.query_credits_used)||0;
  for(const raw of j.contacts){
    st.returned++;
    const r=flat(raw);
    const email=pick(r,['email','emailaddress','workemail']).toLowerCase();
    let d=norm(pick(r,['companydomain','domain','workemaildomain','emaildomain']));
    if(!d||!byDomain[d]){ const at=email.lastIndexOf('@'); const ed=at>-1?email.slice(at+1):''; if(ed&&byDomain[ed]) d=ed; }
    const c=byDomain[d];
    if(!c){ st.dropped++; continue; }
    const list=people[d]||(people[d]=[]);
    if(list.length>=(Number(c.cap)||50)) continue;
    const first=pick(r,['firstname']), last=pick(r,['lastname']);
    const name=pick(r,['contactfullname','fullname'])||((first+' '+last).trim());
    if(!name) continue;
    list.push({
      source:'GetLeads', sourceId:pick(r,['contactid','id','contactuuid','personid']),
      name:name, title:pick(r,['currentjobtitle','jobtitle','title']),
      seniority:pick(r,['senioritylevel','seniority','joblevel']), department:pick(r,['departmentfunction','jobfunction','function']),
      email:email, emailStatus:pick(r,['emailverificationstatus','emailstatus']),
      linkedin:pick(r,['contactlinkedinurl','linkedinurl','linkedin']), phone:pick(r,['cellphone','directofficephone','phone'])
    });
    st.kept++;
  }
}
try{ st.called=$('GL Requests').all().filter(i=>i.json&&!i.json._none).length; }catch(e){ st.called=st.pages; }
let status='ok', reason='';
if(noKey&&!st.kept&&!st.errors){ status='skipped'; reason='no credential on the GetLeads node'; }
else if(budget&&!st.kept){ status='skipped'; reason='fair-use budget exhausted'; }
else if(st.errors&&!st.kept&&items.length&&st.errors>=items.length){ status='error'; reason=st.firstError; }
if(budget&&st.kept) st.failReasons.push('GetLeads: fair-use budget hit mid-batch, later pages skipped');
return [{ json:{ provider:'GetLeads', status, reason, stats:st, people } }];
