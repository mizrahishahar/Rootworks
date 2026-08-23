// Prep Rows: one item per row read from the view, carrying its table's plan (the visible
// columns). A table whose view could not be read yields one read-error item with the reason,
// so the run's row says exactly why nothing was enrolled from it.
let tables=[]; try{ tables=$('Plan View').all().map(i=>i.json).filter(t=>t&&t.baseId); }catch(e){}
const rows=$input.all();
const out=[];
const seenTables=new Set();
for(const it of rows){
  const j=it.json||{};
  let src=null;
  try{ const pi=it.pairedItem; const idx=(typeof pi==='number')?pi:(pi&&pi.item); if(idx!==undefined&&idx!==null) src=tables[idx]||null; }catch(e){}
  if(!src && tables.length===1) src=tables[0];
  if(!src) src=tables[0]||{};
  seenTables.add(src.tableId);
  if(src.why){ if(!out.some(o=>o.json._readError&&o.json.tableId===src.tableId)) out.push({ json: { _readError:true, tableId:src.tableId||'', errorMessage:String(src.why).slice(0,160) } }); continue; }
  if(j.error){ out.push({ json: { _readError:true, tableId:src.tableId||'', errorMessage:String((j.error&&(j.error.message||j.error))||'read failed').slice(0,160) } }); continue; }
  if(!j.id) continue;
  out.push({ json: { recordId:j.id, baseId:src.baseId||'', tableId:src.tableId||'', clientRecId:src.clientRecId||'', clientName:src.clientName||'', pvWorkspace:src.pvWorkspace||'', visible:src.visible||null, row:(j.fields||j) } });
}
// A table with a broken view may have produced no row items at all: still report it.
for(const t of tables){ if(t.why&&!seenTables.has(t.tableId)) out.push({ json: { _readError:true, tableId:t.tableId||'', errorMessage:String(t.why).slice(0,160) } }); }
// No ready rows: emit one placeholder so the chain reaches Build Client Log and the run still writes its row.
if(!out.length) return [{ json: { _empty:true } }];
return out;
