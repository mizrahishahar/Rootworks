const r=$input.first().json||{};
const f=r.fields||r;
const clientRecId=r.id||'';
const clientName=f['Client']||'';
const pvWorkspace=String(f['PlusVibe Workspace ID']||'').trim();
const clientSlug=String(clientName).toLowerCase().replace(/[^a-z0-9]/g,'');
return [{ json: { clientRecId, clientName, pvWorkspace, clientSlug } }];