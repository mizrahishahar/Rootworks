// Build Run Log: the one row this run writes, per the logging standard. Status computed from
// failed[], skips separated (hard lines, closed, ICP, DNC, no domain), the Description is the
// whole funnel. Every node reference is guarded: a branch that never ran reads as 0.
// Reused from Handle Hiring Intent Signal; diffs: the Automation name, the source-parse node
// name and its stats keys (reviews in place of jobs), the drop-line labels, no in-role line.
const sd=$getWorkflowStaticData('global'); const rs=sd.runStartedAt||0;
let cfg={}; try{ cfg=$('Parse Play').first().json||{}; }catch(e){ try{ cfg=$('Parse Launch').first().json||{}; }catch(e2){} }
let base=''; try{ base=$('Client Vars').first().json.base||''; }catch(e){}
let tbl={}; try{ tbl=$('Verify Extras').first().json||{}; }catch(e){ try{ tbl=$('Find Companies Table').first().json||{}; }catch(e2){} }
const nf=(x)=>Number(x||0).toLocaleString('en-US');
const failed=[]; const skips=[];

let fq={ reviews_in:0, meta_rows:0, companies_in:0, qualified:0, drops:{} };
try{ const s=$('Filter & Qualify Reviews').first().json._stats; if(s) fq=s; }catch(e){}
const d=fq.drops||{};
const dropLine=['not negative (belt) '+nf(d.not_negative),'no domain '+nf(d.no_domain),'hosted platform '+nf(d.hosted_platform),'wrong country '+nf(d.country),'duplicate '+nf(d.duplicate)].join(' · ');
const hardDropped=Math.max(0,(fq.companies_in||0)-(fq.qualified||0));

let bz={ called:0, matched:0, unknown:0, closed:0, errors:0, failed:[] }; let closedList=[];
try{ const f=$('Company Facts').first().json; if(f&&f._stats) bz=f._stats; closedList=(f&&f.closed)||[]; }catch(e){}
for(const f of (bz.failed||[])) failed.push(f);

let icp={ checked:0, yes:0, partial:0, no:0, missing:0, error:'', rejected:[] }; let polls=0;
try{ const s=$('Apply ICP').first().json._stats; if(s) icp=s; }catch(e){}
try{ polls=Number($('Poll Check').last().json.passes)||0; }catch(e){}
if(icp.error) failed.push({ tier:'ICP check', name:'task', reason:icp.error });

let bc={ icp:0, no_domain:0, dnc:0, created:0, updated:0, kept:0, failed:[] };
try{ const s=$('Build Companies').first().json._stats; if(s) bc=s; }catch(e){}
for(const f of (bc.failed||[])) failed.push(f);

let upserted=0; const upsertErr=[];
try{ for(const it of $('Upsert Companies').all()){ const j=it.json||{}; if(j.id) upserted++; else { const e=j.error||{}; const why=(e.description&&String(e.description).replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim())||e.message||j.message||'no record id came back'; upsertErr.push({ tier:'Upsert', name:(j.fields&&j.fields.Domain)||('item '+((e.context&&e.context.itemIndex)!=null?e.context.itemIndex:'?')), reason:String(why).slice(0,140) }); } } }catch(e){}
for(const f of upsertErr) failed.push(f);
const gap=Math.max(0,(bc.kept||0)-upserted-upsertErr.length);
if(gap) failed.push({ tier:'Upsert', name:gap+' row(s)', reason:'no record id came back' });

if(hardDropped||d.not_negative||d.no_domain||d.hosted_platform) skips.push(nf(hardDropped)+' companies failed the hard lines (review rows: '+dropLine+')');
if(bz.closed) skips.push(nf(bz.closed)+' reported closed by BizData'+(closedList.length?' ('+closedList.join(', ')+')':''));
if((icp.no||0)+(icp.missing||0)) skips.push(nf((icp.no||0)+(icp.missing||0))+' failed the ICP check');
if(bc.dnc) skips.push(nf(bc.dnc)+' on the DNC table');
if(bc.no_domain) skips.push(nf(bc.no_domain)+' no domain');

