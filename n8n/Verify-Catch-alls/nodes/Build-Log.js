// Build Log: this run's Hub row. A launched run updates its launch row; an event run (fired by Enrich
// Emails, or by the hourly fan-out) is keyed "<caller execution>-verify" so it reads as a detail row
// under the run it belongs to. Status computed; a candidate BounceBan refused at submit is an error,
// a row still pending at the cap is a skip (the next sweep takes it).
const p=$('Params').first().json;
let t={}; try{ t=$('Resolve Table').first().json||{}; }catch(e){}
let planned={}; try{ const j=$('Plan').first().json||{}; planned=j._stats||{}; }catch(e){}
let st={ rows:0, done:0, noEmail:0, pending:0, byProvider:{}, submitted:0, refused:0, verdicts:{} };
try{ const j=$('Verdict').first().json||{}; if(j._stats) st=Object.assign(st,j._stats); }catch(e){}
let wc={ written:0, writeErrors:0, writeReasons:[] }; try{ wc=Object.assign(wc,$('Write Check').first().json||{}); }catch(e){}
let elapsed=0; try{ elapsed=Number($('Gate').last().json._elapsedS)||0; }catch(e){}
const n=(v)=>Number(v)||0;
let dur=0; try{ dur=Math.max(0,Math.round(($now.toMillis()-new Date(p.startedAt).getTime())/1000)); }catch(e){}
const failed=n(st.refused)+n(wc.writeErrors);
const prov=Object.entries(st.byProvider||{}).map(([k,v])=>k+' '+v).join(', ')||'none';
const verd=Object.entries(st.verdicts||{}).map(([k,v])=>k+' '+v).join(', ')||'none';
const lines=[
  '**'+n(st.rows)+' catch-all people, '+n(st.done)+' resolved by BounceBan, '+n(st.noEmail)+' no deliverable address, '+n(st.pending)+' still waiting**',
  '',
  '**Scope:** one client, People '+(t.viewName||'(whole table)')+', rows with Status = verifying'+(p.parentExecId?', fired by run '+p.parentExecId:''),
  '**Rule:** up to three candidates per person submitted to BounceBan at once (Email Candidates, priority order); the first deliverable wins; risky and unknown are not deployable; a verdict missing at the 60-minute cap leaves the row verifying for the hourly sweep.',
  '',
  '**Results**',
  '- **Submitted:** '+n(st.submitted)+' addresses'+(n(st.refused)?', '+n(st.refused)+' refused at submit':''),
  '- **Verdicts:** '+verd,
  '- **Resolved by provider:** '+prov,
  '- **Rows written (confirmed by Airtable):** '+n(wc.written)+(n(wc.writeErrors)?', '+n(wc.writeErrors)+' refused':''),
  '- **Polling:** '+elapsed+' s'
];
if(!n(st.rows)) lines.push('', '**Skipped (no row with Status = verifying)**');
if(n(st.pending)) lines.push('', '**Skipped ('+n(st.pending)+' rows still without a verdict at the cap; the hourly sweep takes them)**');
if((wc.writeReasons||[]).length){ lines.push('', '**Write failures**'); for(const w of wc.writeReasons.slice(0,10)) lines.push('- '+w); }
const key=p._launchRecordId?String($execution.id):((p.parentExecId||String($execution.id))+'-verify');
const log={ 'Execution ID':key, 'Automation':'Verify Catch-alls', 'Status':failed?'Succeeded with errors':'Succeeded', 'Trigger':p.trigger||'event', 'Errors':failed, 'Run at':p.startedAt, 'Target':(t.tableName||'People')+' ('+(t.tableId||'')+')', 'View':t.viewName||'', 'Records In':n(st.rows), 'Records Out':n(wc.written), 'Duration s':dur, 'Description':lines.join('\n'), 'Tally':JSON.stringify(Object.assign({}, st, { planned, written:wc.written, writeErrors:wc.writeErrors })), 'Execution Link':'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id };
if(p.clientRecId) log['Client']=[p.clientRecId];
return [{ json:log }];
