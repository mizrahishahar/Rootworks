// Build Log: one row per run on the launch row, status computed from failed[], skips
// separated from errors, Client attached (a run serves exactly one client). The coverage
// funnel is the point: companies in, per source called / returned / kept / credits,
// companies with at least one person, the zero-contact count, the waterfall hand-over.
const p=$('Launch Params').first().json;
let cfg={}; try{ cfg=$('Find Tables').first().json||{}; }catch(e){}
let pick={ viewRows:0, noDomain:0, duplicate:0, capped:0, picked:0 };
try{ const j=$('Pick Companies').first().json||{}; if(j._stats) pick=j._stats; }catch(e){}
let mk={ heldRows:0, heldCompanies:0, companiesIn:0, batches:0 };
try{ const j=$('Make Batches').first().json||{}; if(j._stats) mk=j._stats; }catch(e){}
const zero=()=>({ called:0, returned:0, kept:0, credits:0, errors:0, firstError:'' });
let t={ batches:0, companies:0, contagen:zero(), supersoniq:zero(), aiark:zero(), built:0, heldSkipped:0, dupes:0, dnc:0, written:0, writeErrors:0, stamped:0, stampErrors:0, covered:0, zero:0, zeroDomains:[], failReasons:[] };
try{ const raw=$('Loop Control').first().json.Tally; if(raw){ t=Object.assign(t, JSON.parse(raw)); } }catch(e){}
let wv=null; try{ wv=$('Find Waterfall View').first().json||null; }catch(e){}
let door=null; try{ door=$('Fire Waterfall').first().json||null; }catch(e){}
const num=(v)=>Number(v)||0;
const failed=[];
const tierName={ contagen:'ContaGen', supersoniq:'Supersoniq', aiark:'AI-Ark' };
for(const k of ['contagen','supersoniq','aiark']){ const s=t[k]||zero(); for(let i=0;i<num(s.errors);i++) failed.push({ tier:tierName[k], reason: s.firstError||'call failed' }); }
for(let i=0;i<num(t.writeErrors);i++) failed.push({ tier:'People upsert', reason:'no record id came back' });
for(let i=0;i<num(t.stampErrors);i++) failed.push({ tier:'Contacts Pulled At stamp', reason:'update returned no record id' });
if(wv&&!wv.metaOk) failed.push({ tier:'Waterfall hand-over', reason:'the base meta could not be read after the upsert, the view check did not run' });
if(door&&door.error) failed.push({ tier:'Waterfall hand-over', reason:'door call errored: '+String(door.error.message||'').slice(0,100)+' (a timeout means the door took the job and is still working)' });
if(door&&door.statusCode!==undefined&&!(num(door.statusCode)>=200&&num(door.statusCode)<300)) failed.push({ tier:'Waterfall hand-over', reason:'door HTTP '+door.statusCode });
let dur=0; try{ dur=Math.max(0,Math.round(($now.toMillis()-new Date(p.startedAt).getTime())/1000)); }catch(e){}
const companiesIn=num(pick.picked);
const covered=num(t.covered);
const pct=companiesIn?Math.round(100*covered/companiesIn):0;
const tier=(label,s)=>'- **'+label+':** called '+num(s.called)+', returned '+num(s.returned)+', kept '+num(s.kept)+', credits '+(Math.round(num(s.credits)*100)/100)+(num(s.errors)?', errors '+num(s.errors):'');
const on=(s)=>(p.sources||[]).indexOf(s)>-1;
const zd=Array.isArray(t.zeroDomains)?t.zeroDomains:[];
const lines=[
  '**'+companiesIn+' companies in, '+num(t.written)+' people written into '+(cfg.peopleTableName||'People')+', '+covered+' of '+companiesIn+' covered ('+pct+'%)**',
  '',
  '**Scope:** one client, Companies view "'+p.view+'", Max companies '+num(p.maxCompanies)+(p.tag?', Tag "'+p.tag+'"':''),
  '**Sources:** '+(p.sources||[]).join(', '),
  '**Departments:** '+((p.departments||[]).length?(p.departments||[]).join(', '):'blank (no department filter)')+((p.cgDepartments||[]).length?'; DiscoLike gets '+(p.cgDepartments||[]).join(', '):'')+((p.departmentsUnmapped||[]).length?'; no DiscoLike home for '+(p.departmentsUnmapped||[]).join(', '):''),
  '**Cap per company:** by band, 1-10 four, 11-50 six, 51-200 ten, 201 and up twelve (per source at ContaGen and Supersoniq, absolute at AI-Ark)',
  '',
  '**Funnel**',
  '- **Companies in:** '+companiesIn+' ('+num(pick.viewRows)+' view rows, '+num(mk.batches)+' batches of 250)',
  '- **Already held (tier zero):** '+num(mk.heldRows)+' people at '+num(mk.heldCompanies)+' companies'
];
if(on('ContaGen')) lines.push(tier('ContaGen', t.contagen||zero()));
if(on('Supersoniq')) lines.push(tier('Supersoniq', t.supersoniq||zero()));
if(on('AI-Ark')) lines.push(tier('AI-Ark', t.aiark||zero()));
lines.push('- **People built:** '+num(t.built)+' (skipped: '+num(t.heldSkipped)+' already held, '+num(t.dupes)+' duplicate in the pull, '+num(t.dnc)+' on the DNC table)');
lines.push('- **Written (record id returned):** '+num(t.written));
lines.push('- **Coverage:** '+covered+' of '+companiesIn+' companies with at least one person ('+pct+'%)');
lines.push('- **Zero-contact companies:** '+num(t.zero)+(zd.length?' ('+zd.slice(0,20).join(', ')+(zd.length>20?', ...':'')+')':''));
lines.push('- **Contacts Pulled At stamped:** '+num(t.stamped));
lines.push('');
const skips=[];
if(!companiesIn) lines.push('**Waterfall:** not fired, nothing was pulled');
else if(wv&&wv.hasView){ const st=door&&door.statusCode!==undefined?('door HTTP '+door.statusCode):(door&&door.error?'door call errored':'fired'); lines.push('**Waterfall:** handed over view "'+wv.viewName+'" on '+(cfg.peopleTableName||'People')+' ('+(cfg.peopleTableId||'')+') to the email door ('+st+'); the email waterfall writes its own row'); }
else { lines.push('**Waterfall:** skipped, People has no view named "Relevant & Not Waterfalled"'); skips.push('waterfall hand-over, People has no view "Relevant & Not Waterfalled"'); }
if(pick.noDomain) skips.push(num(pick.noDomain)+' view rows without a domain');
if(pick.duplicate) skips.push(num(pick.duplicate)+' duplicate domains in the view');
if(pick.capped) skips.push(num(pick.capped)+' view rows beyond Max companies');
if(!companiesIn) skips.push('view "'+p.view+'" had no rows to work');
if((p.departmentsUnmapped||[]).length) skips.push('departments with no DiscoLike value: '+(p.departmentsUnmapped||[]).join(', '));
if(skips.length) lines.push('', '**Skipped ('+skips.join('; ')+')**');
if(failed.length){
  const byReason={}; for(const f of failed){ const k=f.tier+': '+f.reason; byReason[k]=(byReason[k]||0)+1; }
  lines.push('', '**Failures ('+failed.length+')**');
  for(const [r,c] of Object.entries(byReason).slice(0,10)) lines.push('- '+c+' x '+r);
  for(const r of (Array.isArray(t.failReasons)?t.failReasons:[]).slice(0,5)) lines.push('- '+r);
}
const log={
  'Automation':'Waterfall Contacts',
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
  'Execution Link':'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id,
  'Execution ID': String($execution.id),
  'Client': [p.clientRecId]
};
return [{ json: log }];
