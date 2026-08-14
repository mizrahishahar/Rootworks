const sd2=$getWorkflowStaticData('global'); const rs=sd2.runStartedAt||0;
let tables=[]; try{ tables=$('Parse Client Config').all().map(i=>i.json).filter(t=>t&&t.baseId); }catch(e){}
const clientRecId=(tables[0]&&tables[0].clientRecId)||'';
const clientName=(tables[0]&&tables[0].clientName)||'';
let prep=[]; try{ prep=$('Prep Rows').all().map(i=>i.json); }catch(e){}
const ready=prep.filter(r=>r&&r.recordId).length;
const readErrors=prep.filter(r=>r&&r._readError).map(r=>({ name:'table '+(r.tableId||'?')+': read failed', reason:r.errorMessage||'' }));
let routes=[]; try{ routes=$('Route Rows').all().map(i=>i.json).filter(r=>r&&r.recordId); }catch(e){}
let results=[]; try{ results=$('Stamp Results').all().map(i=>i.json); }catch(e){}
const ok=results.filter(r=>r.ok);
const failed=results.filter(r=>!r.ok).concat(routes.filter(r=>r.action==='failed_precheck')).concat(readErrors);
const noEmail=routes.filter(r=>r.action==='no_email');
const byTable={};
for(const t of tables){ byTable[t.tableId]={ ready:0, enrolled:0, failed:0, noEmail:0 }; }
for(const r of routes){ const b=byTable[r.tableId]||(byTable[r.tableId]={ready:0,enrolled:0,failed:0,noEmail:0}); b.ready++; if(r.action==='no_email')b.noEmail++; if(r.action==='failed_precheck')b.failed++; }
for(const r of results){ const b=byTable[r.tableId]||(byTable[r.tableId]={ready:0,enrolled:0,failed:0,noEmail:0}); if(r.ok)b.enrolled++; else b.failed++; }
const nf=(x)=>Number(x||0).toLocaleString('en-US');
const parts=['**'+nf(ready)+' ready, '+nf(ok.length)+' enrolled, '+failed.length+' failed**'];
if(!tables.length) parts.push('No usable Intent Tables lines (need tbl ids + Clayroots Base ID on the row); nothing to do.');
const tLines=Object.keys(byTable).map(tid=>{ const b=byTable[tid]; return '- **'+tid+':** '+nf(b.ready)+' ready · '+nf(b.enrolled)+' enrolled · '+nf(b.failed)+' failed · '+nf(b.noEmail)+' no email'; });
if(tLines.length) parts.push('**Tables**\n'+tLines.join('\n'));
if(failed.length) parts.push('**FAILED ('+failed.length+')**\n'+failed.slice(0,5).map(f=>'- '+(f.name||f.recordId||'?')+': '+(f.reason?String(f.reason).slice(0,120):'enroll failed')).join('\n')+(failed.length>5?'\n- ...and '+(failed.length-5)+' more':''));
if(noEmail.length) parts.push('**Skipped ('+noEmail.length+', no email)**\n'+noEmail.map(r=>r.name||r.recordId||'?').join(', '));
return [{json:{
 'Automation':'Add Intent Leads to Alta',
 'Client': clientRecId?[clientRecId]:[],
 'Status': failed.length ? 'Succeeded with errors' : 'Succeeded',
 'Run at': $now.toISO(),
 'Records In': ready,
 'Records Out': ok.length,
 'Errors': failed.length,
 'Target': tables.map(t=>t.tableId).join(', '),
 'Trigger':'schedule',
 'Execution ID': String($execution.id)+'-'+(clientRecId||'x'),
 'Execution Link': 'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id,
 'Duration s': Math.round(($now.toMillis() - (rs||$now.toMillis()))/1000),
 'Description': parts.join('\n\n')
}}];