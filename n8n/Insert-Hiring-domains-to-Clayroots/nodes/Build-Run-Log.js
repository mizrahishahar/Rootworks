// Build Run Log: the one row this run writes, per the logging standard. Status computed from
// failed[], skips separated (hard lines, closed, ICP rejects with reasons, DNC from the helper's
// counters, no domain), the Description is the whole funnel. Every node reference is guarded: a
// branch that never ran reads as 0. Records Out is what the helper Insert domains to Clayroots
// landed; the Waterfall Contacts hand-off is stated when it fired.
const sd=$getWorkflowStaticData('global'); const rs=sd.runStartedAt||0;
let cfg={}; try{ cfg=$('Parse Play').first().json||{}; }catch(e){ try{ cfg=$('Parse Launch').first().json||{}; }catch(e2){} }
let base=''; try{ base=$('Client Vars').first().json.base||''; }catch(e){}
let tbl={}; try{ tbl=$('Find Companies Table').first().json||{}; }catch(e){}
const nf=(x)=>Number(x||0).toLocaleString('en-US');
const failed=[]; const skips=[];

let fq={ jobs_in:0, qualified:0, drops:{} };
try{ const s=$('Filter & Qualify Jobs').first().json._stats; if(s) fq=s; }catch(e){}
const d=fq.drops||{};
const dropLine=['country '+nf(d.country),'staffing '+nf((d.staffing_name||0)+(d.staffing_industry||0)),'body shop '+nf(d.body_shop),'over max employees '+nf(d.headcount),'no domain '+nf(d.no_domain),'hosted platform '+nf(d.hosted_platform),'duplicate '+nf(d.duplicate)].join(' · ');
const hardDropped=Math.max(0,(fq.jobs_in||0)-(fq.qualified||0));

let bz={ called:0, matched:0, unknown:0, closed:0, errors:0, failed:[] }; let closedList=[];
try{ const f=$('Company Facts').first().json; if(f&&f._stats) bz=f._stats; closedList=(f&&f.closed)||[]; }catch(e){}
for(const f of (bz.failed||[])) failed.push(f);

let icp={ checked:0, yes:0, partial:0, no:0, missing:0, error:'', rejected:[] }; let polls=0;
try{ const s=$('Apply ICP').first().json._stats; if(s) icp=s; }catch(e){}
try{ polls=Number($('Poll Check').last().json.passes)||0; }catch(e){}
if(icp.error) failed.push({ tier:'ICP check', name:'task', reason:icp.error });

let fm={ icp:0, no_domain:0, new:0, existing:0, kept:0, in_role:{ yes:0, no:0, unknown:0 }, failed:[] };
try{ const s=$('Format Companies').first().json._stats; if(s) fm=s; }catch(e){}
for(const f of (fm.failed||[])) failed.push(f);
const ir=fm.in_role||{};

// The helper's counters: the only truth about what landed. Absent when nothing was formatted.
let hp=null; try{ hp=$('Read Counters').first().json||null; }catch(e){}
const landed=hp?Number(hp.landed||0):0;
for(const f of ((hp&&hp.failed)||[])) failed.push(f);
if(hp&&fm.kept&&!landed&&!(hp.failed||[]).length&&!hp.dnc) failed.push({ tier:'Insert domains', name:nf(fm.kept)+' row(s)', reason:'formatted but the helper reported nothing landed' });

let waterfall=false; try{ waterfall=!!$('Waterfall Call').first().json; }catch(e){}

if(hardDropped) skips.push(nf(hardDropped)+' failed the hard lines: '+dropLine);
if(bz.closed) skips.push(nf(bz.closed)+' reported closed by BizData'+(closedList.length?' ('+closedList.join(', ')+')':''));
if((icp.no||0)+(icp.missing||0)) skips.push(nf((icp.no||0)+(icp.missing||0))+' failed the ICP check');
if(hp&&hp.dnc) skips.push(nf(hp.dnc)+' on the DNC table (helper)');
if(fm.no_domain) skips.push(nf(fm.no_domain)+' no domain');

const errs=failed.length;
const status=errs?'Succeeded with errors':'Succeeded';
const rejLines=(icp.rejected||[]).slice(0,10).map(r=>'- '+r.domain+' ('+r.fit+'): '+r.reason);
const helperLine=hp?('created '+nf(hp.created)+' · updated '+nf(hp.updated)+' · DNC skipped '+nf(hp.dnc)+' · landed '+nf(landed)):'not called (nothing to land)';
const lines=[
  '**'+nf(landed)+' companies landed in '+(tbl.tableName||'Companies')+' via Insert domains to Clayroots ('+nf(fm.new)+' new, '+nf(fm.existing)+' signalled again) from '+nf(fq.jobs_in)+' jobs, '+errs+' error'+(errs===1?'':'s')+'**',
  '',
  '**Signal:** '+(cfg.play_name||cfg.play||'')+(cfg.legacy_launch_id?' (legacy launch id, update the Apify webhook to the Signals record id)':'')+' · **Type:** '+(cfg.event_type||'')+' · **Table:** '+(tbl.tableName||'Companies')+(tbl.tableId?' ('+tbl.tableId+')':'')+' in '+(base||''),
  '',
  '**Funnel**',
  '- **Jobs scraped:** '+nf(fq.jobs_in),
  '- **Past the hard lines:** '+nf(fq.qualified),
  '- **BizData:** matched '+nf(bz.matched)+' · unknown '+nf(bz.unknown)+' · closed '+nf(bz.closed)+' · errors '+nf(bz.errors),
  '- **ICP check:** '+nf(icp.checked)+' checked in '+nf(polls)+' poll'+(polls===1?'':'s')+' · yes '+nf(icp.yes)+' · partial (kept) '+nf(icp.partial)+' · no '+nf(icp.no)+(icp.missing?' · no verdict '+nf(icp.missing):''),
  '- **First hire (Existing In Role):** yes '+nf(ir.yes)+' · no '+nf(ir.no)+' · unknown '+nf(ir.unknown),
  '- **Rows formatted:** '+nf(fm.kept)+' ('+nf(fm.new)+' not yet in Companies, '+nf(fm.existing)+' existing, Signals unioned)',
  '- **Insert domains to Clayroots:** '+helperLine,
  '',
  '**Contacts:** '+(waterfall?'Waterfall Contacts fired as a sub-workflow (Companies · Not Sourced · ContaGen, Supersoniq, AI-Ark · cap 5,000); its own run-log row carries the pull.':'Waterfall Contacts not fired (nothing landed).')+' **Enrollment:** the deploy doors feed campaigns from the views (Signal link on Campaigns).'
];
if(rejLines.length) lines.push('','**ICP rejected ('+nf((icp.rejected||[]).length)+')**\n'+rejLines.join('\n')+((icp.rejected||[]).length>10?'\n- ...and '+((icp.rejected||[]).length-10)+' more':''));
if(failed.length) lines.push('','**FAILED ('+failed.length+')**\n'+failed.slice(0,8).map(f=>'- '+f.tier+' · '+(f.name||'?')+': '+(f.reason||'')).join('\n')+(failed.length>8?'\n- ...and '+(failed.length-8)+' more':''));
if(skips.length) lines.push('','**Skipped**\n'+skips.map(s=>'- '+s).join('\n'));
const row={
 'Automation':'Insert Hiring domains to Clayroots',
 'Status':status,
 'Run at': $now.toISO(),
 'Records In': fq.jobs_in||0,
 'Records Out': landed,
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
