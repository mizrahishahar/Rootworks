// Build Batch Log: this batch's slice added to the run's own Hub row. The row is the accumulator
// (static data does not survive a sub-execution): Read Log Row fetched it, the totals are added,
// and the row is written back as Running; the parent writes the verdict after the last batch.
const r=$('Read Records').first().json;
const eid=String(r._execId);
const BLANK={ rows:0, answered:0, unanswered:0, filled:0, cells:0, byGetLeads:0, byBlitz:0, glCalls:0, glReturned:0, glMatched:0, glStrangers:0, glErrors:0, glNoKey:0, glBudget:false, blitzCalls:0, blitzFound:0, blitzNotFound:0, blitzErrors:0, blitzNoEmail:0, blitzCapped:0, written:0, writeErrors:0, writeWhy:[], failWhy:[], batches:0 };
let a=Object.assign({},BLANK);
try{ const prior=$('Read Log Row').first().json; const raw=prior&&prior.fields?prior.fields.Tally:null; if(raw){ const p=JSON.parse(String(raw)); if(p&&String(p.execId)===eid) a=Object.assign({},BLANK,p); } }catch(e){}
let s={}; try{ s=($('Merge').first().json||{})._stats||{}; }catch(e){}
const gl=s.gl||{}, bz=s.bz||{};
const n=(v)=>Number(v)||0;
for(const k of ['rows','answered','unanswered','filled','cells','byGetLeads','byBlitz']) a[k]+=n(s[k]);
a.glCalls+=n(gl.called); a.glReturned+=n(gl.returned); a.glMatched+=n(gl.matched); a.glStrangers+=n(gl.strangers); a.glErrors+=n(gl.errors); a.glNoKey+=n(gl.noKey); if(gl.budget) a.glBudget=true;
a.blitzCalls+=n(bz.called); a.blitzFound+=n(bz.found); a.blitzNotFound+=n(bz.notFound); a.blitzErrors+=n(bz.errors); a.blitzNoEmail+=n(bz.noEmail); a.blitzCapped+=n(bz.capped);
for(const w of (gl.failReasons||[]).concat(bz.failReasons||[])){ if(a.failWhy.length<10&&a.failWhy.indexOf(String(w))<0) a.failWhy.push(String(w)); }
try{ const wc=$('Write Check').first().json||{}; a.written+=n(wc.written); a.writeErrors+=n(wc.writeErrors); for(const w of (wc.writeReasons||[])){ if(a.writeWhy.length<10&&a.writeWhy.indexOf(String(w))<0) a.writeWhy.push(String(w)); } }catch(e){}
a.batches+=1; a.execId=eid;
const total=n(r._total);
const lines=[
  '**Running: '+a.rows+' of '+total+' people worked in '+a.batches+' batch'+(a.batches===1?'':'es')+', '+a.answered+' found, '+a.filled+' rows filled ('+a.cells+' cells), '+a.unanswered+' not found**',
  '', '**Table:** '+(r._tableName||'People')+' ('+(r._tableId||'')+') · view '+(r._view||''),
  '', '- **GetLeads:** '+a.glCalls+' lookups, '+a.glMatched+' matched, '+a.glStrangers+' strangers dropped'+(a.glErrors?', '+a.glErrors+' errors':''),
  '- **Blitz:** '+a.blitzCalls+' asked of a cap of '+n(r._maxBlitz)+', '+a.blitzFound+' found'+(a.blitzCapped?', '+a.blitzCapped+' held back by the cap':'')+(a.blitzNoEmail?', '+a.blitzNoEmail+' had no email to ask with':''),
  '- **Rows written:** '+a.written+(a.writeErrors?', '+a.writeErrors+' refused':'')
];
const row={ 'Execution ID':eid, 'Automation':'Enrich Person Profile', 'Status':'Running', 'Trigger':r._trigger||'form', 'Run at':r._startedAt, 'Target':(r._tableName||'People')+' ('+(r._tableId||'')+')', 'View':r._view||'', 'Records In':total, 'Records Out':a.written, 'Errors':a.glErrors+a.blitzErrors+a.writeErrors, 'Tally':JSON.stringify(a).slice(0,90000), 'Description':lines.join('\n'), 'Execution Link':'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+eid };
if(r._clientId) row['Client']=[r._clientId];
return [{ json:row }];
