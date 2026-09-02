// Build Batch Log: this pass's own Hub row (ruled 2026-09-02): Execution ID "<parentExecId>-<n>"
// for a writer batch, "<parentExecId>-ark" for the run's single AI-Ark lane; Automation
// "Waterfall Contacts Batch"; Client attached; Records In = companies in; Records Out = people
// written; Description = the counters as text; Tally = the counters JSON the parent sums once every
// pass row landed (the writer's held state stays out of it: it is for the lane, not the log).
// Status computed: Failed when every paid call in the pass died (the pass did no work; the parent
// stops launching on a writer's), Succeeded with errors when failed[] is not empty, Succeeded
// otherwise. A company the lane never submitted because the 429 breaker stopped it counts as a
// failure of this pass, one per company, so the number is loud instead of buried in prose.
// Written before Batch Response answers. The key is unique by construction: batchNum is dealt once
// by the parent's Make Batches, one lane per run, the parent execution id is n8n's.
const inp=$('Batch Input').first().json;
const s=Object.assign({}, $('Batch Summary').first().json||{});
delete s.held;
const num=(v)=>Number(v)||0;
const failed=[];
const tierName={ contagen:'ContaGen', supersoniq:'Supersoniq', aiark:'AI-Ark' };
for(const k of ['contagen','supersoniq','aiark']){ const x=s[k]||{}; for(let i=0;i<num(x.errors);i++) failed.push({ tier:tierName[k], reason:x.firstError||'call failed' }); }
for(let i=0;i<num(s.arkUnserved);i++) failed.push({ tier:'AI-Ark', reason:'company never submitted; the lane stopped after eight rate-limit answers in a row' });
for(let i=0;i<num(s.writeErrors);i++) failed.push({ tier:'People writer', reason:'row not in the answer' });
for(let i=0;i<num(s.stampErrors);i++) failed.push({ tier:'Contacts Pulled At stamp', reason:'row not in the answer' });
let dur=0; try{ dur=Math.max(0,Math.round(($now.toMillis()-new Date(inp.startedAt).getTime())/1000)); }catch(e){}
const companiesIn=num(s.companiesIn), covered=num(s.covered), pct=companiesIn?Math.round(100*covered/companiesIn):0;
const on=(x)=>(inp.sources||[]).indexOf(x)>-1;
const tier=(label,x)=>'- **'+label+':** called '+num(x.called)+', returned '+num(x.returned)+', kept '+num(x.kept)+', credits '+(Math.round(num(x.credits)*100)/100)+(num(x.errors)?', errors '+num(x.errors):'');
const zd=Array.isArray(s.zeroDomains)?s.zeroDomains:[];
const isArk=s.mode==='ark';
const head=isArk?('AI-Ark lane: '+companiesIn+' companies from '+num(s.batchCount)+' closed writer batch'+(num(s.batchCount)===1?'':'es')+', '+num(s.underCap)+' still under cap, '+num(s.written)+' people written, '+covered+' of '+companiesIn+' covered after it ('+pct+'%)'):('Batch '+num(s.batchNum)+' of '+num(s.batchCount)+': '+companiesIn+' companies in, '+num(s.written)+' people written, '+covered+' of '+companiesIn+' covered ('+pct+'%)');
const lines=[ '**'+head+'**', '', '**Parent run:** '+inp.parentExecId+' (this row is one pass of it; the parent sums the passes)', '' ];
if(isArk){
  lines.push(tier('AI-Ark', s.aiark||{}));
  lines.push('- **Exports:** '+num(s.arkPlanned)+' planned, '+num((s.aiark||{}).called)+' submitted 250 ms apart in windows of fifty, '+num(s.arkDone)+' settled ('+num(s.arkCallbacks)+' by webhook, '+num(s.arkPolled)+' by a statistics read), '+num(s.arkWithPeople)+' with people (results fetched only for those)');
  if(num(s.arkRateLimited)) lines.push('- **Rate limited:** '+num(s.arkRateLimited)+' export'+(num(s.arkRateLimited)===1?'':'s')+' answered HTTP 429 (AI-Ark allows five per second, 300 per minute, globally)');
  if(num(s.arkUnserved)) lines.push('- **Unserved:** '+num(s.arkUnserved)+' companies were never submitted');
}else{
  if(on('ContaGen')) lines.push(tier('ContaGen', s.contagen||{}));
  if(on('Supersoniq')) lines.push(tier('Supersoniq', s.supersoniq||{}));
}
lines.push('- **People built:** '+num(s.built)+' (skipped: '+num(s.heldSkipped)+' already held, '+num(s.dupes)+' duplicate in the pull, '+num(s.dnc)+' on the DNC table)');
lines.push('- **Written (rows in the writer\'s answers):** '+num(s.written)+' in '+num(s.writeRequests)+' requests of up to ten');
lines.push('- **Coverage:** '+covered+' of '+companiesIn+' companies with at least one person ('+pct+'%)');
lines.push('- **Zero-contact companies:** '+num(s.zero)+(zd.length?' ('+zd.slice(0,20).join(', ')+(zd.length>20?', ...':'')+')':''));
if(!isArk) lines.push('- **Contacts Pulled At stamped:** '+num(s.stamped));
if(s.arkStopped) lines.push('', '**The AI-Ark lane stopped submitting: eight exports in a row came back HTTP 429. '+num(s.arkUnserved)+' companies were not served and no further call was made.**');
if(s.allFailed) lines.push('', '**Every paid call in this pass failed after retry.**'+(isArk?'':' The parent launches no further batches.'));
if(failed.length){
  const byReason={}; for(const f of failed){ const k=f.tier+': '+f.reason; byReason[k]=(byReason[k]||0)+1; }
  lines.push('', '**Failures ('+failed.length+')**');
  for(const [r,c] of Object.entries(byReason).slice(0,10)) lines.push('- '+c+' x '+r);
  for(const r of (Array.isArray(s.failReasons)?s.failReasons:[]).slice(0,5)) lines.push('- '+r);
}
const status=s.allFailed?'Failed':(failed.length?'Succeeded with errors':'Succeeded');
const log={
  'Execution ID': String(inp.logKey),
  'Automation': 'Waterfall Contacts Batch',
  'Status': status,
  'Trigger': 'event',
  'Errors': failed.length,
  'Run at': inp.startedAt,
  'Target': (inp.peopleTableName||'People')+' ('+(inp.peopleTableId||'')+')',
  'Records In': companiesIn,
  'Records Out': num(s.written),
  'Duration s': dur,
  'Description': lines.join('\n'),
  'Tally': JSON.stringify(s),
  'Execution Link': 'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id
};
if(inp.clientRecId) log['Client']=[inp.clientRecId];
return [{ json: log }];
