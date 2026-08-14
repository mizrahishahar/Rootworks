const r=$('Get Client Row').first().json||{};
const f=r.fields||r;
const name=f['Client']||'';
// Qualification prompt lives in KB Files (Type=qualification-prompt); the
// Clients field is the legacy fallback until it is deleted.
let kbPrompt='';
try{ const kb=$input.first().json||{}; const kf=kb.fields||kb; kbPrompt=String(kf['Content']||'').replace(/\\([_*[\]`#|>~-])/g,'$1').trim(); }catch(e){}
return [{ json: {
  clientName: name,
  clientRecId: r.id||'',
  clientSlug: String(name).toLowerCase().replace(/[^a-z0-9]/g,''),
  slackChannel: f['Slack Channel ID']||'',
  qualPrompt: kbPrompt || f['Qualification Prompt'] || '',
  notifyGoalLine: f['Notify Goal Line']||''
}}];