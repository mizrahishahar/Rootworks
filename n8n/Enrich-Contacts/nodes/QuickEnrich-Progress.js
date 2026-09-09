// QuickEnrich Progress (one file per node, the pull keeps them apart; same code for the four): after each provider lane closes, the launch row is updated in place (ruled
// 2026-09-09: sub-workflows write no Hub rows; one row per run, refreshed after every provider).
// Reads every lane that has answered so far and writes Status Running, the running funnel and a
// Tally, on this execution's Execution ID (created here on an event run, which has no launch row).
const p=$('Launch Params').first().json;
let cfg={}; try{ cfg=$('Find Tables').first().json||{}; }catch(e){}
let plan={ companiesIn:0 }; try{ plan=$('Plan Companies').first().json||plan; }catch(e){}
const n=(v)=>Number(v)||0;
const LANES=[['Blitz','Run Blitz Lane'],['GetLeads','Run GetLeads Lane'],['QuickEnrich','Run QuickEnrich Lane'],['Supersoniq','Run Supersoniq Lane']];
const done=[]; const covered={}; const t={ returned:0, built:0, updated:0, written:0, errors:0 };
for(const [name,node] of LANES){ let j=null; try{ j=$(node).first().json||null; }catch(e){} if(!j) continue; if(j.error&&j.provider===undefined){ done.push({ name, status:'error', reason:'lane crashed: '+String((j.error&&j.error.message)||j.error).slice(0,160) }); continue; } done.push(Object.assign({ name }, j)); for(const d of (j.coveredDomains||[])) covered[d]=1; for(const k of ['returned','built','updated','written','errors']) t[k]+=n(j[k]); }
const companiesIn=n(plan.companiesIn); const cov=Object.keys(covered).length;
const next=LANES.map(l=>l[0]).filter(name=>!done.find(d=>d.name===name));
const lines=[ '**Running: '+done.length+' of 4 providers closed, '+n(t.built)+' people new, '+n(t.updated)+' held filled, '+n(t.written)+' rows written, '+cov+' of '+companiesIn+' companies covered**', '', '**Scope:** Companies view "'+p.view+'"'+(p.tag?', Tag "'+p.tag+'"':'')+', '+companiesIn+' companies', '' ];
for(const d of done){ if(d.status==='skipped') lines.push('- **'+d.name+':** skipped ('+(d.reason||'')+')'); else if(d.status==='error'&&d.called===undefined) lines.push('- **'+d.name+':** failed ('+(d.reason||'')+')'); else lines.push('- **'+d.name+':** '+n(d.chunks)+' chunks, called '+n(d.called)+', returned '+n(d.returned)+'; '+n(d.built)+' new, '+n(d.updated)+' held filled, '+n(d.written)+' written'+(n(d.errors)?', errors '+n(d.errors)+(d.reason?' ('+String(d.reason).slice(0,120)+')':''):'')); }
if(next.length) lines.push('- **Next:** '+next.join(', '));
const row={ 'Automation':'Enrich Contacts', 'Status':'Running', 'Trigger':p.trigger||'form', 'Errors':n(t.errors), 'Run at':p.startedAt, 'Target':(cfg.peopleTableName||'People')+' ('+(cfg.peopleTableId||'')+')', 'View':p.view, 'Records In':companiesIn, 'Records Out':n(t.written), 'Description':lines.join('\n'), 'Tally':JSON.stringify({ lanes:done.map(d=>({ name:d.name, status:d.status, written:n(d.written) })), covered:cov }), 'Execution Link':'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id, 'Execution ID':String($execution.id) };
if(p.clientRecId) row['Client']=[p.clientRecId];
return [{ json:row }];