const errs=failed.length;
const status=errs?'Succeeded with errors':'Succeeded';
const rejLines=(icp.rejected||[]).slice(0,10).map(r=>'- '+r.domain+' ('+r.fit+'): '+r.reason);
const extras=tbl.extrasCreated||[];
const lines=[
  '**'+nf(upserted)+' companies stamped into '+(tbl.tableName||'Companies')+' ('+nf(bc.created)+' new, '+nf(bc.updated)+' signalled again) from '+nf(fq.reviews_in)+' review rows, '+errs+' error'+(errs===1?'':'s')+'**',
  '',
  '**Signal:** '+(cfg.play_name||cfg.play||'')+(cfg.legacy_launch_id?' (legacy launch id, update the Apify webhook to the Signals record id)':'')+' · **Type:** '+(cfg.event_type||'')+' · **Table:** '+(tbl.tableName||'Companies')+(tbl.tableId?' ('+tbl.tableId+')':'')+' in '+(base||''),
  '',
  '**Funnel**',
  '- **Review rows scraped:** '+nf(fq.reviews_in)+' at '+nf(fq.companies_in)+' companies'+(fq.meta_rows?' (+'+nf(fq.meta_rows)+' company-metadata rows)':''),
  '- **Past the hard lines:** '+nf(fq.qualified),
  '- **BizData:** matched '+nf(bz.matched)+' · unknown '+nf(bz.unknown)+' · closed '+nf(bz.closed)+' · errors '+nf(bz.errors),
  '- **ICP check:** '+nf(icp.checked)+' checked in '+nf(polls)+' poll'+(polls===1?'':'s')+' · yes '+nf(icp.yes)+' · partial (kept) '+nf(icp.partial)+' · no '+nf(icp.no)+(icp.missing?' · no verdict '+nf(icp.missing):''),
  '- **Rows built:** '+nf(bc.kept)+' ('+nf(bc.created)+' new with Domain Source = Signal, '+nf(bc.updated)+' existing updated in place)',
  '- **Upserted (record id returned):** '+nf(upserted),
  '',
  '**Extras created on Companies:** '+(extras.length?extras.join(', '):'none, all present'),
  '',
  '**Contacts:** none here; the nightly Waterfall Contacts run covers the Uncovered view. **Enrollment:** the deploy doors feed campaigns from the views (Signal link on Campaigns).'
];
if(rejLines.length) lines.push('','**ICP rejected ('+nf((icp.rejected||[]).length)+')**\n'+rejLines.join('\n')+((icp.rejected||[]).length>10?'\n- ...and '+((icp.rejected||[]).length-10)+' more':''));
if(failed.length) lines.push('','**FAILED ('+failed.length+')**\n'+failed.slice(0,8).map(f=>'- '+f.tier+' · '+(f.name||'?')+': '+(f.reason||'')).join('\n')+(failed.length>8?'\n- ...and '+(failed.length-8)+' more':''));
if(skips.length) lines.push('','**Skipped**\n'+skips.map(s=>'- '+s).join('\n'));
const row={
 'Automation':'Handle Service Reviews Intent Signal',
 'Status':status,
 'Run at': $now.toISO(),
 'Records In': fq.reviews_in||0,
 'Records Out': upserted,
 'Errors': errs,
 'Target': (tbl.tableName||'Companies')+(tbl.tableId?' ('+tbl.tableId+')':''),
 'Trigger':'webhook',
 'Execution ID': String($execution.id),
 'Execution Link': 'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id,
 'Duration s': Math.round(($now.toMillis() - (rs||$now.toMillis()))/1000),
 'Description': lines.join('\n')
};
if(cfg.client) row['Client']=[cfg.client];
return [{json:row}];
