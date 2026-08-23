// Route Rows: one enroll per row of the "Email" view, on the Deploy View to Campaign doctrine.
//
// The view's visible columns are the contract. Every visible column that is not a machine field,
// a never-block field or an identity field is a variable: sent to PlusVibe as a custom_variable
// under its snake_case name, and REQUIRED, a row missing it is skipped with "missing <column>".
// Hide a column in the view and it is neither sent nor required. Nothing here is a list of what
// to send. State / City / Country travel as PlusVibe's own lead fields when visible and filled.
//
// Identity, hard: Final Email, verified (Status = done), first_name, Company (or company_clean).
// Target: Email Campaign, a PlusVibe campaign id. A row already stamped Email Routed At is skipped:
// the view shows the whole channel, history included; the stamp is what says "done".
const MACHINE=new Set(['Status','MV','MV P0','MV P1','MV P2','MV P3','BB','P1','P2','P3','P1 (Trykitt)','P2 (LeadMagic)','P3 (Prospeo)','Source','Email Source','Contact Source','Contact Key','Run ID','Build Date','Created','Seniority Rank','segment','query_name','ingested_at','RankInCompany','Co Rank','Campaign Segment','reloaded_patch','manually_approved','public_emails_clean','Email','Domain','Campaigns','Campaigns (old text)','Messages Sent','Last Contacted','Campaign Status','Bounce Reason','Synced At','Deploy Error','Name','Valid','Intent Status','LinkedIn Campaign','Email Campaign','LinkedIn Routed At','Email Routed At','Target Campaign','routed_at','Enroll Confirmed','Enroll Error','Event Type','Final Email','company_clean','First Hire']);
// Never-block: sent when filled, never skip a row when empty. The ClayRoots build fields plus the
// intent convention (contact, job, company, signal fields the intent machine writes, see
// n8n/INTENT-PLAYS.md). A visible column OUTSIDE this set is a required variable: empty = row skipped.
const IGNORE=new Set(['last_name','Title','Social','Phone','MX Provider','MX provider','MX','LinkedIn URL','City','State','State Full','Country','Zip','Street',
  'Seniority','Department','Job ID','Job Title','Job Link','Job Posted','Job Description','Job Seniority','Job Function','Job Employment Type','Job Industries','Job Applicants','Job Salary','Job Poster Name','Job Poster Title','Job Poster LinkedIn',
  'Existing In Role','ICP Reason','Description','Industry Groups','Employees','Revenue Range','Score','Keywords','Company Status','Start Date','Company City','Company State','Phones','Public Emails','Social URLs','Redirect Domain','Email Pattern','Signal Detail','detected_at']);
// Any column whose name starts with 'Job ' is convention too (Operator ruling 2026-08-23).
const neverBlock=(col)=>IGNORE.has(col)||/^job\s/i.test(String(col));
const IDENTITY=new Set(['first_name','Company']);
const snake=k=>String(k).replace(/[^a-zA-Z0-9]+/g,'_').replace(/^_+|_+$/g,'').toLowerCase();
const val=v=>{ if(v===null||v===undefined) return ''; if(typeof v==='string') return v.trim(); if(typeof v==='number'||typeof v==='boolean') return String(v); if(Array.isArray(v)) return v.filter(x=>typeof x==='string'||typeof x==='number').join(', '); if(typeof v==='object'&&typeof v.value==='string') return v.value.trim(); if(typeof v==='object'&&typeof v.name==='string') return v.name; return ''; };
const emailRe=/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const out=[];
for(const it of $input.all()){
  const p=it.json||{};
  if(!p.recordId) continue;
  const f=p.row||{};
  const email=val(f['Final Email']);
  const base={ recordId:p.recordId, baseId:p.baseId, tableId:p.tableId, clientRecId:p.clientRecId, clientName:p.clientName, name:val(f['Name'])||email };
  const fail=(reason)=>out.push({ json: Object.assign({ action:'failed_precheck', reason },base) });
  if(val(f['Email Routed At'])) continue;                           // already done on this channel
  const campaignId=val(f['Email Campaign']);
  if(!campaignId||/^https?:\/\//i.test(campaignId)){ fail('Email Campaign is not a PlusVibe campaign id'); continue; }
  if(!p.pvWorkspace){ fail('Client row has no PlusVibe Workspace ID'); continue; }
  if(!email){ out.push({ json: Object.assign({ action:'no_email' },base) }); continue; }
  if(!emailRe.test(email)){ fail('invalid email syntax'); continue; }
  if(val(f['Status'])!=='done'){ fail('email not verified (Status is not done)'); continue; }
  const fn=val(f['first_name']); if(!fn){ fail('missing first_name'); continue; }
  const comp=val(f['company_clean'])||val(f['Company']); if(!comp){ fail('missing Company'); continue; }
  const otherDone=!val(f['LinkedIn Campaign'])||!!val(f['LinkedIn Routed At']);
  const custom={}; const missing=[];
  const visible=Array.isArray(p.visible)?p.visible:[];
  for(const col of visible){
    if(MACHINE.has(col)||neverBlock(col)||IDENTITY.has(col)) continue;
    const v=val(f[col]);
    if(v) custom[snake(col)]=v.length>2000?v.slice(0,2000):v; else missing.push(col);
  }
  if(missing.length){ fail('missing '+missing.join(', ').slice(0,140)); continue; }
  const lead={ email, first_name:fn, last_name:val(f['last_name']), company_name:comp };
  const core={ state:val(f['State Full'])||val(f['State']), city:val(f['City']), country:val(f['Country']), job_title:val(f['Title']) };
  for(const k of Object.keys(core)){ if(core[k]) lead[k]=core[k]; }
  const soc=val(f['LinkedIn URL'])||val(f['Social']); if(/^https?:\/\//i.test(soc)) lead.linkedin_person_url=soc;
  // Never-block columns ride along when visible and filled, never skip a row when empty.
  for(const col of visible){ if(!neverBlock(col)||['LinkedIn URL','Social','last_name','Title','City','State','State Full','Country'].includes(col)) continue; const v=val(f[col]); if(v) custom[snake(col)]=v; }
  if(Object.keys(custom).length) lead.custom_variables=custom;
  const pv_body={ workspace_id:p.pvWorkspace, campaign_id:campaignId, skip_if_in_workspace:false, is_overwrite:true, leads:[lead] };
  out.push({ json: Object.assign({ action:'enroll', otherDone, pv_body },base) });
}
if(!out.length) return [{ json: { _empty:true } }];
return out;
