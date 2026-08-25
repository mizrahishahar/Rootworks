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
const val=v=>{ if(v===null||v===undefined) return ''; if(typeof v==='string') return v.trim(); if(typeof v==='number'||typeof v==='boolean') return String(v); if(Array.isArray(v)) return v.filter(x=>typeof x==='string'||typeof x==='number').join(', '); if(typeof v==='object'&&typeof v.value==='string') return v.value.trim(); return ''; };
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
  const dom=String(f['Domain']||email.split('@')[1]||'').toLowerCase().trim();
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
  const core={first_name:fn, last_name:val(f['last_name']), company_name:comp, state:val(f['State Full'])||val(f['State']), city:val(f['City']), country:val(f['Country']), job_title:val(f['Title'])};
  const soc=val(f['Social']);
  if(/^https?:\/\//i.test(soc)) core.linkedin_person_url=soc;
  for(const k of Object.keys(core)){ if(core[k]) lead[k]=core[k]; }
  const cv={}; const missVars=[];
  for(const col of plan.varCols){ const v=val(f[col.name]); if(v) cv[col.key]=v.slice(0,2000); else missVars.push(col.name); }
  if(missVars.length){ for(const m of missVars){ D.varMisses[m]=(D.varMisses[m]||0)+1; } rec.skip='missing '+missVars.join(', ').slice(0,120); continue; }
  if(Object.keys(cv).length) lead.custom_variables=cv;
  // Existing Campaigns links, kept so the stamp appends and never replaces.
  rec.camps=Array.isArray(f['Campaigns'])?f['Campaigns']:[];
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