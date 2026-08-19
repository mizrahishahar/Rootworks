const sd=$getWorkflowStaticData('global'); const dk='deploy_'+$execution.id;
const r=($input.first()||{}).json||{};
const f=r.fields||r;
const clientIds=Array.isArray(f['Client'])?f['Client']:[];
const D={launchId:r.id||'', clientId:clientIds[0]||'', tableId:String(f['Table ID']||'').trim(), view:String(f['View']||'').trim(), target:String(f['Target']||'').trim(), dedupe:String(f['Dedupe Mode']||'Strict').trim()||'Strict', ws:'', crBase:'', clientName:'', tableName:'', campName:'', receiptName:'', errors:[], warnings:[], counters:[], uploadedNew:0, deployed:0, missing:0, rowsTotal:0, rows:{}, emailToRow:{}, inCamp:{}, skipCounts:{}, rbFailed:false, abort:null, startedAt:Date.now(), runAt:$now.toISO()};
if(!D.launchId){ D.abort='launch row not found'; D.errors.push('launch row not found (recordId missing or invalid)'); }
if(!D.abort&&!D.clientId){ D.abort='no client link'; D.errors.push('launch row has no Client link'); }
if(!D.abort&&!D.tableId){ D.abort='no Table ID'; D.errors.push('launch row has no Table ID'); }
if(!D.abort&&!D.view){ D.abort='no View'; D.errors.push('launch row has no View'); }
if(!D.abort&&!/^[0-9a-f]{24}$/i.test(D.target)){ D.abort='invalid Target'; D.errors.push('Target "'+D.target+'" is not a plausible PlusVibe campaign id (24 hex)'); }
sd[dk]=D;
return [{json:{clientId:D.clientId||'recMISSING'}}];