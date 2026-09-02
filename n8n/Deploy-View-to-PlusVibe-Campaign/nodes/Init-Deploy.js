// Init Deploy: the launch row into the run's state. One launch = one view into one campaign:
// Client link, Table (People or Companies, by name, required), View (by name, required), Target
// (the PlusVibe campaign id), Dedupe Mode, Max Rows. No defaults (Operator ruling 2026-09-02): a
// launch row that leaves Table or View blank is refused here, before anything is read or sent.
// Max Rows is optional and blank means unlimited: the most rows this run may enrol, applied in
// Build Leads to the leads that survive every other check. The daily feed sets it to its own
// constant; a hand-launched deploy leaves it blank unless the Operator wants a slice.
const sd=$getWorkflowStaticData('global'); const dk='deploy_'+$execution.id;
const r=($input.first()||{}).json||{};
const f=r.fields||r;
const clientIds=Array.isArray(f['Client'])?f['Client']:[];
const D={launchId:r.id||'', clientId:clientIds[0]||'', table:String((f['Table']&&f['Table'].name)||f['Table']||'').trim(), tableId:'', view:String(f['View']||'').trim(), target:String(f['Target']||'').trim(), dedupe:String(f['Dedupe Mode']||'Strict').trim()||'Strict', maxRows:Math.max(0,Math.floor(Number(f['Max Rows'])||0)), ws:'', crBase:'', clientName:'', tableName:'', campName:'', receiptName:'', errors:[], warnings:[], counters:[], uploadedNew:0, deployed:0, missing:0, rowsTotal:0, rows:{}, emailToRow:{}, inCamp:{}, skipCounts:{}, rbFailed:false, abort:null, startedAt:Date.now(), runAt:$now.toISO()};
if(!D.launchId){ D.abort='launch row not found'; D.errors.push('launch row not found (recordId missing or invalid)'); }
if(!D.abort&&!D.clientId){ D.abort='no client link'; D.errors.push('launch row has no Client link'); }
if(!D.abort&&!D.table){ D.abort='no Table'; D.errors.push('launch row has no Table (People or Companies); nothing was sent'); }
if(!D.abort&&!D.view){ D.abort='no View'; D.errors.push('launch row has no View; nothing was sent'); }
if(!D.abort&&!/^[0-9a-f]{24}$/i.test(D.target)){ D.abort='invalid Target'; D.errors.push('Target "'+D.target+'" is not a plausible PlusVibe campaign id (24 hex)'); }
sd[dk]=D;
return [{json:{clientId:D.clientId||'recMISSING'}}];
