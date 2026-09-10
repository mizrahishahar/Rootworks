// Build Log (2026-09-02): this machine's own Hub run row.
// Both callers (Waterfall Emails, Verify Emails) fire it from "Fire Poller" with
// waitForSubWorkflow:false and onError:continueRegularOutput, so the caller has already written and
// closed its row by the time a catch-all settles here. A caller can never fail on this machine's
// behalf, which is the one place the sub-workflow rule (a sub-workflow failure fails its caller, and
// that is what surfaces it) cannot reach. So this call site writes its own row instead, keyed
// "<caller execution id>-bounceban": unique per fire, because Waterfall Emails fires one poller per
// 100-row batch sub-execution, and an upsert, so a re-run of the same caller execution updates the
// row rather than duplicating it. runExecId, when the caller sends one, is the top-level run row
// this pass belongs to; it is named in the Description, never in the key.
const inItems=$('Input').all().map(i=>i.json||{});
const inp=inItems[0]||{};
const callerExecId=String(inp.parentExecId||'').trim();
const runExecId=String(inp.runExecId||'').trim();
const logKey=(callerExecId||('unkeyed-'+$execution.id))+'-bounceban';
const init=$('Init').all().map(i=>i.json||{});
const t0=Number((init[0]||{})._t0)||Date.now();
const startedAt=new Date(t0).toISOString();
const dur=Math.max(0,Math.round((Date.now()-t0)/1000));
const gate=$('Gate').all().map(i=>i.json||{});
const upd=$('Build Update').all().map(i=>i.json||{});
const wrote=$input.all().map(i=>i.json||{});
const tableId=String(inp.tableId||(init[0]||{}).tableId||'');
const baseId=String(inp.baseId||(init[0]||{}).baseId||'');

const failed=[];
if(!callerExecId) failed.push({who:'the pass itself',why:'the caller sent no parentExecId, so this row is keyed on the poller\'s own execution and cannot be tied to the run that spent the credits'});

// What was polled, and how each address ended.
const byRes={};
let submitted=0,timedOut=0,definitive=0,indefinite=0;
for(const g of gate){
  const r=String(g.result||'none');
  byRes[r]=(byRes[r]||0)+1;
  if(g._submitted) submitted++; else failed.push({who:g.email||g.rowId||'an address',why:'BounceBan refused the submit; no verification id came back and nothing was ever polled'});
  if(g._timedOut){ timedOut++; failed.push({who:g.email||g.rowId||'an address',why:'no verdict inside the 60 minute cap; the row was written as '+r+' by the fallback, not by BounceBan'}); }
  if(r==='deliverable'||r==='undeliverable') definitive++; else indefinite++;
}

// What was written back. Update Row continues on error (2026-09-02) so one refused row no longer
// kills the pass and takes every other verdict with it; each refusal is named here instead.
let written=0;
wrote.forEach((w,idx)=>{
  const who=(gate[idx]||{}).email||(upd[idx]||{}).id||'a row';
  const err=w&&w.error;
  if(err) failed.push({who,why:'the Clayroots row was not updated: '+String((err&&err.message)||err).slice(0,200)});
  else if(w&&w.id) written++;
  else failed.push({who,why:'the Clayroots row update came back with no record'});
});

const recIn=inItems.length;
const n=(o)=>Object.keys(o).sort().map(k=>k+' '+o[k]).join(', ');
const status=failed.length?'Succeeded with errors':'Succeeded';
const tally={execId:logKey,callerExecId,runExecId,recordsIn:recIn,submitted,notSubmitted:recIn-submitted,settled:definitive+indefinite,timedOut,definitive,indefinite,written,errors:failed.length,verdicts:byRes};

const lines=[
'**'+recIn+' catch-all address'+(recIn===1?'':'es')+' polled, '+definitive+' settled definitively, '+written+' row'+(written===1?'':'s')+' written back'+(failed.length?', '+failed.length+' failure'+(failed.length===1?'':'s'):'')+'**',
'',
'**Fired by:** '+(runExecId&&runExecId!==callerExecId?('run '+runExecId+', batch execution '+(callerExecId||'unknown')):('run '+(callerExecId||'unknown')))+' (fire-and-forget; the caller closed its row before these verdicts existed, so this row is the only trace)',
'**Target:** '+(tableId||'unknown table')+(baseId?' in '+baseId:''),
'',
'**Polled**',
'- **Handed in:** '+recIn,
'- **Accepted by BounceBan:** '+submitted+(recIn-submitted?' ('+(recIn-submitted)+' refused at submit)':''),
'- **Verdicts:** '+(n(byRes)||'none'),
'- **Timed out (60 minute cap, fallback verdict written):** '+timedOut,
'',
'**Written back**',
'- **Rows updated:** '+written+' of '+gate.length,
'- **Definitive (deliverable / undeliverable, address columns touched):** '+definitive,
'- Skipped ('+indefinite+', no definitive verdict: only BB and Status were written and the existing Final Email was left alone)'
];
if(failed.length){
  const byWhy={}; for(const f of failed) byWhy[f.why]=(byWhy[f.why]||0)+1;
  lines.push('','**Failures ('+failed.length+')**');
  for(const [why,c] of Object.entries(byWhy).slice(0,10)) lines.push('- '+c+' x '+why);
  for(const f of failed.slice(0,10)) lines.push('  - '+f.who);
}
lines.push('','**Duration:** '+dur+'s (submit to final verdict)');

return [{ json:{
  'Execution ID': logKey,
  'Automation': 'BounceBan Poller',
  'Status': status,
  'Trigger': 'event',
  'Errors': failed.length,
  'Run at': startedAt,
  'Target': tableId,
  'Records In': recIn,
  'Records Out': written,
  'Duration s': dur,
  'Tally': JSON.stringify(tally),
  'Description': lines.join('\n'),
  'Execution Link': 'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id
} }];
