// Build Run Log: the one row this run writes, per the logging standard. Status computed from
// failed[], skips separated, the Description is the whole funnel. Every node reference is
// guarded: a branch that never ran reads as 0.
// Reused from Handle Hiring Intent Signal; diffs: the Automation name, the source-parse node
// name and its stats keys (reviews in place of jobs), the drop-line labels, and the in-role
// line reading as existing support staff.
const sd=$getWorkflowStaticData('global'); const rs=sd.runStartedAt||0;
let cfg={}; try{ cfg=$('Parse Play').first().json||{}; }catch(e){ try{ cfg=$('Parse Launch').first().json||{}; }catch(e2){} }
let base=''; try{ base=$('Client Vars').first().json.base||''; }catch(e){}
const nf=(x)=>Number(x||0).toLocaleString('en-US');
const failed=[]; const skips=[];

let fq={ reviews_in:0, meta_rows:0, companies_in:0, qualified:0, drops:{} };
try{ const s=$('Filter & Qualify Reviews').first().json._stats; if(s) fq=s; }catch(e){}
const d=fq.drops||{};
const dropLine=['not negative (belt) '+nf(d.not_negative),'no domain '+nf(d.no_domain),'hosted platform '+nf(d.hosted_platform),'wrong country '+nf(d.country),'duplicate '+nf(d.duplicate),'already in table '+nf(d.worked)].join(' · ');

let bz={ called:0, matched:0, unknown:0, closed:0, errors:0, failed:[] }; let closedList=[];
try{ const f=$('Company Facts').first().json; if(f&&f._stats) bz=f._stats; closedList=(f&&f.closed)||[]; }catch(e){}
for(const f of (bz.failed||[])) failed.push(f);

let icp={ checked:0, yes:0, partial:0, no:0, missing:0, error:'', rejected:[] }; let polls=0;
try{ const s=$('Apply ICP').first().json._stats; if(s) icp=s; }catch(e){}
try{ polls=Number($('Poll Check').last().json.passes)||0; }catch(e){}
if(icp.error) failed.push({ tier:'ICP check', name:'task', reason:icp.error });

let fh={ yes:0, no:0, unknown:0, failed:[] };
try{ const s=$('Contact Calls').first().json._stats; if(s) fh=s; }catch(e){}
for(const f of (fh.failed||[])) failed.push(f);

let bl={ companies:0, companies_with_contact:0, contacts:0, contagen:{}, ark:{}, failed:[] };
try{ const s=$('Build Intent Leads').first().json._stats; if(s) bl=s; }catch(e){}
for(const f of (bl.failed||[])) failed.push(f);
const cg=bl.contagen||{}, arkP=bl.ark||{};

let cleaned=0; try{ cleaned=$('Clean Fields').all().map(i=>i.json).filter(j=>j&&!j._empty).length; }catch(e){}
let afterDnc=0; try{ afterDnc=$('Apply DNC').all().map(i=>i.json).filter(j=>j&&!j._empty).length; }catch(e){}
const dncDropped=Math.max(0,cleaned-afterDnc);
let upserted=0; const upsertErr=[];
for(const n of ['Upsert by Email','Upsert by Name+Domain']){
  try{ for(const it of $(n).all()){ const j=it.json||{}; if(j&&j.id) upserted++; else if(j&&j.error) upsertErr.push({ tier:'Upsert', name:n, reason:String((j.error&&(j.error.message||j.error))||'upsert failed').slice(0,120) }); } }catch(e){}
}
for(const f of upsertErr) failed.push(f);
const upsertGap=Math.max(0, afterDnc-upserted-upsertErr.length);
if(upsertGap) failed.push({ tier:'Upsert', name:upsertGap+' row(s)', reason:'no record id came back' });
let wfOk=null, wfErrorPages=0;
try{ const w=$('Run Waterfall').first().json||{}; wfOk=!w.error; wfErrorPages=Number(w.errorPages)||0; }catch(e){}
if(afterDnc&&wfOk===false) failed.push({ tier:'Waterfall', name:'batch call', reason:'errored' });
if(wfErrorPages) failed.push({ tier:'Waterfall', name:wfErrorPages+' page(s)', reason:'error pages' });

if(!fq.qualified) skips.push('Skipped (everything after the hard lines, no company survived them)');
if(fq.qualified&&!(icp.yes+icp.partial)&&!icp.error) skips.push('Skipped (contacts, no company passed the ICP check)');
if((icp.yes+icp.partial)&&!bl.contacts) skips.push('Skipped (landing, the sources returned no contacts at '+nf(icp.yes+icp.partial)+' companies)');
if(bl.contacts&&!afterDnc) skips.push('Skipped (enrollment, all '+nf(bl.contacts)+' contacts on DNC)');

