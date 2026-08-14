let tables=[]; try{ tables=$('Parse Client Config').all().map(i=>i.json).filter(t=>t&&t.baseId); }catch(e){}
const rows=$input.all();
const out=[];
for(const it of rows){
  const j=it.json||{};
  let src=null;
  try{ const pi=it.pairedItem; const idx=(typeof pi==='number')?pi:(pi&&pi.item); if(idx!==undefined&&idx!==null) src=tables[idx]||null; }catch(e){}
  if(!src && tables.length===1) src=tables[0];
  if(!src) src=tables[0]||{};
  if(j.error){ out.push({ json: { _readError:true, tableId:src.tableId||'', errorMessage:String((j.error&&(j.error.message||j.error))||'read failed').slice(0,160) } }); continue; }
  if(!j.id) continue;
  out.push({ json: { recordId:j.id, baseId:src.baseId||'', tableId:src.tableId||'', clientRecId:src.clientRecId||'', clientName:src.clientName||'', row:(j.fields||j) } });
}
return out;