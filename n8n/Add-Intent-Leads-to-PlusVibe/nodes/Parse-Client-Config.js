const sd=$getWorkflowStaticData('global');
sd.runStartedAt=$now.toMillis();
const r=$input.first().json||{};
const f=r.fields||r;
const clientBase=String(f['Clayroots Base ID']||'').trim();
const pvWorkspace=String(f['PlusVibe Workspace ID']||'').trim();
const raw=String(f['Intent Tables']||'');
const lines=raw.split('\n').map(s=>s.trim()).filter(Boolean);
const tables=[];
for(const ln of lines){
  let t=ln;
  if(ln.includes('/')){ const parts=ln.split('/').map(s=>s.trim()).filter(Boolean); t=parts.find(p=>/^tbl/.test(p))||''; }
  if(/^tbl/.test(t) && clientBase) tables.push({ baseId: clientBase, tableId: t });
}
const clientRecId=r.id||'';
const clientName=f['Client']||'';
if(!tables.length) return [{ json: { clientRecId, clientName, baseId:'', tableId:'', pvWorkspace } }];
return tables.map(t=>({ json: { clientRecId, clientName, baseId:t.baseId, tableId:t.tableId, pvWorkspace } }));