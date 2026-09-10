// Build Log: the launch row, written once after the four lanes closed, the companies were stamped
// and the single email hand-off was made or skipped. Each lane answered with its counters (its own
// Hub row "<exec>-<lane>" carries the detail); they are summed here. Status computed from failed[],
// skips separated from errors, Client attached.
const p=$('Launch Params').first().json;
let cfg={}; try{ cfg=$('Find Tables').first().json||{}; }catch(e){}
let pick={ viewRows:0, noDomain:0, duplicate:0, picked:0, outOfScope:0, scoped:0 };
try{ const j=$('Pick Companies').first().json||{}; if(j._stats) pick=j._stats; }catch(e){}
let plan={ companiesIn:0, tiers:{}, dncDomains:[] }; try{ plan=$('Plan Companies').first().json||plan; }catch(e){}
const num=(v)=>Number(v)||0;
// The lanes are the per-provider accumulators of this execution (static data), filled by Chunk Tick.
const run=$getWorkflowStaticData('global').run||{ order:['Blitz','GetLeads','QuickEnrich','Supersoniq'], lanes:{} };
const LANES=run.order.map(name=>[name,name]);
const lanes={}; const covered={};
for(const [name] of LANES){ const a=run.lanes[name]; if(!a||!a.chunks&&!a.closed) { lanes[name]={ status:'error', reason:'lane did not run' }; continue; } lanes[name]={ status:a.skipped?'skipped':((a.called&&a.errors>=a.called&&!a.written)?'error':'ok'), reason:a.skipped||a.firstError||'', chunks:a.chunks, called:a.called, returned:a.returned, kept:a.kept, credits:a.credits, errors:a.errors, built:a.built, updated:a.updated, dupes:a.dupes, fenced:a.fenced, emailsAppended:a.emailsAppended, dnc:a.dnc, written:a.written, writeErrors:a.writeErrors, singleSelectSource:!!a.singleSelectSource, gate:a.gate||null }; for(const d of Object.keys(a.coveredDomains||{})) covered[d]=1; }
const t={ returned:0, built:0, updated:0, dupes:0, fenced:0, emailsAppended:0, dnc:0, written:0, writeErrors:0, singleSelectSource:false };
for(const name of Object.keys(lanes)){ const l=lanes[name]; for(const k of ['returned','built','updated','dupes','fenced','emailsAppended','dnc','written','writeErrors']) t[k]+=num(l[k]); if(l.singleSelectSource) t.singleSelectSource=true; }
// stamps
let stamped=0, stampErrors=0; let sChunks=[], sResps=[];
try{ sChunks=$('Stamp Rows').all().map(i=>i.json); sResps=$('Stamp Companies').all(); }catch(e){}
const parse=(b)=>{ if(typeof b!=='string') return b; try{ return JSON.parse(b); }catch(e){ return null; } };
sResps.forEach((it,i)=>{ const c=sChunks[i]||{ size:0 }; const j=it.json||{}; if(j.error&&j.statusCode===undefined){ stampErrors+=num(c.size); return; } const status=num(j.statusCode); const b=parse(j.body===undefined?null:j.body); if(status>=200&&status<300&&b&&Array.isArray(b.records)){ stamped+=b.records.length; if(b.records.length<num(c.size)) stampErrors+=num(c.size)-b.records.length; return; } stampErrors+=num(c.size); });
// hand-off
const isFired=(j)=>{ if(!j) return false; if(j.error&&j.statusCode===undefined) return /timeout|timed out|ETIMEDOUT|ESOCKETTIMEDOUT/i.test(String((j.error&&j.error.message)||'')); const s=num(j.statusCode); return s>=200&&s<300; };
let fires=[]; try{ fires=$('Fire Waterfall').all().map(i=>i.json||{}); }catch(e){}
let views=[]; try{ views=$('Find Waterfall View').all().map(i=>i.json||{}); }catch(e){}
const fired=fires.filter(isFired).length, fireFailed=fires.length-fired;
const viewSkips=views.filter(v=>v.hasView===false&&v.metaOk).length, metaFails=views.filter(v=>!v.metaOk).length;
const failed=[]; const skips=[];
for(const [name] of LANES){ const l=lanes[name]; if(l.status==='skipped'){ skips.push(name+': '+(l.reason||'skipped')); continue; } if(l.status==='error'){ failed.push({ tier:name, reason:l.reason||'failed' }); continue; } for(let i=0;i<num(l.errors);i++) failed.push({ tier:name, reason:l.reason||'call failed' }); for(let i=0;i<num(l.writeErrors);i++) failed.push({ tier:name+' writer', reason:'row not in the answer (see the lane row)' }); }
for(let i=0;i<stampErrors;i++) failed.push({ tier:'Contacts Pulled At stamp', reason:'row not in the answer' });
for(let i=0;i<metaFails;i++) failed.push({ tier:'Email hand-over', reason:'the base meta could not be read' });
for(const j of fires){ if(!isFired(j)) failed.push({ tier:'Email hand-over', reason:(j.error&&j.statusCode===undefined)?('door call errored: '+String((j.error&&j.error.message)||'').slice(0,100)):('door HTTP '+j.statusCode) }); }
let dur=0; try{ dur=Math.max(0,Math.round(($now.toMillis()-new Date(p.startedAt).getTime())/1000)); }catch(e){}
const companiesIn=num(pick.picked); const cov=Object.keys(covered).length; const pct=companiesIn?Math.round(100*cov/companiesIn):0;
const line=(name)=>{ const l=lanes[name]; if(l.status==='skipped') return '- **'+name+':** skipped ('+(l.reason||'')+')'; if(l.status==='error'&&l.called===undefined) return '- **'+name+':** failed ('+(l.reason||'')+')'; return '- **'+name+':** '+num(l.chunks)+' chunks, called '+num(l.called)+', returned '+num(l.returned)+', kept '+num(l.kept)+(num(l.credits)?', credits '+(Math.round(num(l.credits)*100)/100):'')+'; '+num(l.built)+' new, '+num(l.updated)+' held filled, '+num(l.written)+' written'+(num(l.errors)?', errors '+num(l.errors):''); };
const tiers=plan.tiers||{};
const lines=[
  '**'+companiesIn+' companies in, '+num(t.built)+' people new, '+num(t.updated)+' held people filled, '+num(t.written)+' rows written into '+(cfg.peopleTableName||'People')+', '+cov+' of '+companiesIn+' covered ('+pct+'%)**',
  '',
  '**Scope:** one client, Companies view "'+p.view+'"'+(p.tag?', Tag "'+p.tag+'"':'')+(pick.scoped?', scoped to the caller\'s '+num(pick.scoped)+' domain(s)':''),
  '**Rule:** one loop over every chunk in provider priority order (Blitz, GetLeads, QuickEnrich, Supersoniq), each chunk its own execution (Enrich Contacts Chunk) paced to its vendor; cap and floor by the Employees value on our row ('+num(tiers.wide)+' wide, '+num(tiers.nonjunior)+' non-junior, '+num(tiers.manager)+' manager and up; Supersoniq 10 and Director and up); merge on Contact Key and LinkedIn slug, held rows filled never overwritten, emails appended; '+num((plan.dncDomains||[]).length)+' DNC domains',
  '',
  '**Funnel**',
  '- **Companies in:** '+companiesIn+' ('+num(pick.viewRows)+' view rows'+(pick.scoped?', '+num(pick.outOfScope)+' outside the scope skipped':'')+')'
];
for(const [name] of LANES) lines.push(line(name));
lines.push('- **Merge across lanes:** '+num(t.returned)+' returned; '+num(t.built)+' new rows; '+num(t.updated)+' held rows filled ('+num(t.emailsAppended)+' emails appended); '+num(t.dupes)+' same-person merges; '+num(t.fenced)+' LinkedIn URLs rejected by the name fence; '+num(t.dnc)+' on the DNC list');
if(t.singleSelectSource) lines.push('- **Contact Source is a single select on this base:** only the first source per person was recorded');
lines.push('- **Written (confirmed by Airtable):** '+num(t.written)+(num(t.writeErrors)?', '+num(t.writeErrors)+' refused':''));
lines.push('- **Coverage:** '+cov+' of '+companiesIn+' companies with at least one person ('+pct+'%)');
const gate=(lanes.Supersoniq&&lanes.Supersoniq.gate)||null;
if(gate) lines.push('- **Supersoniq gate:** asked '+num(gate.asked)+' of '+num(gate.companiesIn)+' companies ('+num(gate.skippedRelevant)+' already held '+num(gate.relevantMin)+' or more relevant people)');
lines.push('- **Contacts Pulled At stamped:** '+stamped);
lines.push('');
if(!companiesIn) lines.push('**Emails:** not fired, nothing was pulled');
else if(fires.length||viewSkips){ const bits=[]; if(fired) bits.push('Enrich Emails fired once for the whole run (People view "Not Waterfalled"; not awaited, it writes its own rows)'); if(fireFailed) bits.push('the hand-off failed'); if(viewSkips){ bits.push('the hand-off was skipped, People has no view "Not Waterfalled"'); skips.push('the email hand-over was skipped, People has no view "Not Waterfalled"'); } lines.push('**Emails:** '+bits.join('; ')); }
else lines.push('**Emails:** the hand-off did not run (the base meta could not be read)');
if(pick.noDomain) skips.push(num(pick.noDomain)+' view rows without a domain');
if(pick.duplicate) skips.push(num(pick.duplicate)+' duplicate domains in the view');
if(!companiesIn) skips.push('view "'+p.view+'" had no rows to work');
if(skips.length) lines.push('', '**Skipped ('+skips.join('; ')+')**');
if(failed.length){ const byReason={}; for(const f of failed){ const k=f.tier+': '+f.reason; byReason[k]=(byReason[k]||0)+1; } lines.push('', '**Failures ('+failed.length+')**'); for(const [r,c] of Object.entries(byReason).slice(0,12)) lines.push('- '+c+' x '+r); }
const log={ 'Automation':'Enrich Contacts', 'Status':failed.length?'Succeeded with errors':'Succeeded', 'Trigger':p.trigger||'form', 'Errors':failed.length, 'Run at':$now.toISO(), 'Target':(cfg.peopleTableName||'People')+' ('+(cfg.peopleTableId||'')+')', 'View':p.view, 'Records In':companiesIn, 'Records Out':num(t.written), 'Duration s':dur, 'Description':lines.join('\n').slice(0,95000), 'Tally':JSON.stringify(Object.assign({}, t, { lanes:Object.fromEntries(Object.entries(lanes).map(([k,v])=>[k,Object.assign({},v,{ coveredDomains:undefined })])), covered:cov, stamped, stampErrors, handoffs:{ fired, failed:fireFailed, skipped:viewSkips }, executionId:String($execution.id) })).slice(0,95000), 'Execution Link':'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id, 'Execution ID':String($execution.id), 'Client':[p.clientRecId] };
return [{ json:log }];
