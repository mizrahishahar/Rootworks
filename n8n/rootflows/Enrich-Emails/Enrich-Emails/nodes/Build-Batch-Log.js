// Build Batch Log: this batch's slice added to the run's own Hub row. The row is the accumulator
// (static data does not survive a sub-execution): Read Log Row fetched it, the totals are added,
// and the row is written back as Running; the parent writes the verdict after the last batch. The
// ids of the rows this batch marked verifying (and Airtable confirmed) ride in the Tally too: the
// parent hands exactly those to Verify Catch-alls, never the whole table.
const r=$('Read Records').first().json;
const eid=String(r._execId);
const BLANK={ rows:0, done:0, verifying:0, noEmail:0, errored:0, byProvider:{}, mvCalls:0, lmCalls:0, lmFound:0, guesses:0, catchAllDomains:0, written:0, writeErrors:0, writeWhy:[], batches:0, skips:[], verifyingIds:[] };
let a=Object.assign({},BLANK);
try{ const prior=$('Read Log Row').first().json; const raw=prior&&prior.fields?prior.fields.Tally:null; if(raw){ const p=JSON.parse(String(raw)); if(p&&String(p.execId)===eid) a=Object.assign({},BLANK,p); } }catch(e){}
if(!Array.isArray(a.verifyingIds)) a.verifyingIds=[];
let s={}; try{ const v=$('Verdict').first().json||{}; s=v._stats||{}; }catch(e){}
const n=(v)=>Number(v)||0;
for(const k of ['rows','done','verifying','noEmail','errored','mvCalls','lmCalls','lmFound','guesses','catchAllDomains']) a[k]+=n(s[k]);
for(const [k,v] of Object.entries(s.byProvider||{})) a.byProvider[k]=(a.byProvider[k]||0)+n(v);
if(s.lmSkipped&&a.skips.indexOf('LeadMagic: '+s.lmSkipped)<0) a.skips.push('LeadMagic: '+s.lmSkipped);
let wc={}; try{ wc=$('Write Check').first().json||{}; a.written+=n(wc.written); a.writeErrors+=n(wc.writeErrors); for(const w of (wc.writeReasons||[])){ if(a.writeWhy.length<10&&a.writeWhy.indexOf(String(w))<0) a.writeWhy.push(String(w)); } }catch(e){}
try{ const failed=new Set((wc.failed||[]).map(String)); const vids=$('Verdict').all().map(i=>i.json||{}).filter(j=>j.id&&j.Status==='verifying'&&!failed.has(String(j.id))).map(j=>String(j.id)); for(const id of vids){ if(a.verifyingIds.indexOf(id)<0) a.verifyingIds.push(id); } }catch(e){}
a.batches+=1; a.execId=eid;
const total=n(r._total);
const prov=Object.entries(a.byProvider).map(([k,v])=>k+' '+v).join(', ')||'none';
const lines=[
  '**Running: '+a.rows+' of '+total+' people worked in '+a.batches+' batch'+(a.batches===1?'':'es')+', '+a.done+' resolved, '+a.verifying+' waiting on BounceBan, '+a.noEmail+' no email found, '+a.errored+' errored**',
  '', '**Table:** '+(r._tableName||'People')+' ('+(r._tableId||'')+') · view '+(r._view||''),
  '', '- **Resolved by provider:** '+prov,
  '- **MillionVerifier calls:** '+a.mvCalls+'; **guesses:** '+a.guesses+'; **LeadMagic:** '+a.lmCalls+' asked, '+a.lmFound+' found; **catch-all domains:** '+a.catchAllDomains,
  '- **Rows written:** '+a.written+(a.writeErrors?', '+a.writeErrors+' refused':'')
];
if(a.skips.length) lines.push('', '**Skipped ('+a.skips.join('; ')+')**');
const row={ 'Execution ID':eid, 'Automation':'Enrich Emails', 'Status':'Running', 'Trigger':r._trigger||'form', 'Run at':r._startedAt, 'Target':(r._tableName||'People')+' ('+(r._tableId||'')+')', 'View':r._view||'', 'Records In':total, 'Records Out':a.written, 'Errors':a.errored+a.writeErrors, 'Tally':JSON.stringify(a), 'Description':lines.join('\n'), 'Execution Link':'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+eid };
if(r._clientId) row['Client']=[r._clientId];
return [{ json:row }];
