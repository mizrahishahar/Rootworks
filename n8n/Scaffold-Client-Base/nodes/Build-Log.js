// Build Log: one row per run, upserted on Execution ID onto the launch row, to the logging
// standard. Status is computed from failed[] (every create that failed, every clash); skips
// (what existed, what waits for a mirror) are separate lines, never errors. Client attached:
// a launched run serves exactly the client on its row. The Description mirrors Onboard
// Client's scaffold section: every table and field created, per table, then the hand acts.
const sd=$getWorkflowStaticData('global');
const p=$('Launch Params').first().json;
const S=sd.scaffold||{ base:p.base, clientName:p.clientName, pass:0, seen:{}, created:[], existed:[], skipped:[], failed:['scaffold state missing: Scaffold Init never ran'], pending:[] };
const failed=(S.failed||[]).slice();
const created=S.created||[];
const name=p.clientName||p.clientRecId||'(unknown)';
const nFields=created.filter(c=>c.name!=='(table)').length, nTables=created.filter(c=>c.name==='(table)').length;
const lines=[
  '**'+name+': base '+S.base+' brought to the register'+(failed.length?', '+failed.length+' error'+(failed.length===1?'':'s'):'')+'**',
  '',
  '**Scope:** client '+name+', base '+S.base+', '+S.pass+' schema pass'+(S.pass===1?'':'es')+', '+nFields+' fields on '+nTables+' tables created',
  '**Extras:** '+((S.extras||[]).length?S.extras.join(', ')+' (declared columns on Companies)':'none picked, the register core only'),
  '',
  '**Scaffold**'
];
for(const T of ['Companies','People','DNC']){
  const tbl=created.find(c=>c.table===T&&c.name==='(table)');
  const withTable=created.filter(c=>c.table===T&&c.name!=='(table)'&&(c.how==='base'||c.how==='withTable')).map(c=>c.name);
  const added=created.filter(c=>c.table===T&&c.name!=='(table)'&&c.how==='field').map(c=>c.name);
  let how=tbl?'created':(S.seen[T+'.(table)']==='existed'?'existed':'not created');
  if(withTable.length) how+=', '+withTable.length+' fields ('+withTable.join(', ')+')';
  if(added.length) how+='; fields added ('+added.length+'): '+added.join(', ');
  if(!withTable.length&&!added.length) how+='; nothing added';
  lines.push('- **'+T+':** '+how);
}
lines.push('', 'Skipped ('+S.existed.length+', existed, left alone): '+(S.existed.length?S.existed.join(', '):'nothing pre-existed'));
if(S.skipped.length){ lines.push('', 'Skipped ('+S.skipped.length+', not creatable yet):'); for(const s of S.skipped) lines.push('- '+s); }
if(failed.length){ lines.push('', '**Failed ('+failed.length+')**'); for(const f of failed) lines.push('- '+f); }
lines.push('', '**Operator, by hand:** sync the two mirrors from the Hub (the Campaigns and Signals views filtered to this client, Hub Record ID synced) as "'+name+' Campaigns" and "'+name+' Signals", then launch this door again for the Signals link on Companies, the Campaigns link on Companies and People, and the Signals lookup on People. Build the standard views (Companies: Uncovered, Tried empty, Public & Found, Public & Found : Campaigns; People: Relevant, Cut review, Relevant & Not Waterfalled, Relevant & Found, Relevant & Found : Campaigns). Replace the relevance placeholder with the client\'s rule. Paste the share link into each table description.');
const started=Date.parse(p.startedAt||'')||sd.runStartedAt||Date.now();
return [{ json: {
  'Execution ID': String($execution.id),
  'Automation': 'Scaffold Client Base',
  'Client': [p.clientRecId],
  'Status': failed.length ? 'Succeeded with errors' : 'Succeeded',
  'Run at': p.startedAt||new Date().toISOString(),
  'Records In': 1,
  'Records Out': created.length,
  'Errors': failed.length,
  'Target': S.base,
  'Trigger': 'form',
  'Execution Link': 'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id,
  'Duration s': Math.round((Date.now()-started)/1000),
  'Description': lines.join('\n')
} }];
