const m=$('Merge Dictionary').first().json;
const tally=function(name){ try{ const items=$(name).all(); let fail=0; for(const i of items){ if(i.json && i.json.error){ fail++; } } return { n: items.length, fail: fail }; }catch(e){ return { n:0, fail:0 }; } };
const gw=tally('Upsert Given Names');
const sw=tally('Upsert Surnames');
const givenOut=gw.n-gw.fail;
const surnameOut=sw.n-sw.fail;
const writeFailures=gw.fail+sw.fail;
let dur=0;
try{ if(m.startedAt){ dur=Math.max(0, Math.round(($now.toMillis()-new Date(m.startedAt).getTime())/1000)); } }catch(e){}
const conflicts=m.conflictKeys||[];
const B='\u2022 ';
const lines=[
B+'Source table: '+m.tableName+' ('+m.tableId+') in '+m.baseId,
B+'Rows scanned: '+m.scanned,
B+'Hebrew-speaker rows: '+m.hebrewRows,
B+'Given-name pairs written: '+givenOut+' (of '+((m.given||[]).length)+' prepared, '+(m.mergedGiven||0)+' merged into existing keys)',
B+'Conflicts found: '+conflicts.length+(conflicts.length?(' (e.g. '+conflicts.slice(0,20).join(', ')+')'):''),
B+'Already-Hebrew first names skipped: '+m.skippedAlreadyHebrew,
B+'Junk first names skipped: '+m.skippedJunk,
B+'Surnames written strong: '+(m.strongCount||0),
B+'Surnames written weak: '+(m.weakCount||0),
B+'Surname rows written: '+surnameOut+' (of '+((m.surnames||[]).length)+' prepared, '+(m.mergedSurnames||0)+' merged into existing keys)',
B+'Surnames below threshold, not written: '+(m.surnamesSkipped||0),
B+'Write failures: '+writeFailures,
B+'Pages fetched: '+m.pages+(m.capHit?' (1000-page cap hit, the read stopped early)':'')
];
const status=(writeFailures>0 && (givenOut+surnameOut)===0)?'Failed':'Succeeded';
return [{ json: {
  'Automation':'Seed Hebrew Dictionary',
  'Status':status,
  'Run at': $now.toISO(),
  'Target': m.tableName+' ('+m.tableId+')',
  'Table ID': m.tableId,
  'Records In': m.scanned,
  'Records Out': givenOut+surnameOut,
  'Errors': writeFailures,
  'Duration s': dur,
  'Trigger':'form',
  'Description': lines.join('\n'),
  'Execution Link':'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id,
  'Execution ID': String($execution.id)
} }];