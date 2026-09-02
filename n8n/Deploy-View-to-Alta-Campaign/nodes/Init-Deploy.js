// Init Deploy: the launch row into the run's state. The Alta door's contract is the PlusVibe
// door's, one launch = one view into one campaign: Client link, Table (People or Companies,
// blank = People; Resolve Table turns it into the id), View (name), Target (the Alta campaign
// UUID). Dedupe here is the Campaigns-stamp gate plus readback, there is no sequencer-side
// dedupe mode to choose.
const sd=$getWorkflowStaticData('global'); const dk='deploy_'+$execution.id;
const r=($input.first()||{}).json||{};
const f=r.fields||r;
const clientIds=Array.isArray(f['Client'])?f['Client']:[];
const cid=clientIds[0];
const D={launchId:r.id||'', clientId:(cid&&typeof cid==='object')?String(cid.id||''):String(cid||''), table:String((f['Table']&&f['Table'].name)||f['Table']||'').trim()||'People', tableId:'', view:String(f['View']||'').trim(), target:String(f['Target']||'').trim(), ws:'', crBase:'', clientName:'', tableName:'', campName:'', pullInUrl:'', mirrorTableId:'', stampMirrorRid:'', shareViewLink:'', errors:[], warnings:[], skipCounts:{}, rows:{}, rowsTotal:0, pushed:0, landed:0, missing:0, pausedTitle:0, abort:null, startedAt:Date.now(), runAt:$now.toISO()};
if(!D.launchId){ D.abort='launch row not found'; D.errors.push('launch row not found (recordId missing or invalid)'); }
if(!D.abort&&!D.clientId){ D.abort='no client link'; D.errors.push('launch row has no Client link'); }
if(!D.abort&&!D.view){ D.abort='no View'; D.errors.push('launch row has no View'); }
if(!D.abort&&!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(D.target)){ D.abort='invalid Target'; D.errors.push('Target "'+D.target+'" is not an Alta campaign UUID'); }
sd[dk]=D;
return [{json:{clientId:D.clientId||'recMISSING'}}];
