const r=$input.first().json||{};
const f=r.fields||r;
const name=f['Client']||'';
return [{ json: {
  recordId: r.id||'',
  slackChannelId: f['Slack Channel ID']||'',
  bdrChannelId: f['BDR Slack Channel ID']||'',
  driveFolderId: f['driveMainFolderID']||'',
  clientName: name,
  clientSlug: String(name).toLowerCase().replace(/[^a-z0-9]/g, '')
}}];