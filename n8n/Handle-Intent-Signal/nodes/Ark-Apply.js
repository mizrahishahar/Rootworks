// Ark Apply: the identity verdict per contact, aligned by index to Ark Identity Prep.
//
// AI-Ark is the LinkedIn identity authority (Operator ruling 2026-08-25). Per contact:
//   verified      the hit's name matches and its CURRENT company domain is the row's domain:
//                 the row's LinkedIn URL becomes the profile's canonical URL, whatever any
//                 vendor said. Structured seniority/function feed the decision-maker gate.
//   left_company  name hit but current company elsewhere: stale signal, URL blanked, row kept.
//   no_match      AI-Ark finds nobody by that name at that domain: a ContaGen URL is kept
//                 (their URLs audited clean), a Supersoniq URL never survives; row kept.
//   error         the call failed: row passes through untouched (fail open on identity,
//                 the linkedin_name_match fence still stands behind us), counted in the log.
//
// Decision-maker gate on AI-Ark's structured data, never on title strings: an executive of any
// function passes (CEO/COO/founder/owner/president); below executive the function must be
// technical (engineering / IT / technology). A verified non-DM contact is not written at all,
// listed by name+seniority in the run log so the play can be tuned from real drops.
const parse=(b)=>{ if(typeof b!=='string') return b; try{ return JSON.parse(b); }catch(e){ return null; } };
const nameKey=(s)=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const EXEC=['c_suite','csuite','cxo','founder','co_founder','cofounder','owner','partner','president','chairman','executive'];
const LEAD=['vp','vice_president','head','director','manager','lead'];
const TECH=/engineer|technical|technolog|information|infrastructure|devops|platform|cloud|software|it\b/i;
const st={ checked:0, verified:0, url_replaced:0, left_company:0, no_match:0, ambiguous:0, errors:0, dm_dropped:0, dm_pass:0, dm_unknown:0, dropped:[], notes:[] };
const preps=$('Ark Identity Prep').all().map(i=>i.json);
const resp=$input.all();
const out=[];
for(let i=0;i<preps.length;i++){
  const j=Object.assign({}, preps[i]); delete j.arkBody;
  if(j._empty){ out.push({ json:j }); continue; }
  const r=(resp[i]&&resp[i].json)||{};
  const status=Number(r.statusCode)||0;
  const body=parse(r.body===undefined?r:r.body);
  st.checked++;
  const keepAsIs=(note)=>{ if(note) st.notes.push(note); if(j['Contact Source']==='Supersoniq') j['LinkedIn URL']=''; out.push({ json:j }); };
  if(!(status>=200&&status<300)||!body||typeof body!=='object'){ st.errors++; keepAsIs((j.Name||'?')+': ark error HTTP '+status); continue; }
  const hits=Array.isArray(body.content)?body.content:[];
  const want=nameKey(j.Name);
  const named=hits.filter(h=>h&&h.profile&&nameKey(h.profile.full_name)===want);
  const pool=named.length?named:hits;
  if(!pool.length){ st.no_match++; keepAsIs(); continue; }
  if(pool.length>1) st.ambiguous++;
  const rowLi=String(j['LinkedIn URL']||'').toLowerCase();
  const hit=pool.find(h=>rowLi&&h.link&&String(h.link.linkedin||'').toLowerCase()===rowLi)||pool[0];
  const curDomain=String(((hit.company||{}).link||{}).domain||'').toLowerCase().trim();
  const rowDomain=String(j.Domain||'').toLowerCase().trim();
  if(curDomain&&rowDomain&&curDomain!==rowDomain){ st.left_company++; j['LinkedIn URL']=''; st.notes.push((j.Name||'?')+': now at '+curDomain+', URL blanked'); out.push({ json:j }); continue; }
  const arkLi=String((hit.link||{}).linkedin||'').trim();
  if(arkLi&&arkLi.toLowerCase()!==rowLi){ st.url_replaced++; }
  if(arkLi){ j['LinkedIn URL']=arkLi; j['LinkedIn Verified At']=new Date().toISOString(); }   // the view fence admits verified URLs the name formula can't read (handle slugs)
  st.verified++;
  // Decision-maker gate on structured data.
  const dep=hit.department||{};
  const s=String(dep.seniority||'').toLowerCase();
  const fn=[].concat(dep.departments||[],dep.sub_departments||[],dep.functions||[]).join(' ').toLowerCase();
  if(!s){ st.dm_unknown++; out.push({ json:j }); continue; }                         // no verdict possible: title gate already passed
  const isExec=EXEC.some(x=>s.includes(x));
  const isLead=LEAD.some(x=>s.includes(x));
  const isTech=TECH.test(fn);
  if(isExec||(isLead&&isTech)){ st.dm_pass++; out.push({ json:j }); continue; }
  st.dm_dropped++; st.dropped.push((j.Name||'?')+' ('+(j.Title||'')+' · '+s+' · '+(fn||'no function')+')');
}
if(!out.filter(o=>!o.json._empty).length) return [{ json: { _empty:true, _arkStats:st } }];
const first=out.find(o=>!o.json._empty)||out[0];
first.json._arkStats=st;
return out;
