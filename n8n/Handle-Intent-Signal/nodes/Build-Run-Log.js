// Build Run Log: the one row this run writes, per the logging standard. Status computed from
// failed[], skips separated, the Description is the whole funnel. Every node reference is
// guarded: a branch that never ran reads as 0.
const sd=$getWorkflowStaticData('global'); const rs=sd.runStartedAt||0;
let cfg={}; try{ cfg=$('Parse Play').first().json||{}; }catch(e){ try{ cfg=$('Parse Launch').first().json||{}; }catch(e2){} }
let base=''; try{ base=$('Client Vars').first().json.base||''; }catch(e){}
const nf=(x)=>Number(x||0).toLocaleString('en-US');
const failed=[]; const skips=[];

let fq={ jobs_in:0, qualified:0, drops:{} };
try{ const s=$('Filter & Qualify Jobs').first().json._stats; if(s) fq=s; }catch(e){}
const d=fq.drops||{};
const dropLine=['country '+nf(d.country),'staffing '+nf((d.staffing_name||0)+(d.staffing_industry||0)),'body shop '+nf(d.body_shop),'over max employees '+nf(d.headcount),'no domain '+nf(d.no_domain),'duplicate '+nf(d.duplicate),'already in table '+nf(d.worked)].join(' · ');

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

let bl={ companies:0, companies_with_contact:0, contacts:0, contagen:{}, supersoniq:{}, people_gate:{}, tiers:{}, failed:[] };
try{ const s=$('Build Intent Leads').first().json._stats; if(s) bl=s; }catch(e){}
for(const f of (bl.failed||[])) failed.push(f);
const cg=bl.contagen||{}, sq=bl.supersoniq||{}, pg=bl.people_gate||{};

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
if((icp.yes+icp.partial)&&!bl.contacts) skips.push('Skipped (enrollment, no contact passed the people gate at '+nf(icp.yes)+' companies)');
if(bl.contacts&&!afterDnc) skips.push('Skipped (enrollment, all '+nf(bl.contacts)+' contacts on DNC)');

const errs=failed.length;
const status=errs?'Succeeded with errors':'Succeeded';
const tierLine=Object.entries(bl.tiers||{}).map(([u,n])=>nf(n)+' -> '+(u?u.replace(/https?:\/\/[^/]+\/audience\/webhook\//g,'').replace(/\/pull-in-prospect/g,''):'(no channel)')).join(' · ')||'none';
const rejLines=(icp.rejected||[]).slice(0,10).map(r=>'- '+r.domain+' ('+r.fit+'): '+r.reason);
const lines=[
  '**'+nf(upserted)+' upserted from '+nf(bl.contacts)+' contacts at '+nf(bl.companies_with_contact)+' of '+nf(icp.yes+icp.partial)+' ICP companies, '+errs+' error'+(errs===1?'':'s')+'**',
  '',
  '**Play:** '+(cfg.play_name||cfg.play||'')+' · **Table:** '+(cfg.table||'')+' in '+(base||'')+' · **Event:** '+(cfg.event_type||''),
  '',
  '**Funnel**',
  '- **Jobs scraped:** '+nf(fq.jobs_in),
  '- **Hard lines dropped:** '+dropLine,
  '- **Companies to BizData:** '+nf(fq.qualified)+' · matched '+nf(bz.matched)+' · unknown '+nf(bz.unknown)+' · closed '+nf(bz.closed)+(closedList.length?' ('+closedList.join(', ')+')':'')+' · errors '+nf(bz.errors),
  '- **ICP check:** '+nf(icp.checked)+' checked in '+nf(polls)+' poll'+(polls===1?'':'s')+' · yes '+nf(icp.yes)+' · partial (kept) '+nf(icp.partial)+' · no '+nf(icp.no)+(icp.missing?' · no verdict '+nf(icp.missing):''),
  '- **First hire:** yes '+nf(fh.yes)+' · no '+nf(fh.no)+' · unknown '+nf(fh.unknown),
  '- **ContaGen:** '+nf(cg.called)+' calls · '+nf(cg.matched)+' returned people · '+nf(cg.contacts)+' contacts · '+nf(cg.kept)+' kept · '+nf(cg.errors)+' errors',
  '- **Supersoniq:** '+nf(sq.called)+' calls · '+nf(sq.matched)+' returned people · '+nf(sq.contacts)+' contacts · '+nf(sq.kept)+' net-new kept · '+nf(sq.credits)+' credits · '+nf(sq.errors)+' errors',
  '- **People gate:** '+nf(pg.checked)+' checked · dropped '+nf(pg.dropped_never)+' on never terms · dropped '+nf(pg.dropped_no_title)+' on no title match',
  '- **Contacts kept:** '+nf(bl.contacts)+' at '+nf(bl.companies_with_contact)+' companies',
  '- **Channels:** '+tierLine,
  '- **Cleaned:** '+nf(cleaned)+' · **after DNC:** '+nf(afterDnc)+(dncDropped?' ('+nf(dncDropped)+' on DNC)':''),
  '- **Upserted to intent table:** '+nf(upserted),
  '',
  '**Waterfall batch fired:** '+(afterDnc?(wfOk?'yes (sweeps all rows not done/verifying)':'no / errored'):'not needed'),
  '',
  '**Enrollment:** handled by the daily Add Leads runs'
];
const droppedTitles=(pg.dropped||[]);
if(droppedTitles.length) lines.push('','**People gate dropped ('+nf(droppedTitles.length)+')**\n'+droppedTitles.slice(0,25).map(x=>'- '+x).join('\n')+(droppedTitles.length>25?'\n- ...and '+(droppedTitles.length-25)+' more':''));
if(rejLines.length) lines.push('','**ICP rejected ('+nf((icp.rejected||[]).length)+')**\n'+rejLines.join('\n')+((icp.rejected||[]).length>10?'\n- ...and '+((icp.rejected||[]).length-10)+' more':''));
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
