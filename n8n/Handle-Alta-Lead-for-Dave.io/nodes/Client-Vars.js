const r=$input.first().json||{};
const f=r.fields||r;
return [{ json: {
  clientName: f['Client']||'',
  pvWorkspace: f['PlusVibe Workspace ID']||'',
  slackChannel: f['Slack Channel ID']||'',
  qualPrompt: f['Qualification Prompt']||'',
  clientRecId: r.id||''
}}];