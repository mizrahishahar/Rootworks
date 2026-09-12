// Build Log: the run's one row. Reads the pick, the tasks and the writer's count-back, and writes
// the verdict on Execution ID (the launch row when the Hub fired it, a new row on an event call).
// Status is computed: submit errors, failed or timed-out tasks and refused writes are errors;
// no-domain rows, already-answered rows, unknown answers and unanswered domains are skips.
const p=$('Params').first().json;
let t={}; try{ t=$('Resolve Table').first().json||{}; }catch(e){}
let c={}; try{ c=$('Check Columns').first().json||{}; }catch(e){}
let pick={}; try{ pick=$('Pick Rows').first().json||{}; }catch(e){}
const ps=pick.stats||{ inView:0, noDomain:0, alreadyAnswered:0, asked:0, domains:0 };
let rs=null; try{ const first=$('Results').first().json||{}; rs=first._stats||null; }catch(e){}
rs=rs||{ tasks:0, submitted:0, submitErrors:[], failedTasks:[], timedOut:[], answered:0, unknown:0, unparsed:0, missing:0, rows:0, cost:0, taskIds:[] };
let w={ written:0, writeErrors:0, writeRequests:0, failed:[], writeReasons:[] }; try{ w=Object.assign(w,$('Write Check').first().json||{}); }catch(e){}
const n=(v)=>Number(v)||0;
let dur=0; try{ dur=Math.max(0,Math.round(($now.toMillis()-new Date(p.startedAt).getTime())/1000)); }catch(e){}
const failedCount=rs.submitErrors.length+rs.failedTasks.length+rs.timedOut.length+n(w.writeErrors);
const created=(c.toCreate||[]);
const lines=[
  '**'+n(rs.answered)+' of '+n(ps.domains)+' companies answered into "'+p.outputField+'"'+(p.evidence?' (with evidence and confidence)':'')+', '+n(w.written)+' rows written'+(failedCount?', '+failedCount+' errors':'')+'**',
  '',
  '**Scope:** one client, Companies view "'+(t.viewName||p.view)+'"'+(p.tag?', Tag "'+p.tag+'"':'')+', '+n(ps.inView)+' rows in the view, '+n(ps.domains)+' distinct domains asked across '+n(rs.tasks)+' DiscoGen task'+(rs.tasks===1?'':'s')+', cap '+n(p.maxCompanies),
  '**Prompt:** '+String(p.prompt||'').replace(/\s+/g,' ').slice(0,400)+(String(p.prompt||'').length>400?'...':''),
  '**Settings:** Output Type '+p.outputType+', Web Search '+(p.webSearch?'on':'off')+', Evidence '+(p.evidence?'on':'off')+', Overwrite '+(p.overwrite?'on':'off')+', context website, the account\'s default LLM'+(p.webSearch?' and search provider':''),
  '',
  '**Results**',
  '- **Answered:** '+n(rs.answered)+'; **unknown (written blank):** '+n(rs.unknown)+(p.evidence?'; **unparsed (written verbatim):** '+n(rs.unparsed):'')+'; **not answered by DiscoGen:** '+n(rs.missing),
  '- **Rows written (confirmed by Airtable):** '+n(w.written)+(n(w.writeErrors)?', '+n(w.writeErrors)+' refused':''),
  '- **Columns created on first use:** '+(created.length?created.join(', '):'none (already there)'),
  '- **DiscoGen estimated cost (their figure, LLM fees on the account key):** $'+n(rs.cost).toFixed(4),
  '- **Task ids:** '+(rs.taskIds.length?rs.taskIds.join(', '):'none')
];
const skips=[];
if(n(ps.noDomain)) skips.push(n(ps.noDomain)+' rows with no Domain');
if(n(ps.alreadyAnswered)) skips.push(n(ps.alreadyAnswered)+' rows already holding a value (Overwrite off)');
if(!n(ps.inView)) skips.push('the view had no rows');
if(n(ps.inView)&&!n(ps.domains)) skips.push('nothing left to ask');
if(skips.length) lines.push('', '**Skipped ('+skips.join('; ')+')**');
const fails=[].concat(rs.submitErrors.map(x=>'submit: '+x), rs.failedTasks.map(x=>'task failed: '+x), rs.timedOut.map(x=>'task still running at the 8-hour cap, read it by hand: '+x), (w.writeReasons||[]).map(x=>'write: '+x));
if(fails.length){ lines.push('', '**Failures ('+failedCount+')**'); for(const x of fails.slice(0,12)) lines.push('- '+x); }
const log={
  'Execution ID': String($execution.id),
  'Automation': 'Enrich Discogen Research',
  'Status': failedCount?'Succeeded with errors':'Succeeded',
  'Trigger': p.trigger||'form',
  'Errors': failedCount,
  'Run at': p.startedAt,
  'Target': (t.tableName||'Companies')+' ('+(t.tableId||'')+')',
  'View': t.viewName||p.view,
  'Records In': n(ps.inView),
  'Records Out': n(w.written),
  'Duration s': dur,
  'Description': lines.join('\n'),
  'Tally': JSON.stringify({ execId:String($execution.id), pick:ps, results:Object.assign({},rs,{ submitErrors:rs.submitErrors.length, failedTasks:rs.failedTasks.length, timedOut:rs.timedOut.length }), written:n(w.written), writeErrors:n(w.writeErrors) }).slice(0,90000),
  'Execution Link': 'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id
};
if(p.clientRecId) log['Client']=[p.clientRecId];
return [{ json:log }];
