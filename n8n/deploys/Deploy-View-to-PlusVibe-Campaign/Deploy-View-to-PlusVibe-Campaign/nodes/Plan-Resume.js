// Plan Resume: a campaign PlusVibe had marked COMPLETED does not start again when leads land in it
// (proven on Adelante, 2026-09-12: 74 leads sat uncontacted after completion). When this run put
// new leads into a COMPLETED campaign, it is activated again, so a live-fed campaign that ran dry
// for a few days is not silently dead from then on. Anything else passes straight to the close.
const sd = $getWorkflowStaticData('global'); const dk = 'deploy_' + $execution.id; const D = sd[dk];
const resume = !D.abort && D.pvStatus === 'COMPLETED' && (D.uploadedNew || 0) > 0;
return [{ json: { resume, body: resume ? { workspace_id: D.ws, campaign_id: D.target } : null } }];
