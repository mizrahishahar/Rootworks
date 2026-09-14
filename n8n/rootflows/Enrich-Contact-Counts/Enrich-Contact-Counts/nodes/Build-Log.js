// Build Log: the run's one row. Reads the pick, the counts and the writer's count-back, and writes
// the verdict on Execution ID (the launch row when the Hub fired it, a new row on an event call).
// Status is computed: count errors and refused writes are errors; no-domain rows are skips.
const p=$('Params').first().json;
let t={}; try{ t=$('Resolve Table').first().json||{}; }catch(e){}
let c={}; try{ c=$('Check Columns').first().json||{}; }catch(e){}
let pick={}; try{ pick=$('Pick Rows').first().json||{}; }catch(e){}
const ps=pick.stats||{ inView:0, noDomain:0, asked:0, domains:0 };
let rs=null; try{ const first=$('Results').first().json||{}; rs=first._stats||null; }catch(e){}
rs=rs||{ called:0, counted:0, errors:0, credits:0, firstError:'', failReasons:[], noKey:0, coverageCalled:0, coverageUnknown:0, coverageZero:0, unknown:0, zero:0, positive:0, sum:0, rows:0, notWritten:0 };
let w={ written:0, writeErrors:0, writeRequests:0, failed:[], writeReasons:[] }; try{ w=Object.assign(w,$('Write Check').first().json||{}); }catch(e){}
const n=(v)=>Number(v)||0;
let dur=0; try{ dur=Math.max(0,Math.round(($now.toMillis()-new Date(p.startedAt).getTime())/1000)); }catch(e){}
const failedCount=n(rs.errors)+n(w.writeErrors)+(n(rs.noKey)?1:0)+(lookupFail?1:0);
const created=(c.toCreate||[]);
// The People mirror: a lookup of the count column, planned by Plan Lookup and created by Create Lookup.
let lookupLine='none needed (already there)'; let lookupFail='';
try{ const pl=$('Plan Lookup').first().json||{}; if(pl.note) lookupLine='not created: '+pl.note; else if(!pl._none){ let ans={}; try{ ans=$('Create Lookup').first().json||{}; }catch(e){} if(ans.id&&ans.type==='multipleLookupValues') lookupLine='created on People as a lookup of Companies'; else { lookupLine='the create was refused'; lookupFail='People lookup "'+p.outputField+'" was not created: '+JSON.stringify(ans).slice(0,160); } } }catch(e){}
const what=p.titles.length?('people titled '+p.titles.join(', ')+(p.excludeTitles.length?' (excluding '+p.excludeTitles.join(', ')+')':'')):'everyone GetLeads holds at the domain';
const lines=[
  '**'+(n(rs.positive)+n(rs.zero))+' of '+n(ps.domains)+' companies counted into "'+p.outputField+'", '+n(rs.unknown)+' unknown to GetLeads (blank), '+n(w.written)+' rows written'+(failedCount?', '+failedCount+' errors':'')+'**',
  '',
  '**Scope:** one client, Companies view "'+(t.viewName||p.view)+'", '+n(ps.inView)+' rows in the view, '+n(ps.domains)+' distinct domains asked',
  '**Counting:** '+what+'. Every row in the view is recounted and overwritten; a company GetLeads does not know stays blank, never zero',
  '**Cost:** '+n(rs.credits)+' credits (the count endpoint is free)',
  '',
  '**Results**',
  '- **Counts:** '+n(rs.positive)+' companies with people ('+n(rs.sum)+' in total), '+n(rs.zero)+' with none, '+n(rs.unknown)+' unknown to GetLeads',
  '- **Calls:** '+n(rs.called)+' counts'+(n(rs.coverageCalled)?', '+n(rs.coverageCalled)+' coverage checks on zeros ('+n(rs.coverageZero)+' real zeros, '+n(rs.coverageUnknown)+' unknown)':''),
  '- **Rows written (confirmed by Airtable):** '+n(w.written)+(n(w.writeErrors)?', '+n(w.writeErrors)+' refused':''),
  '- **Column created on first use:** '+(created.length?created.join(', '):'none (already there)'),
  '- **People lookup "'+p.outputField+'":** '+lookupLine
];
const skips=[];
if(n(ps.noDomain)) skips.push(n(ps.noDomain)+' rows with no Domain');
if(!n(ps.inView)) skips.push('the view had no rows');
if(skips.length) lines.push('', '**Skipped ('+skips.join('; ')+')**');
const fails=[].concat(n(rs.noKey)?['no credential on the GetLeads node ('+n(rs.noKey)+' calls)']:[], lookupFail?[lookupFail]:[], (rs.failReasons||[]).map(x=>'count: '+x), (w.writeReasons||[]).map(x=>'write: '+x));
if(fails.length){ lines.push('', '**Failures ('+failedCount+')**'); for(const x of fails.slice(0,12)) lines.push('- '+x); if(n(rs.notWritten)) lines.push('- '+n(rs.notWritten)+' rows left untouched because their count errored'); }
const log={
  'Execution ID': String($execution.id),
  'Automation': 'Enrich Contact Counts',
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
  'Tally': JSON.stringify({ execId:String($execution.id), pick:ps, counts:rs, written:n(w.written), writeErrors:n(w.writeErrors) }).slice(0,90000),
  'Execution Link': 'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id
};
if(p.clientRecId) log['Client']=[p.clientRecId];
return [{ json:log }];
