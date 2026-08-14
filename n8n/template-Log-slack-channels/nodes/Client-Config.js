const r=$input.first().json||{};
const f=r.fields||r;
return [{ json: {
  slackChannelId: f['Slack Channel ID']||'',
  driveFolderId: f['driveMainFolderID']||'',
  clientName: f['Client']||''
}}];