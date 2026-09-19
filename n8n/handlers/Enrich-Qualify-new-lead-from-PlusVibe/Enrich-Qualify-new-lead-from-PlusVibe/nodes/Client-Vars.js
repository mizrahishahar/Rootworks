const sd=$getWorkflowStaticData('global');
sd.runStartedAt=$now.toMillis();
let lead_email='', manual=false, webhookEvent='';
try{ const li=$('Live Input').first().json; lead_email=li.lead_email||''; webhookEvent=li.webhook_event||''; }catch(e){}
try{ const mi=$('Manual Input').first().json; if(mi){ lead_email=lead_email||mi.lead_email||''; manual=(mi.manual===true||mi.manual==='true'); } }catch(e){}
const r=$('Find Client Row').first().json||{};
const f=r.fields||r;
const name=f['Client']||'';
// The qualification rubric is read by Enrich and Qualify Lead (KB Files, Type=qualification-prompt);
// Qualify Input passes the legacy Clients field 'Qualification Prompt' as that helper's fallback.
return [{ json: {
  lead_email: lead_email,
  manual: manual,
  webhookEvent: webhookEvent,
  recordId: r.id||'',
  clientName: name,
  clientSlug: String(name).toLowerCase().replace(/[^a-z0-9]/g,''),
  pvWorkspace: f['PlusVibe Workspace ID']||'',
  slackChannel: f['Slack Channel ID']||'',
  driveFolder: f['driveMainFolderID']||'',
  clayrootsBase: f['Clayroots Base ID']||'',
  notifyGoalLine: f['Notify Goal Line']||''
}}];
