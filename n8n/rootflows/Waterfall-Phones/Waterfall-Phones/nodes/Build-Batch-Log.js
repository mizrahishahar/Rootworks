// Build Batch Log: this batch's slice added to the run's own Hub row. The row is the accumulator
// (static data does not survive a sub-execution): Read Log Row fetched it, the totals are added, and
// the row is written back as Running; the parent writes the verdict after the last batch.
const r=$('Read Records').first().json;
const eid=String(r._execId);
const BLANK={ rows:0, done:0, tollFreeOnly:0, noPhone:0, errored:0, fromDatabase:0, byProvider:{}, sqDomains:0, sqResolveCalls:0, sqMatched:0, sqUnlockCalls:0, sqFound:0, arkCalls:0, arkFound:0, lmCalls:0, lmFound:0, prCalls:0, prFound:0, written:0, writeErrors:0, writeWhy:[], batches:0, skips:{}, providersDown:false };
let a=Object.assign({},BLANK);
try{ const prior=$('Read Log Row').first().json; const raw=prior&&prior.fields?prior.fields.Tally:null; if(raw){ const p=JSON.parse(String(raw)); if(p&&String(p.execId)===eid) a=Object.assign({},BLANK,p); } }catch(e){}
let s={}; try{ const v=$('Verdict').first().json||{}; s=v._stats||{}; }catch(e){}
const n=(v)=>Number(v)||0;
for(const k of ['rows','done','tollFreeOnly','noPhone','errored','fromDatabase','sqDomains','sqResolveCalls','sqMatched','sqUnlockCalls','sqFound','arkCalls','arkFound','lmCalls','lmFound','prCalls','prFound']) a[k]+=n(s[k]);
for(const [k,v] of Object.entries(s.byProvider||{})) a.byProvider[k]=(a.byProvider[k]||0)+n(v);
for(const [k,v] of Object.entries(s.skips||{})) a.skips[k]=(a.skips[k]||0)+n(v);
if(s.providersDown) a.providersDown=true;
try{ const wc=$('Write Check').first().json||{}; a.written+=n(wc.written); a.writeErrors+=n(wc.writeErrors); for(const w of (wc.writeReasons||[])){ if(a.writeWhy.length<10&&a.writeWhy.indexOf(String(w))<0) a.writeWhy.push(String(w)); } }catch(e){}
a.batches+=1; a.execId=eid;
const total=n(r._total);
const prov=Object.entries(a.byProvider).map(([k,v])=>k+' '+v).join(', ')||'none';
const lines=[
  '**Running: '+a.rows+' of '+total+' people worked in '+a.batches+' batch'+(a.batches===1?'':'es')+', '+a.done+' with a number ('+a.tollFreeOnly+' toll-free only), '+a.noPhone+' no phone found, '+a.errored+' errored**',
  '', '**Table:** '+(r._tableName||'People')+' ('+(r._tableId||'')+') · view '+(r._view||''),
  '', '- **Numbers by provider:** '+prov+' (of which from the Phone cell already on the row: '+a.fromDatabase+')',
  '- **Supersoniq:** '+a.sqDomains+' domains resolved in '+a.sqResolveCalls+' calls, '+a.sqMatched+' people matched, '+a.sqUnlockCalls+' unlocks asked, '+a.sqFound+' found',
  '- **AI-Ark:** '+a.arkCalls+' asked, '+a.arkFound+' found; **LeadMagic:** '+a.lmCalls+' asked, '+a.lmFound+' found; **Prospeo:** '+a.prCalls+' asked, '+a.prFound+' found',
  '- **Rows written:** '+a.written+(a.writeErrors?', '+a.writeErrors+' refused':'')
];
const skipLines=Object.entries(a.skips).map(([k,v])=>'- '+k+' ('+v+')');
if(skipLines.length) lines.push('', '**Skipped**', ...skipLines);
const row={ 'Execution ID':eid, 'Automation':'Enrich Phones', 'Status':'Running', 'Trigger':r._trigger||'form', 'Run at':r._startedAt, 'Target':(r._tableName||'People')+' ('+(r._tableId||'')+')', 'View':r._view||'', 'Records In':total, 'Records Out':a.written, 'Errors':a.errored+a.writeErrors, 'Tally':JSON.stringify(a), 'Description':lines.join('\n'), 'Execution Link':'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+eid };
if(r._clientId) row['Client']=[r._clientId];
return [{ json:row }];
