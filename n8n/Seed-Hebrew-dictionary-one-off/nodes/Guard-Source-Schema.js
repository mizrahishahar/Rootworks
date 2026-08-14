const g=$('Head Guard').first().json;
const resp=$input.first().json||{};
const tables=Array.isArray(resp.tables)?resp.tables:null;
if(!tables){ throw new Error('Head guard: could not read the table list for base '+g.baseId+': '+JSON.stringify(resp).slice(0,400)+'. Nothing was written.'); }
const table=tables.find(function(t){ return t.id===g.tableId; });
if(!table){ throw new Error('Head guard: table '+g.tableId+' does not exist in base '+g.baseId+'. Tables there: '+tables.map(function(t){ return t.id+' ('+t.name+')'; }).join(', ')+'. Nothing was written.'); }
const names=(table.fields||[]).map(function(f){ return f.name; });
const REQUIRED=['first_name','last_name','hebrew_speaker','first_name_he'];
const missing=REQUIRED.filter(function(n){ return names.indexOf(n)<0; });
if(missing.length){ throw new Error('Head guard: table "'+table.name+'" ('+g.tableId+') is missing the field(s) '+missing.join(', ')+', so it is not a classified contacts table. Fields present: '+names.join(', ')+'. Nothing was written.'); }
return [{ json: { baseId:g.baseId, tableId:g.tableId, tableName:table.name, startedAt:g.startedAt } }];