const p=$('Merge Launch').first().json;
const baseId=String(p['Clayroots Base ID']||'').trim();
// The launch names its table (People or Companies, blank = People); Resolve Table turns it into the id.
const table=String(p['Table']||'').trim()||'People';
const keyName=(String(p['Key column']||p['Key Column']||'Domain').trim())||'Domain';
const fieldsRaw=String(p['Fields to attach']||p['Fields to Attach']||'').trim();
// Allowed keys must be unique per row in the target table. Contact Key is the ContaGen/Supersoniq
// upsert key (first+last+domain), so it is row-unique on contacts tables.
const ALLOWED_KEYS=['Domain','Final Email','Contact Key'];
if(!ALLOWED_KEYS.includes(keyName)){ throw new Error('Key guard: Key column "'+keyName+'" is not one of '+ALLOWED_KEYS.join(' / ')+'. Nothing was written.'); }
if(!/^app[A-Za-z0-9]{14}$/.test(baseId)){ throw new Error('Head guard: Clayroots Base ID "'+baseId+'" is not a valid Airtable base id (appXXXXXXXXXXXXXX). Nothing was written.'); }
const rows=$input.all().map(i=>i.json).filter(r=>r&&Object.keys(r).length>0);
if(rows.length===0){ throw new Error('Head guard: the uploaded CSV parsed to zero data rows. Nothing was written.'); }
const headers=Object.keys(rows[0]);
let keyHeader=headers.find(h=>h.trim()===keyName);
let headerNote='';
if(!keyHeader){ keyHeader=headers.find(h=>h.trim().toLowerCase()===keyName.toLowerCase()); if(keyHeader){ headerNote='case-variant header "'+keyHeader+'" accepted as '+keyName; } }
if(!keyHeader){ throw new Error('Head guard: no "'+keyName+'" column in the CSV. Headers found: '+headers.join(', ')+'. Nothing was written.'); }
let attrCols=headers.filter(h=>h!==keyHeader);
if(attrCols.length===0){ throw new Error('Head guard: the CSV has only the '+keyName+' column and no attribute columns to merge. Headers found: '+headers.join(', ')+'. Nothing was written.'); }
let fieldsRequested=[]; let fieldsSkipped=[];
if(fieldsRaw){
  fieldsRequested=fieldsRaw.split(',').map(s=>s.trim()).filter(s=>s.length>0);
  if(fieldsRequested.length===0){ throw new Error('Head guard: Fields to attach was set but parsed to zero field names. Nothing was written.'); }
  const byExact=new Set(attrCols);
  const byLower={}; for(const c of attrCols){ byLower[c.toLowerCase()]=c; }
  const picked=[];
  for(const want of fieldsRequested){ if(byExact.has(want)){ picked.push(want); } else if(byLower[want.toLowerCase()]){ picked.push(byLower[want.toLowerCase()]); } else { fieldsSkipped.push(want); } }
  const uniq=[...new Set(picked)];
  if(uniq.length===0){ throw new Error('Head guard: none of the requested Fields to attach ('+fieldsRequested.join(', ')+') exist as CSV columns. CSV attribute columns: '+attrCols.join(', ')+'. Nothing was written.'); }
  attrCols=uniq;
}
const flat=v=>{ if(v===null||v===undefined) return ''; if(Array.isArray(v)) return v.map(x=>String(x)).join(', '); if(typeof v==='object') return JSON.stringify(v); return String(v); };
const lookup={};
let dupKeys=0;
for(const r of rows){ const k=flat(r[keyHeader]).trim().toLowerCase(); if(!k) continue; if(lookup[k]) dupKeys++; const attrs={}; for(const c of attrCols){ attrs[c]=flat(r[c]).trim(); } lookup[k]=attrs; }
const distinctKeys=Object.keys(lookup).length;
if(distinctKeys===0){ throw new Error('Head guard: every CSV row has an empty '+keyName+' value. Nothing was written.'); }
return [{ json: { baseId, table, keyName, tag: String(p['Tag']||'').trim(), clientRecId: String(p._clientRecId||'').trim(), fieldsRequested, fieldsSkipped, launchRecordId: p._launchRecordId||'', launchedVia: p._launchRecordId ? 'record' : 'form', startedAt: p.submittedAt||new Date().toISOString(), csvRows: rows.length, distinctKeys, dupKeys, keyHeader, headerNote, attrCols, lookup } }];
