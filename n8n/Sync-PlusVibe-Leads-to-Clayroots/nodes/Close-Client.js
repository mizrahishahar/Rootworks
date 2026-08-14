const sd=$getWorkflowStaticData('global');
const id=sd.currentClient;
const c=sd.clients[id];
const cids=Object.keys(c.perCampaign);
let complete=0;
for(const cid of cids){ const p=c.perCampaign[cid]; const ok=(p.sentCounter===null||p.sentCounter===undefined)||Number(p.sumSentStep)===Number(p.sentCounter)||p.accepted===true; if(ok) complete++; }
const rowsWritten=Object.keys(c.updates).reduce((s,t)=>s+(c.updates[t]||0),0);
const skips=c.skippedTables.map(s=>'table skipped: '+s);
if(c.nominated===0) skips.push('no nominated leads, nothing to write');
const warns=c.warnings.slice();
for(const t of Object.keys(c.goneTables||{})) warns.push('table gone mid-run: '+t+' ('+c.goneTables[t]+' batches skipped)');
c.summary={name:c.name, mode:(c.watermark?('incremental since '+c.watermark):'backfill'), campaigns:cids.length, complete, incomplete:cids.length-complete, leadsPulled:c.leadsPulled, nominated:c.nominated, rowsWritten, failedList:[].concat(c.errors, c.invariant), warnings:warns, skips, pullOk:c.pullOk!==false, writeOk:c.writeOk!==false};
delete c.perCampaign; delete c.payloads; delete c.updates; delete c.errors; delete c.warnings; delete c.invariant; delete c.skippedTables; delete c.targetTables; delete c.mirrorMap; delete c._noMirrorWarned; delete c.goneTables;
sd.write=null;
sd.pull={queue:[], idx:0, byCampaign:{}};
return [{json:{clientRecId:id}}];