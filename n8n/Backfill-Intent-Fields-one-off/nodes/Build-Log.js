// One row per run, per the logging standard. Status from failed[]; nothing-to-do is a skip.
const sd=$getWorkflowStaticData('global'); const rs=sd.runStartedAt||0;
const cfg=$('Parse Launch').first().json||{};
const nf=(x)=>Number(x||0).toLocaleString('en-US');
let st={ rows:0, parsed:0, unparsed:0, datasets:0, datasetMisses:[], jobsIndexed:0, matched:0, rowsToWrite:0, untouched:0, batches:0 };
try{ const s=$('Build Writes').first().json._stats; if(s) st=s; }catch(e){}
const failed=[];
let written=0;
try{
  for(const it of $('Write Rows').all()){
    const j=it.json||{}; const status=Number(j.statusCode)||0;
    let body=j.body; if(typeof body==='string'){ try{ body=JSON.parse(body); }catch(e){} }
    if(status>=200&&status<300&&body&&Array.isArray(body.records)) written+=body.records.length;
    else failed.push({ name:'batch', reason:'HTTP '+status+' '+String((body&&body.error&&(body.error.message||body.error.type))||'').slice(0,120) });
  }
}catch(e){}
for(const m of (st.datasetMisses||[])) failed.push({ name:'Apify dataset', reason:m });
const gap=Math.max(0,(st.rowsToWrite||0)-written-failed.filter(f=>f.name==='batch').length*10);
const errs=failed.length;
const lines=[
  '**'+nf(written)+' rows backfilled of '+nf(st.rows)+', '+errs+' error'+(errs===1?'':'s')+'**',
  '',
  '**Table:** '+(cfg.table||'')+' in '+(cfg.base||''),
  '',
  '**Funnel**',
  '- **Rows read:** '+nf(st.rows),
  '- **Signal Detail parsed:** '+nf(st.parsed)+' · unparsed '+nf(st.unparsed),
  '- **Apify datasets fetched:** '+nf(st.datasets)+' of '+nf((cfg.datasetIds||[]).length)+' · jobs indexed '+nf(st.jobsIndexed),
  '- **Rows matched to a scraped job:** '+nf(st.matched),
  '- **Rows with something to write:** '+nf(st.rowsToWrite)+' · already complete '+nf(st.untouched),
  '- **Written:** '+nf(written)+' in '+nf(st.batches)+' batches'
];
if(failed.length) lines.push('','**FAILED ('+failed.length+')**\n'+failed.slice(0,8).map(f=>'- '+f.name+': '+f.reason).join('\n'));
if(!st.rowsToWrite) lines.push('','Skipped (writes, every row already carries its fields)');
const row={
 'Automation':'Backfill Intent Fields (one-off)',
 'Status': errs?'Succeeded with errors':'Succeeded',
 'Run at': $now.toISO(),
 'Records In': st.rows||0,
 'Records Out': written,
 'Errors': errs,
 'Target': cfg.table||'',
 'Trigger':'webhook',
 'Execution ID': String($execution.id),
 'Execution Link': 'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id,
 'Duration s': Math.round(($now.toMillis()-(rs||$now.toMillis()))/1000),
 'Description': lines.join('\n')
};
if(cfg.client) row['Client']=[cfg.client];
return [{ json: row }];
