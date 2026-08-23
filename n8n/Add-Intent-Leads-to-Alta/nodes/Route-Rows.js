// Route Rows: one enroll per row the LinkedIn view handed us. The view decides which rows go
// (Operator-owned filters, nothing in code); this node only refuses what cannot be enrolled and
// never enrolls a row already stamped for this channel, so a loose view cannot double-enroll.
//
// Sent on every add, the same names on every sequencer, only when the row carries a value:
// identity (first_name, last_name, company, company_website, email, linkedin_url) plus the
// standard variables in VARS. The campaign copy picks from them; nothing per play to configure.
const VARS={ title:'Title', seniority:'Seniority', department:'Department', job_title:'Job Title', job_link:'Job Link', job_posted:'Job Posted', job_description:'Job Description', job_applicants:'Job Applicants', job_salary:'Job Salary', existing_in_role:'Existing In Role', icp_reason:'ICP Reason', company_description:'Description', industry_groups:'Industry Groups', employees:'Employees', revenue_range:'Revenue Range', company_city:'Company City', company_state:'Company State', country:'Country', event_type:'Event Type', signal_detail:'Signal Detail', sourced_at:'detected_at' };
const val=(f,k)=>{ const v=f[k]; if(v===undefined||v===null) return ''; if(typeof v==='object') return Array.isArray(v)?v.join(', '):String(v.name||''); return String(v).trim(); };
const out=[];
for(const it of $input.all()){
  const p=it.json||{};
  if(!p.recordId) continue;
  const f=p.row||{};
  const url=val(f,'LinkedIn Campaign');
  const email=val(f,'Final Email');
  const linkedinUrl=val(f,'LinkedIn URL');
  const name=val(f,'Name')||email||linkedinUrl;
  const base={ recordId:p.recordId, baseId:p.baseId, tableId:p.tableId, clientRecId:p.clientRecId, clientName:p.clientName, name };
  if(val(f,'LinkedIn Routed At')) continue; // already stamped for this channel: the view is loose, not the row
  if(!/^https?:\/\//i.test(url)){ out.push({ json: Object.assign({ action:'failed_precheck', reason:'LinkedIn Campaign is not a valid URL' },base) }); continue; }
  if(!val(f,'first_name')||!val(f,'last_name')){ out.push({ json: Object.assign({ action:'failed_precheck', reason:'first_name / last_name missing' },base) }); continue; }
  if(!email&&!linkedinUrl){ out.push({ json: Object.assign({ action:'no_email' },base) }); continue; }
  const otherDone=!val(f,'Email Campaign')||!!val(f,'Email Routed At');
  const dom=val(f,'Domain');
  const extra={};
  for(const [k,col] of Object.entries(VARS)){ const v=val(f,col); if(v) extra[k]=v.length>4000?v.slice(0,4000):v; }
  const body={ firstName:val(f,'first_name'), lastName:val(f,'last_name'), company:val(f,'Company'), extraInfoData:extra };
  if(dom) body.companyWebsite=/^https?:\/\//i.test(dom)?dom:'https://'+dom;
  if(email) body.email=email;
  if(linkedinUrl) body.linkedinUrl=linkedinUrl;
  out.push({ json: Object.assign({ action:'enroll', otherDone, campaign_url:url, enroll_body:body },base) });
}
return out;
