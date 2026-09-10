// Counters: one item back to the caller, counters only; rows never cross the boundary. A helper
// writes no run-log row: the caller's Build Log reads these. upserted counts the upsert's own
// output, the items that came back with a record id; every other item is a failed row with its
// reason. Every read is guarded because the empty path skips the row nodes.
const m=$('Read Meta').first().json; const c=$('Check Columns').first().json;
let created=[]; try{ created=$('Verify Columns').first().json.created||[]; }catch(e){}
let prepared=0; try{ prepared=$('Prepare Rows').all().filter(i=>i.json&&i.json.Domain).length; }catch(e){}
const dnc=Math.max(0,(m.rows||[]).length-prepared);
let withEmails=0; try{ for(const it of $('Clean Fields').all()){ if(String((it.json||{}).public_emails_clean||'').trim()) withEmails++; } }catch(e){}
const existing=new Set();
try{ for(const it of $('Read Existing').all()){ const j=it.json||{}; const d=String((j.fields&&j.fields.Domain)||j.Domain||'').trim().toLowerCase(); if(d) existing.add(d); } }catch(e){}
let newDomains=0, existingDomains=0;
try{ for(const it of $('Mark Source').all()){ const d=String((it.json||{}).Domain||''); if(!d) continue; if(existing.has(d)) existingDomains++; else newDomains++; } }catch(e){}
let upserted=0; const failed=[];
try{ for(const it of $('Upsert Companies').all()){ const j=it.json||{}; if(j.id){ upserted++; continue; } const e=j.error||{}; const why=(e.description&&String(e.description).replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim())||e.message||j.message||'no record id came back'; failed.push({ name: (j.fields&&j.fields.Domain)||('item '+((e.context&&e.context.itemIndex)!=null?e.context.itemIndex:'?')), reason: String(why).slice(0,140) }); } }catch(e){}
if(prepared&&upserted+failed.length<prepared) failed.push({ name:'upsert', reason:(prepared-upserted-failed.length)+' rows returned no record id' });
return [{ json: {
  base: m.base, clientRecId: m.clientRecId, tag: m.tag, domainSource: m.domainSource, allowNew: m.allowNew,
  tableId: c.tableId, tableName: c.tableName, peopleTableId: c.peopleTableId, dncTableId: c.dncTableId,
  in: m.in, noDomain: m.noDomain, duplicate: m.duplicate, dnc: dnc, prepared: prepared,
  newDomains: newDomains, existingDomains: existingDomains, withEmails: withEmails,
  writableKeys: c.writable, droppedKeys: c.dropped, createdColumns: created,
  upserted: upserted, failed: failed, errors: failed.length
} }];
