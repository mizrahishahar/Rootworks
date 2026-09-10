// Lane Progress: after a provider's last chunk closed, the launch row is refreshed in place (ruled
// 2026-09-09: one row per run, refreshed after every provider; sub-workflows write no Hub rows).
// Reads the accumulators in this execution's static data and writes Status Running, the running
// funnel and a Tally, on this execution's Execution ID (created here on an event run).
const p=$('Launch Params').first().json;
let cfg={}; try{ cfg=$('Find Tables').first().json||{}; }catch(e){}
let plan={ companiesIn:0 }; try{ plan=$('Plan Companies').first().json||plan; }catch(e){}
const run=$getWorkflowStaticData('global').run||{ order:[], lanes:{} };
const n=(v)=>Number(v)||0;
const laneOut=(name)=>{ const a=run.lanes[name]; if(!a||!a.closed) return null; return { name, status:a.skipped?'skipped':((a.called&&a.errors>=a.called&&!a.written)?'error':'ok'), reason:a.skipped||a.firstError||'', chunks:a.chunks, called:a.called, returned:a.returned, kept:a.kept, credits:a.credits, errors:a.errors, built:a.built, updated:a.updated, written:a.written, writeErrors:a.writeErrors, covered:Object.keys(a.coveredDomains||{}), gate:a.gate }; };
const done=run.order.map(laneOut).filter(Boolean);
const covered={}; const t={ returned:0, built:0, updated:0, written:0, errors:0 };
for(const d of done){ for(const x of d.covered) covered[x]=1; for(const k of ['returned','built','updated','written','errors']) t[k]+=n(d[k]); }
const companiesIn=n(plan.companiesIn); const cov=Object.keys(covered).length;
const next=run.order.filter(name=>!done.find(d=>d.name===name));
const lines=[ '**Running: '+done.length+' of '+run.order.length+' providers closed, '+n(t.built)+' people new, '+n(t.updated)+' held filled, '+n(t.written)+' rows written, '+cov+' of '+companiesIn+' companies covered**', '', '**Scope:** Companies view "'+p.view+'"'+(p.tag?', Tag "'+p.tag+'"':'')+', '+companiesIn+' companies', '' ];
for(const d of done){ if(d.status==='skipped') lines.push('- **'+d.name+':** skipped ('+d.reason+')'); else lines.push('- **'+d.name+':** '+n(d.chunks)+' chunks, called '+n(d.called)+', returned '+n(d.returned)+'; '+n(d.built)+' new, '+n(d.updated)+' held filled, '+n(d.written)+' written'+(n(d.errors)?', errors '+n(d.errors)+(d.reason?' ('+String(d.reason).slice(0,120)+')':''):'')+(d.gate?'; gate: asked '+n(d.gate.asked)+' of '+n(d.gate.companiesIn):'')); }
if(next.length) lines.push('- **Next:** '+next.join(', '));
const row={ 'Automation':'Enrich Contacts', 'Status':'Running', 'Trigger':p.trigger||'form', 'Errors':n(t.errors), 'Run at':p.startedAt, 'Target':(cfg.peopleTableName||'People')+' ('+(cfg.peopleTableId||'')+')', 'View':p.view, 'Records In':companiesIn, 'Records Out':n(t.written), 'Description':lines.join('\n'), 'Tally':JSON.stringify({ lanes:done.map(d=>({ name:d.name, status:d.status, written:n(d.written) })), covered:cov }), 'Execution Link':'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id, 'Execution ID':String($execution.id) };
if(p.clientRecId) row['Client']=[p.clientRecId];
return [{ json:row }];
