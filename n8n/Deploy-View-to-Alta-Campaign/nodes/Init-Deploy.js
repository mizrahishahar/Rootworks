// Init Deploy: the launch row into the run's state. The Alta door's contract is the PlusVibe
// door's, one launch = one view into one campaign: Client link, Table (People or Companies, by
// name, required; Resolve Table turns it into the id), View (by name, required), Target (the
// Alta campaign UUID). No defaults (Operator ruling 2026-09-02): a blank Table or View is refused
// here, before anything is read or sent. Dedupe here is the Campaigns-stamp gate plus readback,
// there is no sequencer-side dedupe mode to choose.
// Max Rows is optional and blank means unlimited: the most rows this run may enrol, applied in
// Build Prospects to the rows that survive every other check. The daily feed sets it to its own
// constant; a hand-launched deploy leaves it blank unless the Operator wants a slice.
const sd=$getWorkflowStaticData('global'); const dk='deploy_'+$execution.id;
const r=($input.first()||{}).json||{};
const f=r.fields||r;
const clientIds=Array.isArray(f['Client'])?f['Client']:[];
const cid=clientIds[0];
const D={launchId:r.id||'', clientId:(cid&&typeof cid==='object')?String(cid.id||''):String(cid||''), table:String((f['Table']&&f['Table'].name)||f['Table']||'').trim(), tableId:'', view:String(f['View']||'').trim(), target:String(f['Target']||'').trim(), maxRows:Math.max(0,Math.floor(Number(f['Max Rows'])||0)), dncTableId:'', ws:'', crBase:'', clientName:'', tableName:'', campName:'', pullInUrl:'', mirrorTableId:'', stampMirrorRid:'', shareViewLink:'', errors:[], warnings:[], skipCounts:{}, rows:{}, rowsTotal:0, pushed:0, landed:0, missing:0, pausedTitle:0, abort:null, startedAt:Date.now(), runAt:$now.toISO()};
if(!D.launchId){ D.abort='launch row not found'; D.errors.push('launch row not found (recordId missing or invalid)'); }
if(!D.abort&&!D.clientId){ D.abort='no client link'; D.errors.push('launch row has no Client link'); }
if(!D.abort&&!D.table){ D.abort='no Table'; D.errors.push('launch row has no Table (People or Companies); nothing was sent'); }
if(!D.abort&&!D.view){ D.abort='no View'; D.errors.push('launch row has no View; nothing was sent'); }
if(!D.abort&&!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(D.target)){ D.abort='invalid Target'; D.errors.push('Target "'+D.target+'" is not an Alta campaign UUID'); }
sd[dk]=D;
return [{json:{clientId:D.clientId||'recMISSING'}}];
