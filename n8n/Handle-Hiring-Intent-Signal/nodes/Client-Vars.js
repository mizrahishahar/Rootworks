const r=$input.first().json||{};
const f=r.fields||r;
const name=f['Client']||'';
return [{ json: {
  clientName: name,
  clientRecId: r.id||$('Parse Play').first().json.client||'',
  clientSlug: String(name).toLowerCase().replace(/[^a-z0-9]/g,''),
  slackChannel: f['Slack Channel ID']||'',
  base: f['Clayroots Base ID']||''
}}];