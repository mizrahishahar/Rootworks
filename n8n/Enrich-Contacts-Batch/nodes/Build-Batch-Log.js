// Build Batch Log: this pass's own Hub row: Execution ID "<parentExecId>-<n>", Automation
// "Enrich Contacts Batch", Client attached, Records In = companies in, Records Out = people
// written, Description = one line per provider (its verdict and counters) then the merge, the
// writer, the stamps and the coverage; Tally = the counters JSON the parent sums once every pass
// row landed. Status computed: Failed when every provider that was asked answered error (the pass
// did no work; the parent stops launching), Succeeded with errors when failed[] is not empty,
// Succeeded otherwise. A provider that was skipped (no credential, out of credits, nothing to
// ask) is a Skipped line, never an error (ruled 2026-09-08: the run moves on).
const inp=$('Batch Input').first().json;
const s=Object.assign({}, $('Batch Summary').first().json||{});
const num=(v)=>Number(v)||0;
const PRIORITY=['Blitz','GetLeads','QuickEnrich','Supersoniq'];
const failed=[]; const skips=[];
for(const p of PRIORITY){
  const x=(s.providers||{})[p]||{};
  if(x.status==='skipped'){ skips.push(p+': '+(x.reason||'skipped')); continue; }
  if(x.status==='error'){ failed.push({ tier:p, reason:x.reason||x.firstError||'failed' }); continue; }
  for(let i=0;i<num(x.errors);i++) failed.push({ tier:p, reason:x.firstError||'call failed' });
}
for(let i=0;i<num(s.writeErrors);i++) failed.push({ tier:'People writer', reason:'row not in the answer' });
for(let i=0;i<num(s.stampErrors);i++) failed.push({ tier:'Contacts Pulled At stamp', reason:'row not in the answer' });
let dur=0; try{ dur=Math.max(0,Math.round(($now.toMillis()-new Date(inp.startedAt).getTime())/1000)); }catch(e){}
const companiesIn=num(s.companiesIn), covered=num(s.covered), pct=companiesIn?Math.round(100*covered/companiesIn):0;
const line=(p)=>{ const x=(s.providers||{})[p]||{}; const e=x.extra||{}; if(x.status==='skipped') return '- **'+p+':** skipped ('+(x.reason||'')+')'; if(x.status==='error') return '- **'+p+':** failed ('+(x.reason||x.firstError||'')+')'; const bits=['called '+num(x.called),'returned '+num(x.returned),'kept '+num(x.kept)]; if(num(x.credits)) bits.push('credits '+x.credits); if(num(e.resolved)||num(e.unresolved)) bits.push(num(e.resolved)+' companies resolved on LinkedIn, '+num(e.unresolved)+' not'); if(num(e.rosterRows)) bits.push('roster '+num(e.rosterRows)+', emails '+num(e.emails)); if(num(e.dropped)) bits.push(num(e.dropped)+' at domains not asked dropped'); if(num(e.emailBlanked)) bits.push(num(e.emailBlanked)+' foreign-domain emails blanked'); if(num(x.errors)) bits.push('errors '+num(x.errors)); return '- **'+p+':** '+bits.join(', '); };
const t=s.tiers||{};
const lines=[ '**Batch '+num(s.batchNum)+' of '+num(s.batchCount)+': '+companiesIn+' companies in, '+num(s.built)+' people new, '+num(s.updated)+' held people filled, '+num(s.written)+' rows written, '+covered+' of '+companiesIn+' covered ('+pct+'%)**', '',
  '**Parent run:** '+inp.parentExecId+' (this row is one pass of it; the parent sums the passes)',
  '**Cap and floor:** '+String(s.capRule||'up to 50 employees or unknown: 20 wide; 51 to 500: 30 non-junior; 501 and up: 50 manager and up')+' (this batch: '+num(t.wide)+' wide, '+num(t.nonjunior)+' non-junior, '+num(t.manager)+' manager and up)',
  '', '**Providers (every one asked for every company; priority Blitz, GetLeads, QuickEnrich, Supersoniq)**' ];
for(const p of PRIORITY) lines.push(line(p));
lines.push('', '**Merge**');
lines.push('- **Returned:** '+num(s.returned)+' people across providers; **new rows:** '+num(s.built)+'; **held rows filled:** '+num(s.updated)+' ('+num(s.emailsAppended)+' emails appended); **held unchanged:** '+num(s.heldUnchanged)+'; **same person from two providers:** '+num(s.dupes)+' merged; **no usable first name:** '+num(s.noKey)+'; **LinkedIn URLs rejected by the name fence:** '+num(s.fenced)+'; **on the DNC table:** '+num(s.dnc));
const pp=s.perProvider||{};
lines.push('- **Per provider:** '+PRIORITY.map(p=>{ const x=pp[p]||{}; return p+' '+num(x.newRows)+' new / '+num(x.mergedInto)+' merged'; }).join('; '));
if(s.singleSelectSource) lines.push('- **Contact Source is a single select on this base:** only the first source per person was recorded; retype it to a multi-select to record every provider');
lines.push('- **Written (rows in the writer\'s answers):** '+num(s.written)+' in '+num(s.writeRequests)+' requests of up to ten ('+num(s.updatedWritten)+' updates of held rows)');
lines.push('- **Coverage:** '+covered+' of '+companiesIn+' companies with at least one person ('+pct+'%)');
const zd=Array.isArray(s.zeroDomains)?s.zeroDomains:[];
lines.push('- **Zero-contact companies:** '+num(s.zero)+(zd.length?' ('+zd.slice(0,20).join(', ')+(zd.length>20?', ...':'')+')':''));
lines.push('- **Contacts Pulled At stamped:** '+num(s.stamped));
if(skips.length) lines.push('', '**Skipped ('+skips.join('; ')+')**');
if(s.allFailed) lines.push('', '**Every provider that was asked failed. The parent launches no further batches.**');
if(failed.length){
  const byReason={}; for(const f of failed){ const k=f.tier+': '+f.reason; byReason[k]=(byReason[k]||0)+1; }
  lines.push('', '**Failures ('+failed.length+')**');
  for(const [r,c] of Object.entries(byReason).slice(0,10)) lines.push('- '+c+' x '+r);
  for(const r of (Array.isArray(s.failReasons)?s.failReasons:[]).slice(0,5)) lines.push('- '+r);
}
const status=s.allFailed?'Failed':(failed.length?'Succeeded with errors':'Succeeded');
const log={
  'Execution ID': String(inp.logKey),
  'Automation': 'Enrich Contacts Batch',
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
