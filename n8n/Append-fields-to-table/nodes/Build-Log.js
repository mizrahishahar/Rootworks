// Build Log: one row per run, two shapes. On People the update-only merge (Collect Results);
// on Companies the landing through the helper (Insert domains to Clayroots), whose counters
// carry what landed, the columns created, the keys dropped, the DNC skips and the failures.
let s=null; try{ s=$('Collect Results').first().json||null; }catch(e){}
let h=null; try{ h=$('Insert Domains').first().json||null; }catch(e){}
const v=$('Resolve Table').first().json;
let clientRec=[];
try{ const lc=$('Fetch Launch Record').first().json.fields.Client; if(Array.isArray(lc)&&lc.length&&lc[0]) clientRec=[lc[0]]; }catch(e){}
if(!clientRec.length){ try{ const rc=$('Resolve Client').first().json; if(rc&&rc.id) clientRec=[rc.id]; }catch(e){} }
let dur=0;
try{ if(v.startedAt) dur=Math.max(0, Math.round(($now.toMillis()-new Date(v.startedAt).getTime())/1000)); }catch(e){}
const fmt=x=>Number(x||0).toLocaleString('en-US');
const n=(x)=>Number(x)||0;
const parts=[]; let status, recordsOut, errors, target;
if(h){
  const failed=Array.isArray(h.failed)?h.failed:[];
  errors=failed.length; status=errors?'Succeeded with errors':'Succeeded'; recordsOut=n(h.upserted); target=(h.tableName||v.tableName)+' ('+(h.tableId||v.tableId)+')';
  parts.push('**'+fmt(h.upserted)+' companies landed on '+(h.tableName||'Companies')+' from '+fmt(v.csvRows)+' CSV rows**');
  parts.push('**Fields**\n- **Key:** Domain\n- **Requested:** '+((v.fieldsRequested&&v.fieldsRequested.length) ? v.fieldsRequested.join(', ')+((v.fieldsSkipped||[]).length ? ' (skipped, not in CSV: '+v.fieldsSkipped.join(', ')+')' : '') : 'all non-key CSV columns')+'\n- **Written:** '+((h.writableKeys||[]).join(', ')||'Domain')+(Array.isArray(h.createdColumns)&&h.createdColumns.length?'\n- **Columns created (open fields):** '+h.createdColumns.join(', '):'')+(Array.isArray(h.droppedKeys)&&h.droppedKeys.length?'\n- **Keys dropped:** '+h.droppedKeys.map(d=>d.key+' ('+d.why+')').join(', '):''));
  parts.push('**Rows**\n- **CSV rows:** '+fmt(v.csvRows)+'\n- **Distinct domains:** '+fmt(v.distinctKeys)+'\n- **Duplicate keys in CSV:** '+fmt(v.dupKeys)+'\n- **Landed (record id returned):** '+fmt(h.upserted)+' ('+fmt(h.newDomains)+' new, '+fmt(h.existingDomains)+' already held)\n- **Domain Source on new rows:** CSV'+(v.tag?'\n- **Tag:** '+v.tag:''));
  const skips=[]; if(n(h.noDomain)) skips.push(fmt(h.noDomain)+' no domain'); if(n(h.dnc)) skips.push(fmt(h.dnc)+' on the DNC table');
  if(skips.length) parts.push('**Skipped ('+skips.join(', ')+')**');
  if(failed.length){ const byReason={}; for(const f of failed){ byReason[f.reason]=(byReason[f.reason]||0)+1; } parts.push('**Failures ('+failed.length+')**\n'+Object.entries(byReason).slice(0,10).map(([r,c])=>'- '+c+' x '+r).join('\n')); }
  parts.push('**Launched via:** '+v.launchedVia+(v.headerNote ? ' · '+v.headerNote : ''));
} else {
  if(!s){ throw new Error('Build Log: neither the People merge nor the Companies landing produced a result.'); }
  errors=n(s.writeFailures); status=errors?'Succeeded with errors':'Succeeded'; recordsOut=n(s.rowsUpdated); target=s.tableName+' ('+s.tableId+')';
  parts.push('**'+fmt(s.rowsUpdated)+' rows updated of '+fmt(s.csvRows)+' CSV rows**');
  parts.push('**Fields**\n- **Key:** '+s.keyName+'\n- **Requested:** '+((s.fieldsRequested&&s.fieldsRequested.length) ? s.fieldsRequested.join(', ')+(s.fieldsSkipped.length ? ' (skipped, not in CSV: '+s.fieldsSkipped.join(', ')+')' : '') : 'all non-key CSV columns')+'\n- **Appended:** '+s.fieldsAppended.join(', '));
  parts.push('**Rows**\n- **CSV rows:** '+fmt(s.csvRows)+'\n- **Distinct CSV keys:** '+fmt(s.distinctKeys)+'\n- **Duplicate keys in CSV:** '+fmt(s.dupKeys)+'\n- **Table rows scanned:** '+fmt(s.tableRowsScanned)+'\n- **Matched:** '+fmt(s.rowsMatched)+'\n- **Updated:** '+fmt(s.rowsUpdated)+'\n- **Write failures:** '+fmt(s.writeFailures)+'\n- **Unmatched CSV keys:** '+fmt(s.unmatchedCount)+(s.unmatchedSample.length ? ' (e.g. '+s.unmatchedSample.join(', ')+')' : ''));
  parts.push('**Launched via:** '+s.launchedVia+(s.headerNote ? ' · '+s.headerNote : ''));
}
const out={
  'Automation': 'Append fields to table',
  'Status': status,
  'Trigger': 'form',
  'Run at': $now.toISO(),
  'Client': clientRec,
  'Target': target,
  'Key Column': v.keyName,
  'Records In': v.csvRows,
  'Records Out': recordsOut,
  'Errors': errors,
  'Duration s': dur,
  'Description': parts.join('\n\n'),
  'Execution Link': 'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id,
  'Execution ID': String($execution.id)
};
if(!clientRec.length){ delete out['Client']; }
return [{ json: out }];
