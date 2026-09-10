// Build Log: the run's final row. The batches accumulated their counters in this row's Tally (each
// sub-execution reads the row, adds its slice, writes it back with Status Running); this pass reads
// the accumulated Tally once more and writes the verdict. A run with no rows writes its trace too.
//
// Status: Failed only when nothing could run (every provider without a credential or out of credits,
// or every write refused while there was something to write). A single dead provider is a skip named
// in the row, and the run still Succeeded on whatever the others found.
const p=$('Params').first().json;
let t={}; try{ t=$('Resolve Table').first().json||{}; }catch(e){}
let total=0; try{ total=$('Fetch Rows').all().filter(i=>i.json&&i.json.id).length; }catch(e){}
const BLANK={ rows:0, done:0, tollFreeOnly:0, noPhone:0, errored:0, fromDatabase:0, byProvider:{}, sqDomains:0, sqResolveCalls:0, sqMatched:0, sqUnlockCalls:0, sqFound:0, arkCalls:0, arkFound:0, lmCalls:0, lmFound:0, prCalls:0, prFound:0, written:0, writeErrors:0, writeWhy:[], batches:0, skips:{}, providersDown:false };
let a=Object.assign({},BLANK);
try{ const prior=$('Read Run Row').first().json; const raw=prior&&prior.fields?prior.fields.Tally:null; if(raw){ const parsed=JSON.parse(String(raw)); if(parsed&&String(parsed.execId)===String($execution.id)) a=Object.assign({},BLANK,parsed); } }catch(e){}
const n=(v)=>Number(v)||0;
let dur=0; try{ dur=Math.max(0,Math.round(($now.toMillis()-new Date(p.startedAt).getTime())/1000)); }catch(e){}
const prov=Object.entries(a.byProvider||{}).map(([k,v])=>k+' '+v).join(', ')||'none';
const lines=[
  '**'+n(a.rows)+' people worked, '+n(a.done)+' with a number ('+n(a.tollFreeOnly)+' toll-free only), '+n(a.noPhone)+' no phone found, '+n(a.errored)+' errored**',
  '',
  '**Scope:** one client, People view "'+(t.viewName||p.view)+'"'+(p.tag?', Tag "'+p.tag+'"':'')+', '+total+' rows read, '+n(a.batches)+' batches of 100',
  '**Rule:** first hit wins, and a direct number always beats a toll-free switchboard. The Phone cell already on the row answers for free; then Supersoniq (one resolve a domain, then the paid unlock per matched person), AI-Ark, LeadMagic, Prospeo. The view is the spend cap: only the people in it are looked up.',
  '',
  '**Results**',
  '- **Numbers by provider:** '+prov,
  '- **Answered from the Phone cell already on the row:** '+n(a.fromDatabase),
  '- **Supersoniq:** '+n(a.sqDomains)+' domains, '+n(a.sqResolveCalls)+' resolve calls, '+n(a.sqMatched)+' people matched, '+n(a.sqUnlockCalls)+' unlocks asked, '+n(a.sqFound)+' found',
  '- **AI-Ark:** '+n(a.arkCalls)+' asked, '+n(a.arkFound)+' found',
  '- **LeadMagic:** '+n(a.lmCalls)+' asked, '+n(a.lmFound)+' found',
  '- **Prospeo:** '+n(a.prCalls)+' asked, '+n(a.prFound)+' found',
  '- **Rows written (confirmed by Airtable):** '+n(a.written)+(n(a.writeErrors)?', '+n(a.writeErrors)+' refused':'')
];
const skipLines=Object.entries(a.skips||{}).map(([k,v])=>'- '+k+' ('+v+')');
if(skipLines.length) lines.push('', '**Skipped**', ...skipLines);
if(!total) lines.push('', '**Skipped (view "'+p.view+'" had no rows)**');
if((a.writeWhy||[]).length){ lines.push('', '**Write failures**'); for(const w of a.writeWhy.slice(0,10)) lines.push('- '+w); }
const failed=n(a.errored)+n(a.writeErrors);
const nothingRan=!!a.providersDown||(total>0&&n(a.rows)>0&&n(a.written)===0&&n(a.writeErrors)>0);
if(a.providersDown) lines.push('', '**Nothing could run: every provider was without a credential or out of credits. No row was looked up; the rows are marked error and stay retryable.**');
const log={
  'Execution ID': String($execution.id),
  'Automation': 'Enrich Phones',
  'Status': nothingRan?'Failed':(failed?'Succeeded with errors':'Succeeded'),
  'Trigger': p.trigger||'form',
  'Errors': nothingRan?Math.max(1,failed):failed,
  'Run at': p.startedAt,
  'Target': (t.tableName||'People')+' ('+(t.tableId||'')+')',
  'View': t.viewName||p.view,
  'Records In': total,
  'Records Out': n(a.written),
  'Duration s': dur,
  'Description': lines.join('\n'),
  'Tally': JSON.stringify(Object.assign({}, a, { execId:String($execution.id) })),
  'Execution Link': 'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id
};
if(p.clientRecId) log['Client']=[p.clientRecId];
return [{ json:log }];
