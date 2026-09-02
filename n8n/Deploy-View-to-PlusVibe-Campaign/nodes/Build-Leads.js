const sd=$getWorkflowStaticData('global'); const dk='deploy_'+$execution.id; const D=sd[dk];
if(D.abort){ return [{json:{ready:false, abort:true}}]; }
const rowsArr=D.viewRows||[];
D.rowsTotal=rowsArr.length;
if(!rowsArr.length){ D.abort='view empty or not found'; D.errors.push('view empty or not found: "'+(D.view||'')+'"; nothing was sent'); return [{json:{ready:false, abort:true}}]; }
const dnc={};
if(D.dncTableId){
  try{
    for(const it of $('Read DNC').all()){
      const j=it.json||{};
      const recs=Array.isArray(j.records)?j.records:[];
      for(const r of recs){ const d=String((r.fields||{})['Domain']||'').toLowerCase().trim(); if(d) dnc[d]=1; }
    }
  }catch(e){}
}
const plan=D.plan||{varCols:[]};
const requiredCore=D.requiredCore||[];
const needFirstName=D.needFirstName!==false;
const emailRe=/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
// The one reader for every lead field. A register-shaped People table carries the company
// facts (Domain, Company, Country, State, City, Employees, Industry Groups, MX Provider, Tag,
// Signals, Signal At) as lookups through the Companies link, so Airtable returns arrays
// (["California"]); legacy tables carry plain text. An array yields its first element, an
// object its value or name, never "[object Object]" and never a joined list (ruling 2026-09-02).
const val=v=>{ if(v===null||v===undefined) return ''; if(Array.isArray(v)) return v.length?val(v[0]):''; if(typeof v==='string') return v.trim(); if(typeof v==='number'||typeof v==='boolean') return String(v); if(typeof v==='object'){ if(typeof v.value==='string') return v.value.trim(); if(typeof v.name==='string') return v.name.trim(); } return ''; };
// A usable first name starts with a letter and has at least two letters, in any language.
const NAME_OK=(s)=>{ const v=String(s||'').trim(); if(!v) return false; if(v.indexOf('�')>=0) return false; if(!/^\p{L}/u.test(v)) return false; return (v.match(/\p{L}/gu)||[]).length>=2; };
D.rows={}; D.emailToRow={}; D.varMisses={};
const leads=[];
for(const r of rowsArr){
  const f=r.fields||{};
  const email=String(f['Final Email']||'').trim();
  const rec={email:email.toLowerCase(), skip:null};
  D.rows[r.id]=rec;
  if(!email){ rec.skip='missing Final Email'; continue; }
  if(!emailRe.test(email)){ rec.skip='invalid email syntax'; continue; }
  // Domain and Company are lookups through the Companies link on a register-shaped People table;
  // val() takes the first value (ruling 2026-09-02). The email's domain is the fallback.
  const dom=(val(f['Domain'])||email.split('@')[1]||'').toLowerCase().trim();
  if(dom&&dnc[dom]){ rec.skip='DNC: '+dom; continue; }
  // The first name blocks only when the view shows it (D.needFirstName). On a
  // company-inbox list it is absent by design: send the row, just without a name.
  const fnRaw=val(f['first_name']);
  const fnHe=val(f['first_name_he']);
  if(needFirstName){
    if(!fnRaw&&!fnHe){ rec.skip='missing first name'; continue; }
    if(!NAME_OK(fnRaw)&&!NAME_OK(fnHe)){ rec.skip='unusable first name: '+String(fnRaw||fnHe).slice(0,40); continue; }
  }
  const fn=NAME_OK(fnRaw)?fnRaw:'';
  const comp=val(f['company_clean'])||val(f['Company']);
  if(!comp){ rec.skip='missing company name'; continue; }
  // Visible standard fields must be filled too.
  let coreMiss='';
  for(const c of requiredCore){ if(!val(f[c])){ coreMiss=c; break; } }
  if(coreMiss){ D.varMisses[coreMiss]=(D.varMisses[coreMiss]||0)+1; rec.skip='missing '+coreMiss; continue; }
  const lead={email:email};
  // State carries the full state name (Clean Fields writes it there); State Full is never read.
  const core={first_name:fn, last_name:val(f['last_name']), company_name:comp, state:val(f['State']), city:val(f['City']), country:val(f['Country']), job_title:val(f['Title'])};
  // The LinkedIn URL comes from the one column Plan Variables resolved: LinkedIn URL, else legacy Social.
  const soc=D.linkedinCol?val(f[D.linkedinCol]):'';
  if(/^https?:\/\//i.test(soc)) core.linkedin_person_url=soc;
  for(const k of Object.keys(core)){ if(core[k]) lead[k]=core[k]; }
  const cv={}; const missVars=[];
  for(const col of plan.varCols){ const v=val(f[col.name]); if(v) cv[col.key]=v.slice(0,2000); else missVars.push(col.name); }
  if(missVars.length){ for(const m of missVars){ D.varMisses[m]=(D.varMisses[m]||0)+1; } rec.skip='missing '+missVars.join(', ').slice(0,120); continue; }
  // Convention (never-block) columns ride along when visible and filled, never skip a row.
  for(const col of (plan.rideCols||[])){ const v=val(f[col.name]); if(v&&cv[col.key]===undefined) cv[col.key]=v.slice(0,2000); }
  if(Object.keys(cv).length) lead.custom_variables=cv;
  // Existing Campaigns links, kept so the stamp appends and never replaces.
  rec.camps=Array.isArray(f['Campaigns'])?f['Campaigns']:[];
  // The stamp-gate (Operator 2026-08-28): already linked to this campaign's mirror row =
  // already enrolled here once; never re-sent, whatever the sequencer's dedupe would say.
  if(D.stampMirrorRid&&rec.camps.indexOf(D.stampMirrorRid)>=0){ rec.skip='already in campaign (Campaigns stamp)'; continue; }
  // Max Rows: the launch row's cap on what this run may enrol, blank on the launch row = no cap.
  // Applied last, so the cap counts only rows that would really have been sent; the surplus is a
  // named skip, never a silent drop, and the view offers it again on the next run.
  if(D.maxRows&&leads.length>=D.maxRows){ rec.skip='over the run cap of '+D.maxRows+' rows'; continue; }
  D.emailToRow[email.toLowerCase()]=r.id;
  leads.push(lead);
}
D.viewRows=null;
const chunks=[];
for(let i=0;i<leads.length;i+=200) chunks.push(leads.slice(i,i+200));
D.send={queue:chunks, idx:0, attempts:0};
const flagMap={'Standard':{skip_lead_in_active_pause_camp:true},'Strict':{skip_if_in_workspace:true},'Active-only':{skip_lead_for_active_only_camp:true},'None':{}};
D.flags=Object.assign({is_overwrite:true}, flagMap[D.dedupe]||flagMap['Strict']);
if(!chunks.length) return [{json:{ready:false, abort:false}}];
return [{json:{ready:true, abort:false, body:Object.assign({workspace_id:D.ws, campaign_id:D.target, leads:chunks[0]}, D.flags), wait:0}}];
