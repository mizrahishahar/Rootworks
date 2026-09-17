// Build Log: the run's final row. The batches accumulated their counters in this row's Tally (each
// sub-execution reads the row, adds its slice, writes it back with Status Running); this pass reads
// the accumulated Tally once more and writes the verdict. A run with no rows writes its trace too.
//
// Status: Failed only when nothing could run (FullEnrich without a credential, refusing the key or
// out of credits on every batch, or every write refused while there was something to write). People
// FullEnrich left unanswered are errors and stay retryable; a person who could not be asked is a skip.
const p=$('Params').first().json;
let t={}; try{ t=$('Resolve Table').first().json||{}; }catch(e){}
const contacts=p.mode==='contacts';
let total=0; try{ total=$('Pack Rows').all().filter(i=>i.json&&i.json.id).length; }catch(e){}
const BLANK={ rows:0, done:0, noPhone:0, errored:0, fromDatabase:0, notAskable:0, asked:0, feFound:0, credits:0, byType:{}, written:0, writeErrors:0, writeWhy:[], unansweredWhy:[], enrichmentIds:[], batches:0, skips:{}, providerDown:false };
let a=Object.assign({},BLANK);
try{ const prior=$('Read Run Row').first().json; const pf=(prior&&prior.fields)||prior||{}; const raw=pf.Tally; if(raw){ const parsed=JSON.parse(String(raw)); if(parsed&&String(parsed.execId)===String($execution.id)) a=Object.assign({},BLANK,parsed); } }catch(e){}
const n=(v)=>Number(v)||0;
let dur=0; try{ dur=Math.max(0,Math.round(($now.toMillis()-new Date(p.startedAt).getTime())/1000)); }catch(e){}
const types=Object.entries(a.byType||{}).map(([k,v])=>k+' '+v).join(', ')||'none';
const tableName=contacts?'Contacts':(t.tableName||'People');
const tableId=contacts?p.tableId:(t.tableId||'');
const scope=contacts
  ? (p.contactIds||[]).length+' Hub contact'+((p.contactIds||[]).length===1?'':'s')+' named on the launch row, '+total+' read'
  : 'one client, People view "'+(t.viewName||p.view)+'", '+total+' rows read';
const lines=[
  '**'+n(a.rows)+' people worked, '+n(a.done)+' with a number, '+n(a.noPhone)+' no phone found, '+n(a.errored)+' unanswered**',
  '',
  '**Scope:** '+scope+(p.tag?', Tag "'+p.tag+'"':'')+', '+n(a.batches)+' batch'+(n(a.batches)===1?'':'es')+' of up to 100',
  '**Rule:** FullEnrich is the only lookup: one bulk submission per batch, phones only, asked by LinkedIn URL when the row holds one, else by name and domain. A phone cell already filled answers for free and is never sent. The view, or the contacts named, is the spend cap.',
  '',
  '**Results**',
  '- **FullEnrich:** '+n(a.asked)+' asked, '+n(a.feFound)+' found, '+n(a.credits)+' credits',
  '- **Answered from the phone cell already on the row:** '+n(a.fromDatabase),
  '- **Numbers by line type:** '+types,
  '- **Rows written (confirmed by Airtable):** '+n(a.written)+(n(a.writeErrors)?', '+n(a.writeErrors)+' refused':'')
];
if(contacts) lines.push('- On Hub contacts only a number FullEnrich found is written (phone, Phone Source); a miss writes nothing.');
if((a.enrichmentIds||[]).length) lines.push('- **FullEnrich enrichment ids:** '+a.enrichmentIds.join(', '));
const skipLines=Object.entries(a.skips||{}).map(([k,v])=>'- '+k+' ('+v+')');
if(skipLines.length) lines.push('', '**Skipped**', ...skipLines);
if(!total) lines.push('', '**Skipped ('+(contacts?'none of the named contacts could be read':'view "'+p.view+'" had no rows')+')**');
if(n(a.errored)){ lines.push('', '**Failures ('+n(a.errored)+' people unanswered, left retryable)**'); for(const w of (a.unansweredWhy||[]).slice(0,10)) lines.push('- '+w); }
if((a.writeWhy||[]).length){ lines.push('', '**Write failures**'); for(const w of a.writeWhy.slice(0,10)) lines.push('- '+w); }
const failed=n(a.errored)+n(a.writeErrors);
const nothingRan=(!!a.providerDown&&n(a.feFound)===0&&n(a.asked)>0)||(total>0&&n(a.rows)>0&&n(a.written)===0&&n(a.writeErrors)>0);
if(a.providerDown&&n(a.feFound)===0&&n(a.asked)>0) lines.push('', '**Nothing could run: FullEnrich took no submission (see Failures). Nobody was looked up and no credit was spent; the rows stay retryable.**');
const log={
  'Execution ID': String($execution.id),
  'Automation': 'Enrich Phones',
  'Status': nothingRan?'Failed':(failed?'Succeeded with errors':'Succeeded'),
  'Trigger': p.trigger||'form',
  'Errors': nothingRan?Math.max(1,failed):failed,
  'Run at': p.startedAt,
  'Target': tableName+' ('+tableId+')',
  'Records In': total,
  'Records Out': n(a.written),
  'Duration s': dur,
  'Description': lines.join('\n'),
  'Tally': JSON.stringify(Object.assign({}, a, { execId:String($execution.id) })),
  'Execution Link': 'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id
};
if(!contacts) log['View']=t.viewName||p.view;
if(p.clientRecId) log['Client']=[p.clientRecId];
return [{ json:log }];
