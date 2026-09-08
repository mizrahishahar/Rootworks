// Build Log: the one launch-row log, written once after the last batch closed and the single email
// hand-off was made or skipped. The counters come from the pass rows: Enrich Contacts Batch writes
// one Hub row per batch keyed "<this execution>-<n>" with its counters JSON in Tally; Read Batch
// Rows pulled them by that prefix and they are summed here (no read-add-write Tally loop). Per
// provider: called, returned, kept, credits, errors, and how many batches it was skipped in and
// why. Status computed from failed[], skips separated from errors, Client attached.
const p=$('Launch Params').first().json;
let cfg={}; try{ cfg=$('Find Tables').first().json||{}; }catch(e){}
let pick={ viewRows:0, noDomain:0, duplicate:0, picked:0, outOfScope:0, scoped:0 };
try{ const j=$('Pick Companies').first().json||{}; if(j._stats) pick=j._stats; }catch(e){}
let mk={ heldRows:0, heldCompanies:0, companiesIn:0, batches:0 };
try{ const j=$('Make Batches').first().json||{}; if(j._stats) mk=j._stats; }catch(e){}
const num=(v)=>Number(v)||0;
const runs=(name)=>{ const out=[]; for(let i=0;i<10000;i++){ let it=null; try{ it=$(name).all(0,i); }catch(e){ break; } if(!it||!it.length) break; out.push(it); } return out; };
const PRIORITY=['Blitz','GetLeads','QuickEnrich','Supersoniq'];
const prov={}; for(const x of PRIORITY) prov[x]={ called:0, returned:0, kept:0, credits:0, errors:0, firstError:'', skipped:0, skipReasons:{}, failedBatches:0, okBatches:0 };
const t={ batches:0, companies:0, returned:0, built:0, updated:0, heldUnchanged:0, dupes:0, noKey:0, fenced:0, emailsAppended:0, dnc:0, written:0, updatedWritten:0, writeErrors:0, stamped:0, stampErrors:0, covered:0, zero:0, zeroDomains:[], failReasons:[], singleSelectSource:false };
const prefix=String($execution.id)+'-';
const rows={};
try{
  for(const it of $('Read Batch Rows').all()){
    const r=it.json||{}; if(!r.id||!r.fields) continue;
    const f=r.fields; const id=String(f['Execution ID']||'');
    if(id.indexOf(prefix)!==0) continue;
    const n=Number(id.slice(prefix.length))||0;
    let c=null; try{ c=JSON.parse(f.Tally||''); }catch(e){}
    if(!c||typeof c!=='object') c=null;
    rows[n]={ status:String(f.Status||''), errors:num(f.Errors), counters:c };
    if(!c) continue;
    t.batches+=1; t.companies+=num(c.companiesIn);
    for(const x of PRIORITY){ const s=(c.providers||{})[x]||{}; const d=prov[x]; if(s.status==='skipped'){ d.skipped++; const k=String(s.reason||'skipped'); d.skipReasons[k]=(d.skipReasons[k]||0)+1; continue; } if(s.status==='error'){ d.failedBatches++; d.errors+=Math.max(1,num(s.errors)); if(!d.firstError) d.firstError=String(s.reason||s.firstError||'').slice(0,300); continue; } d.okBatches++; d.called+=num(s.called); d.returned+=num(s.returned); d.kept+=num(s.kept); d.credits+=num(s.credits); d.errors+=num(s.errors); if(!d.firstError&&s.firstError) d.firstError=String(s.firstError).slice(0,300); }
    for(const k of ['returned','built','updated','heldUnchanged','dupes','noKey','fenced','emailsAppended','dnc','written','updatedWritten','writeErrors','stamped','stampErrors','covered','zero']) t[k]+=num(c[k]);
    if(c.singleSelectSource) t.singleSelectSource=true;
    t.zeroDomains=t.zeroDomains.concat(Array.isArray(c.zeroDomains)?c.zeroDomains:[]).slice(0,50);
    for(const x of (Array.isArray(c.failReasons)?c.failReasons:[])){ if(t.failReasons.length<10) t.failReasons.push(String(x).slice(0,200)); }
  }
}catch(e){}
const rowsRead=Object.keys(rows).length;
const batches=runs('Pass Result').map(r=>r[0].json||{});
const launched=batches.length;
const closed=batches.filter(x=>x.status==='closed').length;
const stopped=batches.find(x=>x.allFailed)||null;
const notLaunched=Math.max(0, num(mk.batches)-launched);
const isFired=(j)=>{ if(!j) return false; if(j.error&&j.statusCode===undefined) return /timeout|timed out|ETIMEDOUT|ESOCKETTIMEDOUT/i.test(String((j.error&&j.error.message)||'')); const s=num(j.statusCode); return s>=200&&s<300; };
const fires=runs('Fire Waterfall').map(r=>r[0].json||{});
const fired=fires.filter(isFired).length;
const fireFailed=fires.length-fired;
const views=runs('Find Waterfall View').map(r=>r[0].json||{});
const viewSkips=views.filter(v=>v.hasView===false&&v.metaOk).length;
const metaFails=views.filter(v=>!v.metaOk).length;
const failed=[]; const skips=[];
for(const x of PRIORITY){ const s=prov[x]; for(let i=0;i<num(s.errors);i++) failed.push({ tier:x, reason:s.firstError||'call failed' }); for(const [k,v] of Object.entries(s.skipReasons)) skips.push(x+' skipped in '+v+' batch'+(v===1?'':'es')+' ('+k+')'); }
for(let i=0;i<num(t.writeErrors);i++) failed.push({ tier:'People writer', reason:'row not in the answer (see the pass rows for the HTTP reason)' });
for(let i=0;i<num(t.stampErrors);i++) failed.push({ tier:'Contacts Pulled At stamp', reason:'row not in the answer' });
for(const x of batches){
  const has=!!rows[x.batchNum];
  if(x.status==='closed'){ if(!has) failed.push({ tier:'Batch '+x.batchNum, reason:'closed but no Hub row was read back under '+prefix+x.batchNum }); continue; }
  if(x.status==='allFailed') failed.push({ tier:'Batch '+x.batchNum, reason:'every provider that was asked failed ('+x.reason+'); no further batches were launched' });
  else if(x.status==='crashed') failed.push({ tier:'Batch '+x.batchNum, reason:'crashed ('+x.reason+'); no counters from it'+(has?', though its row landed and is counted':'') });
  else failed.push({ tier:'Batch '+x.batchNum, reason:x.reason||x.status });
}
for(let i=0;i<metaFails;i++) failed.push({ tier:'Waterfall hand-over', reason:'the base meta could not be read, the view check did not run' });
for(const j of fires){ if(!isFired(j)) failed.push({ tier:'Waterfall hand-over', reason:(j.error&&j.statusCode===undefined)?('door call errored: '+String((j.error&&j.error.message)||'').slice(0,100)):('door HTTP '+j.statusCode) }); }
let dur=0; try{ dur=Math.max(0,Math.round(($now.toMillis()-new Date(p.startedAt).getTime())/1000)); }catch(e){}
const companiesIn=num(pick.picked);
const covered=num(t.covered);
const pct=companiesIn?Math.round(100*covered/companiesIn):0;
const line=(x)=>{ const s=prov[x]; if(!s.okBatches&&!s.failedBatches&&s.skipped) return '- **'+x+':** skipped in every batch ('+Object.keys(s.skipReasons).join('; ')+')'; return '- **'+x+':** called '+num(s.called)+', returned '+num(s.returned)+', kept '+num(s.kept)+(num(s.credits)?', credits '+(Math.round(num(s.credits)*100)/100):'')+(num(s.errors)?', errors '+num(s.errors):'')+(s.skipped?', skipped in '+s.skipped+' batch'+(s.skipped===1?'':'es'):''); };
const zd=Array.isArray(t.zeroDomains)?t.zeroDomains:[];
const lines=[
  '**'+companiesIn+' companies in, '+num(t.built)+' people new, '+num(t.updated)+' held people filled, '+num(t.written)+' rows written into '+(cfg.peopleTableName||'People')+', '+covered+' of '+companiesIn+' covered ('+pct+'%)**',
  '',
  '**Scope:** one client, Companies view "'+p.view+'"'+(p.tag?', Tag "'+p.tag+'"':'')+(pick.scoped?', scoped to the caller\'s '+num(pick.scoped)+' domain(s)':''),
  '**Rule:** every provider asked for every company; cap per provider and seniority floor by the Employees value on our row (up to 50 or unknown: 20 wide; 51 to 500: 30 non-junior; 501 and up: 50 manager and up); merge on Contact Key and LinkedIn slug, first writer wins by priority Blitz, GetLeads, QuickEnrich, Supersoniq; emails appended; held rows filled, never overwritten',
  '',
  '**Funnel**',
  '- **Companies in:** '+companiesIn+' ('+num(pick.viewRows)+' view rows'+(pick.scoped?', '+num(pick.outOfScope)+' outside the scope skipped':'')+', '+num(mk.batches)+' batches of 100)',
  '- **Already held (tier zero):** '+num(mk.heldRows)+' people at '+num(mk.heldCompanies)+' companies'
];
for(const x of PRIORITY) lines.push(line(x));
lines.push('- **Merge:** '+num(t.returned)+' returned; '+num(t.built)+' new rows; '+num(t.updated)+' held rows filled ('+num(t.emailsAppended)+' emails appended); '+num(t.heldUnchanged)+' held unchanged; '+num(t.dupes)+' merged as the same person across providers; '+num(t.noKey)+' without a usable first name; '+num(t.fenced)+' LinkedIn URLs rejected by the name fence; '+num(t.dnc)+' on the DNC table');
if(t.singleSelectSource) lines.push('- **Contact Source is a single select on this base:** only the first source per person was recorded; retype it to a multi-select to record every provider');
lines.push('- **Written (rows in the writer\'s answers):** '+num(t.written)+' ('+num(t.updatedWritten)+' updates of held rows)');
lines.push('- **Coverage:** '+covered+' of '+companiesIn+' companies with at least one person ('+pct+'%)');
lines.push('- **Zero-contact companies:** '+num(t.zero)+(zd.length?' ('+zd.slice(0,20).join(', ')+(zd.length>20?', ...':'')+')':''));
lines.push('- **Contacts Pulled At stamped:** '+num(t.stamped));
lines.push('');
if(companiesIn){
  const bits=[launched+' batch'+(launched===1?'':'es')+' launched one at a time, '+closed+' closed', rowsRead+' pass row'+(rowsRead===1?'':'s')+' read back under "'+prefix+'*" (each pass writes its own Hub row, summed here)'];
  if(stopped) bits.push('stopped after batch '+stopped.batchNum+', every provider that was asked failed in it'+(notLaunched?', '+notLaunched+' not launched':''));
  lines.push('**Passes:** '+bits.join('; '));
}
if(!companiesIn) lines.push('**Waterfall:** not fired, nothing was pulled');
else if(fires.length||viewSkips){
  const bits=[];
  if(fired) bits.push('the hand-off fired once for the whole run'+(fired===1?'':' ('+fired+' calls, which should never happen)')+', to the email door (People view "Not Waterfalled"; the door is not awaited and the email waterfall writes its own rows)');
  if(fireFailed) bits.push('the hand-off failed'+(fireFailed===1?'':' ('+fireFailed+' calls)'));
  if(viewSkips) bits.push('the hand-off was skipped, People had no view "Not Waterfalled"');
  lines.push('**Waterfall:** '+bits.join('; '));
  if(viewSkips) skips.push('the waterfall hand-over was skipped, People has no view "Not Waterfalled"');
}
else lines.push('**Waterfall:** the one hand-off did not run (the base meta could not be read, so the view check gave no verdict)');
if(pick.noDomain) skips.push(num(pick.noDomain)+' view rows without a domain');
if(pick.duplicate) skips.push(num(pick.duplicate)+' duplicate domains in the view');
if(!companiesIn) skips.push('view "'+p.view+'" had no rows to work');
if(notLaunched&&stopped) skips.push(notLaunched+' batches not launched after batch '+stopped.batchNum+' failed every provider');
if(skips.length) lines.push('', '**Skipped ('+skips.join('; ')+')**');
if(failed.length){
  const byReason={}; for(const f of failed){ const k=f.tier+': '+f.reason; byReason[k]=(byReason[k]||0)+1; }
  lines.push('', '**Failures ('+failed.length+')**');
  for(const [r,c] of Object.entries(byReason).slice(0,12)) lines.push('- '+c+' x '+r);
  for(const r of t.failReasons.slice(0,5)) lines.push('- '+r);
}
const tally=Object.assign({}, t, { providers: prov, executionId: String($execution.id), passes: { launched: launched, closed: closed, rows: rowsRead, notLaunched: notLaunched }, handoffs: { fired: fired, failed: fireFailed, skipped: viewSkips } });
const log={
  'Automation':'Enrich Contacts',
  'Status': failed.length?'Succeeded with errors':'Succeeded',
  'Trigger': p.trigger||'form',
  'Errors': failed.length,
  'Run at': $now.toISO(),
  'Target': (cfg.peopleTableName||'People')+' ('+(cfg.peopleTableId||'')+')',
  'View': p.view,
  'Records In': companiesIn,
  'Records Out': num(t.written),
  'Duration s': dur,
  'Description': lines.join('\n'),
  'Tally': JSON.stringify(tally),
  'Execution Link':'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id,
  'Execution ID': String($execution.id),
  'Client': [p.clientRecId]
};
return [{ json: log }];
