const sd2=$getWorkflowStaticData('global'); const rs=sd2.runStartedAt||0;
const cfg=$('Parse Config').first().json||{};
let base=''; try{ base=$('Client Vars').first().json.base||''; }catch(e){}
let jobsIn=0; try{ let it=$('Get Scraped Jobs').all().map(i=>i.json); if(it.length===1&&Array.isArray(it[0])) it=it[0]; jobsIn=it.filter(j=>j&&(j.companyName||j.companyWebsite||j.title)).length; }catch(e){}
let qualified=0; try{ qualified=$('Filter & Qualify Jobs').all().map(i=>i.json).filter(j=>j&&j.domain).length; }catch(e){}
let contacts=0; try{ contacts=$('Build Intent Leads').all().map(i=>i.json).filter(j=>j&&j['LinkedIn URL']).length; }catch(e){}
let afterDnc=contacts; try{ afterDnc=$('Apply DNC').all().length; }catch(e){}
let upserted=0;
try{ upserted+=$('Upsert by Email').all().map(i=>i.json).filter(j=>j&&j.id).length; }catch(e){}
try{ upserted+=$('Upsert by Name+Domain').all().map(i=>i.json).filter(j=>j&&j.id).length; }catch(e){}
let wfOk=false, wfErrorPages=0;
try{ const w=$('Run Waterfall').first().json||{}; wfOk=!w.error; wfErrorPages=Number(w.errorPages)||0; }catch(e){}
const errs=Math.max(0, afterDnc-upserted);
const totalErrs=(contacts===0)?0:(errs+(wfOk===false?1:0)+wfErrorPages);
const status=totalErrs>0?'Succeeded with errors':'Succeeded';
let lines;
if(contacts===0){
  lines=[
  '**0 contacts found, nothing inserted**',
  '',
  '**Play table:** '+(cfg.table||'(unknown)')+' in '+(base||'(unknown base)'),
  '',
  '**Pipeline**',
  '- **Jobs scraped:** '+jobsIn,
  '- **Companies qualified:** '+qualified,
  '- **Contacts found:** 0',
  '',
  '**Skipped:** DNC gate, upserts and waterfall (nothing to do)'
  ];
}else{
  lines=[
  '**'+upserted+' upserted, '+totalErrs+' error'+(totalErrs===1?'':'s')+'**',
  '',
  '**Play table:** '+(cfg.table||'(unknown)')+' in '+(base||'(unknown base)'),
  '',
  '**Pipeline**',
  '- **Jobs scraped:** '+jobsIn,
  '- **Qualified companies:** '+qualified,
  '- **Decision makers:** '+contacts+(contacts!==afterDnc?' · after DNC gate: '+afterDnc:''),
  '- **Upserted to intent table:** '+upserted+(errs?' · '+errs+' upsert failure(s)':''),
  '',
  '**Waterfall batch fired:** '+(wfOk?'yes (sweeps all rows not done/verifying)':'no / errored')+(wfErrorPages?' · '+wfErrorPages+' error page(s)':''),
  '',
  '**Enrollment:** handled by the daily Add Leads runs'
  ];
}
return [{json:{
 'Automation':'Handle Intent Signal',
 'Client': cfg.client?[cfg.client]:[],
 'Status':status,
 'Run at': $now.toISO(),
 'Records In': (contacts===0?0:afterDnc),
 'Records Out': upserted,
 'Errors': totalErrs,
 'Target': cfg.table||'',
 'Trigger':'event',
 'Execution ID': String($execution.id),
 'Execution Link': 'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id,
 'Duration s': Math.round(($now.toMillis() - (rs||$now.toMillis()))/1000),
 'Description': lines.join('\n')
}}];