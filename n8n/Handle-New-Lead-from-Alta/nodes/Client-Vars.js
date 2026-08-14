const r=$input.first().json||{};
const f=r.fields||r;
const name=f['Client']||'';
return [{ json: {
  clientName: name,
  clientRecId: r.id||'',
  clientSlug: String(name).toLowerCase().replace(/[^a-z0-9]/g,''),
  slackChannel: f['Slack Channel ID']||'',
  qualPrompt: f['Qualification Prompt']||'',
  notifyGoalLine: f['Notify Goal Line']||''
}}];