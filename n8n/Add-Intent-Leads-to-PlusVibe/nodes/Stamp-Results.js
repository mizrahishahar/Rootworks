const enrolls=$input.all();
let resolved=[]; try{ resolved=$('Route Rows').all().map(i=>i.json).filter(r=>r&&r.action==='enroll'); }catch(e){}
const out=[];
for(let i=0;i<enrolls.length;i++){
  const e=(enrolls[i]&&enrolls[i].json)||{};
  const r=resolved[i]||{};
  if(!r.recordId) continue;
  const failed=!!(e&&(e.error||e.error_message||e.success===false||String(e.status||'').toLowerCase()==='error'));
  out.push({ json: {
    recordId:r.recordId, baseId:r.baseId, tableId:r.tableId, clientRecId:r.clientRecId, clientName:r.clientName, name:r.name, otherDone:!!r.otherDone,
    ok: !failed,
    reason: !failed?'':String((e.error&&(e.error.message||e.error))||e.error_message||'PlusVibe lead/add failed').slice(0,160)
  }});
}
return out;