// One row per run, per the logging standard. Status from failed[]; nothing-to-do is a skip.
const sd=$getWorkflowStaticData('global'); const rs=sd.runStartedAt||0;
const cfg=$('Parse Launch').first().json||{};
const nf=(x)=>Number(x||0).toLocaleString('en-US');
let st={};
try{ const s=$('Build Writes').first().json._stats; if(s) st=s; }catch(e){}
const failed=[].concat(st.failed||[]);
let written=0;
try{ for(const it of $('Write Rows').all()){ const j=it.json||{}; const status=Number(j.statusCode)||0; let body=j.body; if(typeof body==='string'){ try{ body=JSON.parse(body); }catch(e){} }
  if(status>=200&&status<300&&body&&Array.isArray(body.records)) written+=body.records.length; else failed.push({ name:'batch', reason:'HTTP '+status+' '+String((body&&body.error&&(body.error.message||body.error.type))||'').slice(0,120) }); } }catch(e){}
for(const m of (st.datasetMisses||[])) failed.push({ name:'Apify dataset', reason:m });
const errs=failed.length;
const passes=Object.entries(cfg.do||{}).filter(([k,v])=>v).map(([k])=>k).join(', ');
const lines=[
  '**'+nf(written)+' rows backfilled of '+nf(st.rows)+', '+errs+' error'+(errs===1?'':'s')+'**',
  '',
  '**Table:** '+(cfg.table||'')+' in '+(cfg.base||'')+' · **Passes:** '+passes,
  '',
  '**Funnel**',
  '- **Rows read:** '+nf(st.rows),
  '- **Jobs:** Signal Detail parsed '+nf(st.parsed)+' · unparsed '+nf(st.unparsed)+' · datasets '+nf(st.datasets)+' of '+nf((cfg.datasetIds||[]).length)+' · jobs indexed '+nf(st.jobsIndexed)+' · rows matched '+nf(st.matched),
  '- **Company:** BizData '+nf(st.biz_called)+' domains · matched '+nf(st.biz_matched)+' · unknown '+nf(st.biz_unknown)+' · errors '+nf(st.biz_errors),
  '- **Role:** Existing In Role known for '+nf(st.role_known)+' domains · unknown '+nf(st.role_unknown),
  '- **Contacts:** '+nf(st.lookups)+' lookups · matched on LinkedIn '+nf(st.lookup_matched)+' · no match '+nf(st.lookup_nomatch)+' · errors '+nf(st.lookup_errors),
  '- **Rows with something to write:** '+nf(st.rowsToWrite)+' · already complete '+nf(st.untouched),
  '- **Written:** '+nf(written)+' in '+nf(st.batches)+' batches'
];
if(st.liurl_checked) lines.splice(lines.length-2, 0, '- **LinkedIn URL guard:** '+nf(st.liurl_checked)+' mismatched · recovered '+nf(st.liurl_recovered)+' · blanked (email-only) '+nf(st.liurl_blanked));
const liRows=st.liurl_rows||[];
if(liRows.length) lines.push('','**LinkedIn URL re-derived ('+nf(liRows.length)+')**\n'+liRows.slice(0,40).map(x=>'- '+x).join('\n')+(liRows.length>40?'\n- ...and '+(liRows.length-40)+' more':''));
if(failed.length) lines.push('','**FAILED ('+failed.length+')**\n'+failed.slice(0,8).map(f=>'- '+f.name+': '+f.reason).join('\n')+(failed.length>8?'\n- ...and '+(failed.length-8)+' more':''));
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
