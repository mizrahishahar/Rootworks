const sd=$getWorkflowStaticData('global');
sd.runStartedAt=$now.toMillis();
let lead_email='', manual=false;
try{ const li=$('Live Input').first().json; lead_email=li.lead_email||''; }catch(e){}
try{ const mi=$('Manual Input').first().json; if(mi){ lead_email=lead_email||mi.lead_email||''; manual=(mi.manual===true||mi.manual==='true'); } }catch(e){}
const r=$('Find Client Row').first().json||{};
const f=r.fields||r;
const name=f['Client']||'';
// The qualification rubric is read by Enrich and Qualify Lead (KB Files, Type=qualification-prompt);
// Qualify Input passes the legacy Clients field 'Qualification Prompt' as that helper's fallback.
// Email Bison is hardcoded to DuoDiv's instance (Operator ruling 2026-09-06); no workspace id rides here.
return [{ json: {
  lead_email: lead_email,
  manual: manual,
  recordId: r.id||'',
  clientName: name,
  clientSlug: String(name).toLowerCase().replace(/[^a-z0-9]/g,''),
  slackChannel: f['Slack Channel ID']||'',
  driveFolder: f['driveMainFolderID']||'',
  clayrootsBase: f['Clayroots Base ID']||'',
  notifyGoalLine: f['Notify Goal Line']||''
}}];
