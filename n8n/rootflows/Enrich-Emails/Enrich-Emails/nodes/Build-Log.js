// Build Log: the run's final row. The batches accumulated their counters in this row's Tally (each
// sub-execution reads the row, adds its slice, writes it back with Status Running); this pass reads
// the accumulated Tally once more and writes the verdict. A run with no rows writes its trace too.
const p=$('Params').first().json;
let t={}; try{ t=$('Resolve Table').first().json||{}; }catch(e){}
let total=0; try{ total=$('Fetch Rows').all().filter(i=>i.json&&i.json.id).length; }catch(e){}
const BLANK={ rows:0, done:0, verifying:0, noEmail:0, errored:0, byProvider:{}, mvCalls:0, blitzCalls:0, blitzFound:0, lmCalls:0, lmFound:0, guesses:0, catchAllDomains:0, written:0, writeErrors:0, writeWhy:[], batches:0 };
let a=Object.assign({},BLANK);
try{ const prior=$('Read Run Row').first().json; const raw=prior&&prior.fields?prior.fields.Tally:null; if(raw){ const parsed=JSON.parse(String(raw)); if(parsed&&String(parsed.execId)===String($execution.id)) a=Object.assign({},BLANK,parsed); } }catch(e){}
let handoff='not fired'; try{ const h=$('Fire Verify Catch-alls').first().json||{}; handoff=(h.error)?('failed: '+String((h.error&&h.error.message)||h.error).slice(0,120)):'fired once after the last batch (it filters Status = verifying itself and writes its own row)'; }catch(e){ handoff=total?'not fired':'not needed, no rows'; }
const n=(v)=>Number(v)||0;
let dur=0; try{ dur=Math.max(0,Math.round(($now.toMillis()-new Date(p.startedAt).getTime())/1000)); }catch(e){}
const prov=Object.entries(a.byProvider||{}).map(([k,v])=>k+' '+v).join(', ')||'none';
const lines=[
  '**'+n(a.rows)+' people worked, '+n(a.done)+' resolved, '+n(a.verifying)+' waiting on BounceBan (catch-all domains), '+n(a.noEmail)+' no email found, '+n(a.errored)+' errored**',
  '',
  '**Scope:** one client, People view "'+(t.viewName||p.view)+'"'+(p.tag?', Tag "'+p.tag+'"':'')+', '+total+' rows read, '+n(a.batches)+' batches of 100',
  '**Rule:** candidates in Email verified first (MillionVerifier); Blitz email by LinkedIn URL; one guess from the domain pattern our base already proves; six common patterns; LeadMagic last. Catch-all is decided per domain: rows there go to Verify Catch-alls with their candidates.',
  '',
  '**Results**',
  '- **Resolved by provider:** '+prov,
  '- **MillionVerifier calls:** '+n(a.mvCalls)+'; **guesses tried:** '+n(a.guesses)+'; **Blitz:** '+n(a.blitzCalls)+' asked, '+n(a.blitzFound)+' found; **LeadMagic:** '+n(a.lmCalls)+' asked, '+n(a.lmFound)+' found',
  '- **Catch-all domains met:** '+n(a.catchAllDomains),
  '- **Rows written (confirmed by Airtable):** '+n(a.written)+(n(a.writeErrors)?', '+n(a.writeErrors)+' refused':''),
  '- **Verify Catch-alls:** '+handoff
];
if(!total) lines.push('', '**Skipped (view "'+p.view+'" had no rows)**');
if((a.writeWhy||[]).length){ lines.push('', '**Write failures**'); for(const w of a.writeWhy.slice(0,10)) lines.push('- '+w); }
const failed=n(a.errored)+n(a.writeErrors);
const log={
  'Execution ID': String($execution.id),
  'Automation': 'Enrich Emails',
  'Status': failed?'Succeeded with errors':'Succeeded',
  'Trigger': p.trigger||'form',
  'Errors': failed,
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
