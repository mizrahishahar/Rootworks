const sd=$getWorkflowStaticData('global');
sd.runStartedAt=$now.toMillis();
const r=$input.first().json||{};
const f=r.fields||r;
return [{ json: {
  recordId: r.id||'',
  driveFolderId: f['driveMainFolderID']||'',
  clientName: f['Client']||''
}}];