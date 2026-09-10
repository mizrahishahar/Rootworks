const r=$('Get Client Row').first().json||{};
const f=r.fields||r;
const name=f['Client']||'';
// The qualification rubric is read by Enrich and Qualify Lead (KB Files, Type=qualification-prompt);
// Qualify Input passes the legacy Clients field 'Qualification Prompt' as that helper's fallback.
return [{ json: {
  clientName: name,
  clientRecId: r.id||'',
  clientSlug: String(name).toLowerCase().replace(/[^a-z0-9]/g,''),
  slackChannel: f['Slack Channel ID']||'',
  notifyGoalLine: f['Notify Goal Line']||''
}}];
