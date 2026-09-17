// Build Batch Log: this batch's slice added to the run's own Hub row. The row is the accumulator
// (static data does not survive a sub-execution): Read Log Row fetched it, the totals are added, and
// the row is written back as Running; the parent writes the verdict after the last batch.
const r=$('Read Records').first().json;
const eid=String(r._execId);
const BLANK={ rows:0, done:0, noPhone:0, errored:0, fromDatabase:0, notAskable:0, asked:0, feFound:0, credits:0, byType:{}, written:0, writeErrors:0, writeWhy:[], unansweredWhy:[], enrichmentIds:[], batches:0, skips:{}, providerDown:false };
let a=Object.assign({},BLANK);
try{ const prior=$('Read Log Row').first().json; const pf=(prior&&prior.fields)||prior||{}; const raw=pf.Tally; if(raw){ const p=JSON.parse(String(raw)); if(p&&String(p.execId)===eid) a=Object.assign({},BLANK,p); } }catch(e){}
let s={}; try{ const v=$('Verdict').first().json||{}; s=v._stats||{}; }catch(e){}
const n=(v)=>Number(v)||0;
for(const k of ['rows','done','noPhone','errored','fromDatabase','notAskable','asked','feFound','credits']) a[k]+=n(s[k]);
for(const [k,v] of Object.entries(s.byType||{})) a.byType[k]=(a.byType[k]||0)+n(v);
for(const [k,v] of Object.entries(s.skips||{})) a.skips[k]=(a.skips[k]||0)+n(v);
for(const id of (s.enrichmentIds||[])){ if(a.enrichmentIds.length<50) a.enrichmentIds.push(String(id)); }
if(s.unansweredWhy&&a.unansweredWhy.length<10&&a.unansweredWhy.indexOf(String(s.unansweredWhy))<0) a.unansweredWhy.push(String(s.unansweredWhy));
if(s.providerDown) a.providerDown=true;
try{ const wc=$('Write Check').first().json||{}; a.written+=n(wc.written); a.writeErrors+=n(wc.writeErrors); for(const w of (wc.writeReasons||[])){ if(a.writeWhy.length<10&&a.writeWhy.indexOf(String(w))<0) a.writeWhy.push(String(w)); } }catch(e){}
a.batches+=1; a.execId=eid;
const total=n(r._total);
const types=Object.entries(a.byType).map(([k,v])=>k+' '+v).join(', ')||'none';
const lines=[
  '**Running: '+a.rows+' of '+total+' people worked in '+a.batches+' batch'+(a.batches===1?'':'es')+', '+a.done+' with a number, '+a.noPhone+' no phone found, '+a.errored+' unanswered**',
  '', '**Table:** '+(r._tableName||'People')+' ('+(r._tableId||'')+') · '+(r._view||''),
  '', '- **FullEnrich:** '+a.asked+' asked, '+a.feFound+' found, '+a.credits+' credits',
  '- **Answered from the phone cell already on the row:** '+a.fromDatabase,
  '- **Numbers by line type:** '+types,
  '- **Rows written:** '+a.written+(a.writeErrors?', '+a.writeErrors+' refused':'')
];
const skipLines=Object.entries(a.skips).map(([k,v])=>'- '+k+' ('+v+')');
if(skipLines.length) lines.push('', '**Skipped**', ...skipLines);
const row={ 'Execution ID':eid, 'Automation':'Enrich Phones', 'Status':'Running', 'Trigger':r._trigger||'form', 'Run at':r._startedAt, 'Target':(r._tableName||'People')+' ('+(r._tableId||'')+')', 'Records In':total, 'Records Out':a.written, 'Errors':a.errored+a.writeErrors, 'Tally':JSON.stringify(a), 'Description':lines.join('\n'), 'Execution Link':'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+eid };
if(r._mode!=='contacts') row['View']=r._view||'';
if(r._clientId) row['Client']=[r._clientId];
return [{ json:row }];
