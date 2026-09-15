const r=$input.first().json||{};
const f=r.fields||r;
const clientRecId=r.id||'';
const clientName=f['Client']||'';
const clientSlug=String(clientName).toLowerCase().replace(/[^a-z0-9]/g,'');
return [{ json: { clientRecId, clientName, clientSlug } }];
