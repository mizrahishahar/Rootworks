// Route Rows: one enroll per row the Email view handed us. The view decides which rows go
// (Operator-owned filters, nothing in code); this node only refuses what cannot be enrolled and
// never enrolls a row already stamped for this channel, so a loose view cannot double-enroll.
//
// Sent on every add, the same names on every sequencer, only when the row carries a value:
// identity (email, first_name, last_name, company_name) plus the standard variables in VARS
// as PlusVibe custom_variables. The campaign copy picks from them; nothing per play to configure.
const VARS={ title:'Title', seniority:'Seniority', department:'Department', job_title:'Job Title', job_link:'Job Link', job_posted:'Job Posted', job_description:'Job Description', job_applicants:'Job Applicants', job_salary:'Job Salary', existing_in_role:'Existing In Role', icp_reason:'ICP Reason', company_description:'Description', industry_groups:'Industry Groups', employees:'Employees', revenue_range:'Revenue Range', company_city:'Company City', company_state:'Company State', country:'Country', event_type:'Event Type', signal_detail:'Signal Detail', sourced_at:'detected_at', linkedin_url:'LinkedIn URL', company_website:'Domain' };
const val=(f,k)=>{ const v=f[k]; if(v===undefined||v===null) return ''; if(typeof v==='object') return Array.isArray(v)?v.join(', '):String(v.name||''); return String(v).trim(); };
const out=[];
for(const it of $input.all()){
  const p=it.json||{};
  if(!p.recordId) continue;
  const f=p.row||{};
  const email=val(f,'Final Email');
  const campaignId=val(f,'Email Campaign');
  const name=val(f,'Name')||email;
  const base={ recordId:p.recordId, baseId:p.baseId, tableId:p.tableId, clientRecId:p.clientRecId, clientName:p.clientName, name };
  if(val(f,'Email Routed At')) continue; // already stamped for this channel: the view is loose, not the row
  if(!campaignId||/^https?:\/\//i.test(campaignId)){ out.push({ json: Object.assign({ action:'failed_precheck', reason:'Email Campaign is not a PlusVibe campaign id' },base) }); continue; }
  if(!p.pvWorkspace){ out.push({ json: Object.assign({ action:'failed_precheck', reason:'Client row has no PlusVibe Workspace ID' },base) }); continue; }
  if(!val(f,'first_name')||!val(f,'last_name')){ out.push({ json: Object.assign({ action:'failed_precheck', reason:'first_name / last_name missing' },base) }); continue; }
  if(!email){ out.push({ json: Object.assign({ action:'no_email' },base) }); continue; }
  const otherDone=!val(f,'LinkedIn Campaign')||!!val(f,'LinkedIn Routed At');
  const custom={};
  for(const [k,col] of Object.entries(VARS)){ const v=val(f,col); if(v) custom[k]=v.length>4000?v.slice(0,4000):v; }
  const pv_body={ workspace_id:p.pvWorkspace, campaign_id:campaignId, skip_if_in_workspace:false, is_overwrite:true,
    leads:[{ email, first_name:val(f,'first_name'), last_name:val(f,'last_name'), company_name:val(f,'Company'), custom_variables:custom }] };
  out.push({ json: Object.assign({ action:'enroll', otherDone, pv_body },base) });
}
return out;
