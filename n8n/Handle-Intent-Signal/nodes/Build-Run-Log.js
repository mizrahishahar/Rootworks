// Build Run Log: the one row this run writes, per the logging standard. Status is computed
// from failed[] (never a literal), skips are separated from errors, and the Description is
// the whole funnel: what came in, why each drop happened, what every paid call returned.
// Every node reference is guarded: a branch that never ran (empty pick, no leads) reads as 0.
const sd=$getWorkflowStaticData('global'); const rs=sd.runStartedAt||0;
const cfg=$('Parse Config').first().json||{};
let base=''; try{ base=$('Client Vars').first().json.base||''; }catch(e){}
const nf=(x)=>Number(x||0).toLocaleString('en-US');
const failed=[];
const skips=[];

// Funnel in: scrape and qualification.
let fq={ jobs_in:0, qualified:0, drops:{} };
try{ const s=$('Filter & Qualify Jobs').first().json._stats; if(s) fq=s; }catch(e){}
const d=fq.drops||{};
const dropLine=['country '+nf(d.country),'staffing name '+nf(d.staffing_name),'staffing industry '+nf(d.staffing_industry),'body shop '+nf(d.body_shop),'headcount '+nf(d.headcount),'no domain '+nf(d.no_domain),'duplicate '+nf(d.duplicate),'already worked '+nf(d.worked)].join(' · ');

// Providers and the merged contact set.
let bl={ companies:fq.qualified, companies_with_contact:0, contacts:0, contagen:{}, supersoniq:{}, bizdata:{}, failed:[] };
try{ const s=$('Build Intent Leads').first().json._stats; if(s) bl=s; }catch(e){}
let recruiters=[]; try{ recruiters=($('Split Calls').first().json._stats||{}).recruiter_bizdata||[]; }catch(e){}
const called=Math.max(0,(fq.qualified||0)-recruiters.length);
for(const f of (bl.failed||[])) failed.push(f);
const cg=bl.contagen||{}, sq=bl.supersoniq||{}, bz=bl.bizdata||{};

// Clean, DNC, upserts, waterfall.
let cleaned=0; try{ cleaned=$('Clean Fields').all().map(i=>i.json).filter(j=>j&&!j._empty).length; }catch(e){}
let afterDnc=0; try{ afterDnc=$('Apply DNC').all().map(i=>i.json).filter(j=>j&&!j._empty).length; }catch(e){}
const dncDropped=Math.max(0,cleaned-afterDnc);
let upserted=0;
const upsertErr=[];
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

// Skips: nothing-to-do is not an error.
if(!fq.qualified) skips.push('Skipped (contacts, no company qualified)');
if(fq.qualified&&!bl.contacts) skips.push('Skipped (enrollment, no contact found at '+nf(fq.qualified)+' companies)');
if(bl.contacts&&!afterDnc) skips.push('Skipped (enrollment, all '+nf(bl.contacts)+' contacts on DNC)');

const errs=failed.length;
const status=errs?'Succeeded with errors':'Succeeded';
const head='**'+nf(upserted)+' upserted from '+nf(bl.contacts)+' contacts at '+nf(bl.companies_with_contact)+' of '+nf(fq.qualified)+' companies, '+errs+' error'+(errs===1?'':'s')+'**';
const lines=[
  head,
  '',
  '**Play table:** '+(cfg.table||'(unknown)')+' in '+(base||'(unknown base)')+' · **Event:** '+(cfg.event_type||''),
  '',
  '**Funnel**',
  '- **Jobs scraped:** '+nf(fq.jobs_in),
  '- **Dropped:** '+dropLine,
  '- **Companies qualified:** '+nf(fq.qualified)+(recruiters.length?' · **recruiter platforms (BizData) dropped:** '+recruiters.length+' ('+recruiters.join(', ')+')':''),
  '- **BizData:** '+nf(bz.called)+' calls · '+nf(bz.matched)+' matched · '+nf(bz.unknown||0)+' unknown domain · '+nf(bz.errors)+' errors',
  '- **ContaGen:** '+nf(cg.called)+' calls · '+nf(cg.matched)+' returned people · '+nf(cg.contacts)+' contacts · '+nf(cg.kept)+' kept · '+nf(cg.errors)+' errors',
  '- **Supersoniq:** '+nf(sq.called)+' calls · '+nf(sq.matched)+' returned people · '+nf(sq.contacts)+' contacts · '+nf(sq.kept)+' net-new kept · '+nf(sq.credits)+' credits · '+nf(sq.errors)+' errors',
  '- **Contacts after dedupe:** '+nf(bl.contacts)+' at '+nf(bl.companies_with_contact)+' companies'+(called?' ('+nf(called-bl.companies_with_contact)+' companies with nobody found at either source)':''),
  '- **Cleaned:** '+nf(cleaned)+' · **after DNC:** '+nf(afterDnc)+(dncDropped?' ('+nf(dncDropped)+' on DNC)':''),
  '- **Upserted to intent table:** '+nf(upserted),
  '',
  '**Waterfall batch fired:** '+(afterDnc?(wfOk?'yes (sweeps all rows not done/verifying)':'no / errored'):'not needed'),
  '',
  '**Enrollment:** handled by the daily Add Leads runs'
];
if(failed.length) lines.push('','**FAILED ('+failed.length+')**\n'+failed.slice(0,8).map(f=>'- '+f.tier+' · '+(f.name||'?')+': '+(f.reason||'')).join('\n')+(failed.length>8?'\n- ...and '+(failed.length-8)+' more':''));
if(skips.length) lines.push('',skips.join('\n'));
const row={
 'Automation':'Handle Intent Signal',
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