const errs=failed.length;
const status=errs?'Succeeded with errors':'Succeeded';
const rejLines=(icp.rejected||[]).slice(0,10).map(r=>'- '+r.domain+' ('+r.fit+'): '+r.reason);
const lines=[
  '**'+nf(upserted)+' upserted from '+nf(bl.contacts)+' contacts at '+nf(bl.companies_with_contact)+' of '+nf(icp.yes+icp.partial)+' ICP companies, '+errs+' error'+(errs===1?'':'s')+'**',
  '',
  '**Signal:** '+(cfg.play_name||cfg.play||'')+(cfg.legacy_launch_id?' (legacy launch id, update the Apify webhook to the Signals record id)':'')+' · **Table:** '+(cfg.table||'')+' in '+(base||'')+' · **Type:** '+(cfg.event_type||''),
  '',
  '**Funnel**',
  '- **Review rows scraped:** '+nf(fq.reviews_in)+' at '+nf(fq.companies_in)+' companies'+(fq.meta_rows?' (+'+nf(fq.meta_rows)+' company-metadata rows)':''),
  '- **Hard lines dropped:** '+dropLine,
  '- **Companies to BizData:** '+nf(fq.qualified)+' · matched '+nf(bz.matched)+' · unknown '+nf(bz.unknown)+' · closed '+nf(bz.closed)+(closedList.length?' ('+closedList.join(', ')+')':'')+' · errors '+nf(bz.errors),
  '- **ICP check:** '+nf(icp.checked)+' checked in '+nf(polls)+' poll'+(polls===1?'':'s')+' · yes '+nf(icp.yes)+' · partial (kept) '+nf(icp.partial)+' · no '+nf(icp.no)+(icp.missing?' · no verdict '+nf(icp.missing):''),
  '- **Support in role (never a gate):** none '+nf(fh.yes)+' · some '+nf(fh.no)+' · unknown '+nf(fh.unknown),
  '- **ContaGen:** '+nf(cg.called)+' calls · '+nf(cg.matched)+' returned people · '+nf(cg.contacts)+' contacts · '+nf(cg.kept)+' kept · '+nf(cg.errors)+' errors',
  '- **AI-Ark people:** '+nf(arkP.called)+' calls · '+nf(arkP.matched)+' returned people · '+nf(arkP.profiles)+' profiles · '+nf(arkP.kept)+' net-new kept · errors '+nf(arkP.errors)+' (~'+(Math.round((arkP.profiles||0)*0.5*10)/10)+' credits)',
  '- **No people gate:** everything the sources returned lands; relevance and the views cut in the base',
  '- **Contacts landed:** '+nf(bl.contacts)+' at '+nf(bl.companies_with_contact)+' companies',
  '- **Cleaned:** '+nf(cleaned)+' · **after DNC:** '+nf(afterDnc)+(dncDropped?' ('+nf(dncDropped)+' on DNC)':''),
  '- **Upserted to intent table:** '+nf(upserted),
  '',
  '**Waterfall batch fired:** '+(afterDnc?(wfOk?'yes (sweeps all rows not done/verifying)':'no / errored'):'not needed'),
  '',
  '**Enrollment:** none here; the deploy doors feed campaigns from the views (Signal link on Campaigns)'
];
if(rejLines.length) lines.push('','**ICP rejected ('+nf((icp.rejected||[]).length)+')**\n'+rejLines.join('\n')+((icp.rejected||[]).length>10?'\n- ...and '+((icp.rejected||[]).length-10)+' more':''));
if(failed.length) lines.push('','**FAILED ('+failed.length+')**\n'+failed.slice(0,8).map(f=>'- '+f.tier+' · '+(f.name||'?')+': '+(f.reason||'')).join('\n')+(failed.length>8?'\n- ...and '+(failed.length-8)+' more':''));
if(skips.length) lines.push('',skips.join('\n'));
const row={
 'Automation':'Handle Service Reviews Intent Signal',
 'Status':status,
 'Run at': $now.toISO(),
 'Records In': bl.contacts||0,
 'Records Out': upserted,
 'Errors': errs,
 'Target': cfg.table||'',
 'Trigger':'event',
 'Execution ID': String($execution.id),
 'Execution Link': 'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id,
 'Duration s': Math.round(($now.toMillis() - (rs||$now.toMillis()))/1000),
 'Description': lines.join('\n')
};
if(cfg.client) row['Client']=[cfg.client];
return [{json:row}];
