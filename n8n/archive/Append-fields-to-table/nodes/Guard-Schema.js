const v=$('Resolve Table').first().json;
const tables=($('Fetch Table Schema').first().json.tables)||[];
const table=tables.find(t=>t.id===v.tableId);
if(!table){ throw new Error('Head guard: table '+v.tableName+' ('+v.tableId+') does not exist in base '+v.baseId+'. Tables there: '+tables.map(t=>t.id+' ('+t.name+')').join(', ')+'. Nothing was written.'); }
if(v.keyName==='Final Email' && /domains/i.test(table.name)){ throw new Error('Key guard: Final Email merges target contact-shaped tables only, and "'+table.name+'" is a Domains table (domains tables carry Final Email from the public-emails waterfall, but their rows are companies, not contacts). Nothing was written.'); }
const fieldNames=(table.fields||[]).map(f=>f.name);
if(!fieldNames.includes(v.keyName)){ throw new Error('Head guard: table "'+table.name+'" ('+v.tableId+') has no field named exactly "'+v.keyName+'". Fields: '+fieldNames.join(', ')+'. Nothing was written.'); }
// Airtable field names are case-insensitive: map CSV columns onto existing fields case-insensitively so a case-variant header fills the existing column. A column the table does not carry is Check Columns' refusal, next.
const byLower={}; for(const n of fieldNames){ byLower[n.toLowerCase()]=n; }
const renames={}; const canonical=[]; const notes=[];
for(const c of v.attrCols){
  if(fieldNames.includes(c)){ canonical.push(c); continue; }
  const hit=byLower[c.toLowerCase()];
  if(hit){ renames[c]=hit; canonical.push(hit); notes.push('CSV column "'+c+'" mapped to existing field "'+hit+'"'); }
  else { canonical.push(c); }
}
const seen={}; const dupes=[];
for(const c of canonical){ if(seen[c]) dupes.push(c); seen[c]=true; }
if(dupes.length){ throw new Error('Head guard: multiple CSV columns map to the same table field after case-insensitive matching: '+[...new Set(dupes)].join(', ')+'. Rename the CSV columns so each targets one field. Nothing was written.'); }
let lookup=v.lookup;
if(Object.keys(renames).length){
  const renamed={};
  for(const k of Object.keys(lookup)){ const attrs=lookup[k]; const out={}; for(const c of Object.keys(attrs)){ out[renames[c]||c]=attrs[c]; } renamed[k]=out; }
  lookup=renamed;
}
const headerNote=[v.headerNote, notes.join('; ')].filter(Boolean).join(' • ');
return [{ json: Object.assign({}, v, { tableName: table.name, fieldNames, attrCols: canonical, lookup, headerNote }) }];
