// Build Run Log: one row per onboarding, to the logging standard. Status is computed from
// failed[] (a missing base, every scaffold create that failed, every clash); skips (what
// existed, what waits for a mirror) are separate lines, never errors. The Description lists
// every table and field the scaffold created, per table, and what the Operator still does by
// hand: the two mirrors, the mirror links, the standard views, the relevance rule.
const sd2=$getWorkflowStaticData('global'); const rs=sd2.runStartedAt||0;
let v={}; try{ v=$('Build Client Vars').first().json||{}; }catch(e){}
let folderId=''; try{ folderId=$('Create Client Folder').first().json.id||''; }catch(e){}
let channelId=''; try{ channelId=$('Create Slack Channel').first().json.id||''; }catch(e){}
let baseId='', baseErr='';
try{ const b=$('Create ClayRoots Base').first().json||{}; baseId=b.id||''; if(!baseId){ const e=b.error||b.message||''; baseErr=(e&&typeof e==='object')?(e.message||JSON.stringify(e)):String(e||''); } }catch(e){}
let regRec=''; try{ regRec=$('Create Clients Record').first().json.id||''; }catch(e){}
let prospectId=''; try{ const q=$('Onboard Webhook').first().json.query||{}; prospectId=q.recordId||q.leadId||''; }catch(e){}
const failed=[];
if(!baseId) failed.push('ClayRoots base not created'+(baseErr?': '+baseErr.slice(0,200):'')+'; scaffold skipped');
const S=sd2.scaffold||null;
const name=v.clientName||'(unknown)';
const lines=[
  '**'+name+' onboarded'+(baseId?'':', ClayRoots base missing')+'**',
  '',
  '**Prospect:** '+(prospectId||'?'),
  '',
  '**Created**',
  '- **Drive:** client folder '+(folderId||'(none)')+' with full anatomy + Overrides stub, Shared shared to contacts',
  '- **Slack:** '+(v.channelName||'')+' created ('+(channelId||'none')+'), Operator invited',
  '- **ClayRoots:** base '+(baseId||'NOT CREATED - flag for hand-creation'),
  '- **Registry:** Clients row '+(regRec||'(none)')+' written with all IDs'
];
if(S){
  for(const f of S.failed||[]) failed.push(f);
  const created=S.created||[];
  lines.push('', '**Scaffold** (base '+S.base+', '+S.pass+' schema pass'+(S.pass===1?'':'es')+', '+created.filter(c=>c.name!=='(table)').length+' fields on '+created.filter(c=>c.name==='(table)').length+' tables created)');
  lines.push('**Extras:** '+((S.extras||[]).length?S.extras.join(', ')+' (declared columns on Companies)':'none picked, the register core only'));
  for(const T of ['Companies','People','DNC']){
    const tbl=created.find(c=>c.table===T&&c.name==='(table)');
    const withTable=created.filter(c=>c.table===T&&c.name!=='(table)'&&(c.how==='base'||c.how==='withTable')).map(c=>c.name);
    const added=created.filter(c=>c.table===T&&c.name!=='(table)'&&c.how==='field').map(c=>c.name);
    let how=tbl?(tbl.how==='base'?'created with the base':'created'):(S.seen[T+'.(table)']==='existed'?'existed':'not created');
    if(withTable.length) how+=', '+withTable.length+' fields ('+withTable.join(', ')+')';
    if(added.length) how+='; fields added ('+added.length+'): '+added.join(', ');
    if(!withTable.length&&!added.length) how+='; nothing added';
    lines.push('- **'+T+':** '+how);
  }
  lines.push('', 'Skipped ('+S.existed.length+', existed, left alone): '+(S.existed.length?S.existed.join(', '):'nothing pre-existed'));
  if(S.skipped.length){ lines.push('', 'Skipped ('+S.skipped.length+', not creatable yet):'); for(const s of S.skipped) lines.push('- '+s); }
}
if(failed.length){ lines.push('', '**Failed ('+failed.length+')**'); for(const f of failed) lines.push('- '+f); }
lines.push('', '**Operator, by hand:** sync the two mirrors from the Hub (the Campaigns and Signals views filtered to this client, Hub Record ID synced) as "'+name+' Campaigns" and "'+name+' Signals", then add the Signals link on Companies, the Campaigns link on Companies and People, and the Signals lookup on People. Build the standard views (Companies: Uncovered, Tried empty, Public & Found, Public & Found : Campaigns; People: Relevant, Cut review, Relevant & Not Waterfalled, Relevant & Found, Relevant & Found : Campaigns). Replace the relevance placeholder with the client\'s rule. Paste the share link into each table description.');
const row={
  'Automation': 'Onboard Client',
  'Status': failed.length ? 'Succeeded with errors' : 'Succeeded',
  'Run at': $now.toISO(),
  'Records In': 1,
  'Records Out': 1,
  'Errors': failed.length,
  'Target': prospectId||'',
  'Trigger': 'event',
  'Execution ID': String($execution.id),
  'Execution Link': 'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id,
  'Duration s': Math.round(($now.toMillis() - (rs||$now.toMillis()))/1000),
  'Description': lines.join('\n')
};
if(regRec) row['Client']=[regRec];
return [{ json: row }];
