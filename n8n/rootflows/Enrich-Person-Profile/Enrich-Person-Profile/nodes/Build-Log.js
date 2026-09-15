// Build Log: the run's final row. The batches accumulated their counters in this row's Tally (each
// sub-execution reads the row, adds its slice, writes it back with Status Running); this pass reads
// the accumulated Tally once more and writes the verdict. A run with no rows writes its trace too.
const p=$('Params').first().json;
let t={}; try{ t=$('Resolve Table').first().json||{}; }catch(e){}
let c={}; try{ c=$('Check Columns').first().json||{}; }catch(e){}
let pack={}; try{ pack=$('Pack Rows').first().json||{}; }catch(e){}
const n=(v)=>Number(v)||0;
const inView=n(pack._inView), complete=n(pack._complete), noKey=n(pack._noKey), total=n(pack._total);
const BLANK={ rows:0, answered:0, unanswered:0, filled:0, cells:0, byGetLeads:0, byBlitz:0, glCalls:0, glReturned:0, glMatched:0, glStrangers:0, glErrors:0, glNoKey:0, glBudget:false, blitzCalls:0, blitzFound:0, blitzNotFound:0, blitzErrors:0, blitzNoEmail:0, blitzCapped:0, written:0, writeErrors:0, writeWhy:[], failWhy:[], batches:0 };
let a=Object.assign({},BLANK);
try{ const prior=$('Read Run Row').first().json; const raw=prior&&prior.fields?prior.fields.Tally:null; if(raw){ const parsed=JSON.parse(String(raw)); if(parsed&&String(parsed.execId)===String($execution.id)) a=Object.assign({},BLANK,parsed); } }catch(e){}
let dur=0; try{ dur=Math.max(0,Math.round(($now.toMillis()-new Date(p.startedAt).getTime())/1000)); }catch(e){}
const created=(c.toCreate||[]);
const lines=[
  '**'+n(a.rows)+' people looked up, '+n(a.answered)+' found, '+n(a.filled)+' rows filled ('+n(a.cells)+' cells), '+n(a.unanswered)+' not found**',
  '',
  '**Scope:** one client, People view "'+(t.viewName||p.view)+'", '+inView+' rows in the view, '+total+' asked in '+n(a.batches)+' batches of 100',
  '**Rule:** GetLeads first, one lookup per person by email, LinkedIn URL or name at the domain, an answer kept only when it proves the same person; Blitz by email for the misses, one credit each, up to Max Rows ('+n(p.maxBlitz)+'). Blanks filled on the held row, nothing overwritten, no new rows.',
  '',
  '**Results**',
  '- **Filled by:** GetLeads '+n(a.byGetLeads)+', Blitz '+n(a.byBlitz),
  '- **GetLeads:** '+n(a.glCalls)+' lookups ('+n(a.glReturned)+' rows on fair use), '+n(a.glMatched)+' matched, '+n(a.glStrangers)+' strangers dropped'+(n(a.glErrors)?', '+n(a.glErrors)+' errors':'')+(a.glBudget?'; fair-use budget hit':''),
  '- **Blitz:** '+n(a.blitzCalls)+' asked ('+n(a.blitzCalls)+' credits), '+n(a.blitzFound)+' found, '+n(a.blitzNotFound)+' not found'+(n(a.blitzCapped)?', '+n(a.blitzCapped)+' held back by the cap':'')+(n(a.blitzNoEmail)?', '+n(a.blitzNoEmail)+' had no email to ask with':''),
  '- **Rows written (confirmed by Airtable):** '+n(a.written)+(n(a.writeErrors)?', '+n(a.writeErrors)+' refused':''),
  '- **Columns created on first use:** '+(created.length?created.join(', '):'none (already there)')
];
const skips=[];
if(complete) skips.push(complete+' rows already carrying Headline, Person City and Person Country');
if(noKey) skips.push(noKey+' rows with no Name or no Domain');
if(n(a.glNoKey)) skips.push(n(a.glNoKey)+' rows with no email, LinkedIn URL or full name to look up');
if(!inView) skips.push('the view had no rows');
if(skips.length) lines.push('', '**Skipped ('+skips.join('; ')+')**');
const fails=[].concat((a.failWhy||[]).map(x=>'lookup: '+x), (a.writeWhy||[]).map(x=>'write: '+x));
const failed=n(a.glErrors)+n(a.blitzErrors)+n(a.writeErrors);
if(fails.length){ lines.push('', '**Failures ('+failed+')**'); for(const x of fails.slice(0,12)) lines.push('- '+x); }
const log={
  'Execution ID': String($execution.id),
  'Automation': 'Enrich Person Profile',
  'Status': failed?'Succeeded with errors':'Succeeded',
  'Trigger': p.trigger||'form',
  'Errors': failed,
  'Run at': p.startedAt,
  'Target': (t.tableName||'People')+' ('+(t.tableId||'')+')',
  'View': t.viewName||p.view,
  'Records In': inView,
  'Records Out': n(a.written),
  'Duration s': dur,
  'Description': lines.join('\n'),
  'Tally': JSON.stringify(Object.assign({}, a, { execId:String($execution.id), inView, complete, noKey, total })).slice(0,90000),
  'Execution Link': 'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id
};
if(p.clientRecId) log['Client']=[p.clientRecId];
return [{ json:log }];
