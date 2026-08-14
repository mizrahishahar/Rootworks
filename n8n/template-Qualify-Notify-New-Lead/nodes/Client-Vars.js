let lead_email='';
try{ lead_email=$('Live Input').first().json.lead_email||''; }catch(e){}
if(!lead_email){ try{ lead_email=$('Backfill Input (edit email)').first().json.lead_email||''; }catch(e){} }
const r=$input.first().json||{};
const f=r.fields||r;
return [{ json: {
  lead_email: lead_email,
  clientName: f['Client']||'',
  pvWorkspace: f['PlusVibe Workspace ID']||'',
  slackChannel: f['Slack Channel ID']||'',
  driveFolder: f['driveMainFolderID']||'',
  clayrootsBase: f['Clayroots Base ID']||'',
  qualPrompt: f['Qualification Prompt']||''
}}];