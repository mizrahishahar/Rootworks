// A guard tripped before any paid call: the launch payload, the Signals row, or the client row
// is missing something. One error, the row says exactly what. 'Failed' is the Error Logger's
// word for a crash; a guard trip is Succeeded with errors.
// Reused from Insert Hiring domains to Clayroots; diffs: the Automation name and the fix-it text.
let g={};
try{ const p=$('Parse Play').first().json; if(p&&p.config_ok===false) g=p; }catch(e){}
if(!g.guard){ try{ const l=$('Parse Launch').first().json; if(l&&l.config_ok===false) g=l; }catch(e){} }
let baseMissing=false; if(!g.guard){ try{ const c=$('Client Vars').first().json; if(c&&!c.base){ baseMissing=true; g=Object.assign({},$('Parse Play').first().json,{guard:'client'}); } }catch(e){} }
const what=g.guard==='launch'?'Apify webhook payload':(g.guard==='play'?'Signals row '+(g.play||''):'client row '+(g.client||''));
const missing=baseMissing?'Clayroots Base ID on the Hub Clients row':((g.missing||[]).join(', ')||'unknown');
const row={
 'Automation':'Insert Reviews domains to Clayroots',
 'Status':'Succeeded with errors',
 'Run at': $now.toISO(),
 'Records In': 0,
 'Records Out': 0,
 'Errors': 1,
 'Target': 'Companies',
 'Trigger':'webhook',
 'Execution ID': String($execution.id),
 'Execution Link': 'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id,
 'Description': '**Guard tripped before any paid call, 1 error**\n\n**Where:** '+what+'\n\n**Missing / unreadable:** '+missing+'\n\nThe Signals row needs: Client link (its Clients row carries the Clayroots Base ID), Country, Max Employees, ICP. The Apify payload needs {play: <Signals record id>, resource}. Fix and rerun.'
};
if(g.client) row['Client']=[g.client];
return [{json:row}];
