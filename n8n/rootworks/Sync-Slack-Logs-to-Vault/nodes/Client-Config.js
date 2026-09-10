const r=$input.first().json||{};
const f=r.fields||r;
const name=f['Client']||'';
const slackChannelId=String(f['Slack Channel ID']||'').trim();
const bdrRaw=String(f['BDR Slack Channel ID']||'').trim();
// A BDR channel that is the client channel itself is not a second channel: the main sync already
// covers it, and the thread-id matching runs once. Only a distinct BDR channel gets the BDR leg.
const bdrChannelId=(bdrRaw && bdrRaw!==slackChannelId)?bdrRaw:'';
return [{ json: {
  recordId: r.id||'',
  slackChannelId,
  bdrChannelId,
  bdrSameAsMain: !!(bdrRaw && bdrRaw===slackChannelId),
  driveFolderId: f['driveMainFolderID']||'',
  clientName: name,
  clientSlug: String(name).toLowerCase().replace(/[^a-z0-9]/g, '')
}}];
