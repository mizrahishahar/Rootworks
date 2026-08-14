const sd=$getWorkflowStaticData('global');
sd.runStartedAt=$now.toMillis();
let lead_email='', manual=false;
try{ const li=$('Live Input').first().json; lead_email=li.lead_email||''; }catch(e){}
try{ const mi=$('Manual Input').first().json; if(mi){ lead_email=lead_email||mi.lead_email||''; manual=(mi.manual===true||mi.manual==='true'); } }catch(e){}
const r=$('Find Client Row').first().json||{};
const f=r.fields||r;
const name=f['Client']||'';
// Qualification prompt lives in KB Files (Type=qualification-prompt); the
// Clients field is the legacy fallback until it is deleted.
let kbPrompt='';
try{ const kb=$input.first().json||{}; const kf=kb.fields||kb; kbPrompt=String(kf['Content']||'').trim(); }catch(e){}
return [{ json: {
  lead_email: lead_email,
  manual: manual,
  recordId: r.id||'',
  clientName: name,
  clientSlug: String(name).toLowerCase().replace(/[^a-z0-9]/g,''),
  pvWorkspace: f['PlusVibe Workspace ID']||'',
  slackChannel: f['Slack Channel ID']||'',
  driveFolder: f['driveMainFolderID']||'',
  clayrootsBase: f['Clayroots Base ID']||'',
  qualPrompt: kbPrompt || f['Qualification Prompt'] || '',
  notifyGoalLine: f['Notify Goal Line']||''
}}];