// Route Rows: one enroll per row of the "LinkedIn" view, on the Deploy View to Campaign doctrine.
//
// The view's visible columns are the contract. Every visible column that is not a machine field,
// a never-block field or an identity field is a variable: sent to Alta as extraInfoData under its
// snake_case name, and REQUIRED, a row missing it is skipped with "missing <column>". Hide a
// column in the view and it is neither sent nor required. Nothing here is a list of what to send.
//
// Identity, hard: LinkedIn URL, first_name, Company (or company_clean). Target: LinkedIn Campaign,
// a pull-in URL. A row already stamped LinkedIn Routed At is skipped: the view shows the whole
// channel, history included; the stamp is what says "done".
const MACHINE=new Set(['Status','MV','MV P0','MV P1','MV P2','MV P3','BB','P1','P2','P3','P1 (Trykitt)','P2 (LeadMagic)','P3 (Prospeo)','Source','Email Source','Contact Source','Contact Key','Run ID','Build Date','Created','Seniority Rank','segment','query_name','ingested_at','RankInCompany','Co Rank','Campaign Segment','reloaded_patch','manually_approved','public_emails_clean','Email','Domain','Campaigns','Campaigns (old text)','Messages Sent','Last Contacted','Campaign Status','Bounce Reason','Synced At','Deploy Error','Name','Valid','Intent Status','LinkedIn Campaign','Email Campaign','LinkedIn Routed At','Email Routed At','LinkedIn Verified At','Target Campaign','routed_at','Enroll Confirmed','Enroll Error','Event Type','Final Email','company_clean','First Hire']);
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
const out=[];
for(const it of $input.all()){
  const p=it.json||{};
  if(!p.recordId) continue;
  const f=p.row||{};
  const base={ recordId:p.recordId, baseId:p.baseId, tableId:p.tableId, clientRecId:p.clientRecId, clientName:p.clientName, name:val(f['Name'])||val(f['LinkedIn URL']) };
  const fail=(reason)=>out.push({ json: Object.assign({ action:'failed_precheck', reason },base) });
  if(val(f['LinkedIn Routed At'])) continue;
  // FAILED stays out unless it is the spacing retry; NO EMAIL only blocks the email channel.
  if(val(f['Intent Status'])==='FAILED'&&!/spacing/i.test(val(f['Enroll Error']))) continue;                       // already done on this channel
  const url=val(f['LinkedIn Campaign']);
  if(!/^https?:\/\//i.test(url)){ fail('LinkedIn Campaign is not a valid URL'); continue; }
  const linkedinUrl=val(f['LinkedIn URL']);
  if(!/^https?:\/\//i.test(linkedinUrl)){ fail('missing LinkedIn URL'); continue; }
  const fn=val(f['first_name']); if(!fn){ fail('missing first_name'); continue; }
  const comp=val(f['company_clean'])||val(f['Company']); if(!comp){ fail('missing Company'); continue; }
  const otherDone=!val(f['Email Campaign'])||!!val(f['Email Routed At']);
  const extra={}; const missing=[];
  const visible=Array.isArray(p.visible)?p.visible:[];
  for(const col of visible){
    if(MACHINE.has(col)||neverBlock(col)||IDENTITY.has(col)) continue;
    const v=val(f[col]);
    if(v) extra[snake(col)]=v.length>4000?v.slice(0,4000):v; else missing.push(col);
  }
  if(missing.length){ fail('missing '+missing.join(', ').slice(0,140)); continue; }
  // Never-block columns ride along when visible and filled, never skip a row when empty.
  for(const col of visible){ if(!neverBlock(col)||col==='LinkedIn URL'||col==='last_name') continue; const v=val(f[col]); if(v) extra[snake(col)]=v; }
  const dom=val(f['Domain']);
  const body={ firstName:fn, lastName:val(f['last_name']), company:comp, linkedinUrl, extraInfoData:extra };
  if(dom) body.companyWebsite=/^https?:\/\//i.test(dom)?dom:'https://'+dom;
  const email=val(f['Final Email']); if(email) body.email=email;
  out.push({ json: Object.assign({ action:'enroll', otherDone, campaign_url:url, enroll_body:body },base) });
}
if(!out.length) return [{ json: { _empty:true } }];
return out;
