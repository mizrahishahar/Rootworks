const s=$('Collect Results').first().json;
let clientRec=[];
try{ const lc=$('Fetch Launch Record').first().json.fields.Client; if(Array.isArray(lc)&&lc.length&&lc[0]) clientRec=[lc[0]]; }catch(e){}
if(!clientRec.length){ try{ const rc=$('Resolve Client').first().json; if(rc&&rc.id) clientRec=[rc.id]; }catch(e){} }
let dur=0;
try{ if(s.startedAt) dur=Math.max(0, Math.round(($now.toMillis()-new Date(s.startedAt).getTime())/1000)); }catch(e){}
const status=s.writeFailures ? 'Succeeded with errors' : 'Succeeded';
const fmt=v=>Number(v||0).toLocaleString('en-US');
const parts=[];
parts.push('**'+fmt(s.rowsUpdated)+' rows updated of '+fmt(s.csvRows)+' CSV rows**');
parts.push('**Fields**\n- **Key:** '+s.keyName+'\n- **Requested:** '+((s.fieldsRequested&&s.fieldsRequested.length) ? s.fieldsRequested.join(', ')+(s.fieldsSkipped.length ? ' (skipped, not in CSV: '+s.fieldsSkipped.join(', ')+')' : '') : 'all non-key CSV columns')+'\n- **Appended:** '+s.fieldsAppended.join(', '));
parts.push('**Rows**\n- **CSV rows:** '+fmt(s.csvRows)+'\n- **Distinct CSV keys:** '+fmt(s.distinctKeys)+'\n- **Duplicate keys in CSV:** '+fmt(s.dupKeys)+'\n- **Table rows scanned:** '+fmt(s.tableRowsScanned)+'\n- **Matched:** '+fmt(s.rowsMatched)+'\n- **Updated:** '+fmt(s.rowsUpdated)+'\n- **Write failures:** '+fmt(s.writeFailures)+'\n- **Unmatched CSV keys:** '+fmt(s.unmatchedCount)+(s.unmatchedSample.length ? ' (e.g. '+s.unmatchedSample.join(', ')+')' : ''));
parts.push('**Launched via:** '+s.launchedVia+(s.headerNote ? ' · '+s.headerNote : ''));
const desc=parts.join('\n\n');
const out={
  'Automation': 'Append fields to table',
  'Status': status,
  'Trigger': 'form',
  'Run at': $now.toISO(),
  'Client': clientRec,
  'Target': s.tableName+' ('+s.tableId+')',
  'Key Column': s.keyName,
  'Records In': s.csvRows,
  'Records Out': s.rowsUpdated,
  'Errors': s.writeFailures,
  'Duration s': dur,
  'Description': desc,
  'Execution Link': 'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id,
  'Execution ID': String($execution.id)
};
if(!clientRec.length){ delete out['Client']; }
return [{ json: out }];