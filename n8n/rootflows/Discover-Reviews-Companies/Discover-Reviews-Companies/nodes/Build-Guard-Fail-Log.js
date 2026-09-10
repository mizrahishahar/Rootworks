// Build Guard Fail Log: a guard tripped before any paid call, so the run closes with one Hub
// Automations row that names exactly what is wrong and nothing was spent or written. The four
// guards, in the order they can trip:
//   launch  the Apify payload: {play: <Hub Signals record id>, resource}
//   play    the Signals row: Client link, Country, ICP
//   client  the Hub Clients row: Clayroots Base ID
//   base    the client base: the Companies table, the Signals mirror, and exactly one mirror row
//           for this signal (Find Companies Table and Resolve Mirror Row, refusals since
//           2026-09-10; they used to throw and the Operator got a crash instead of a reason)
// 'Failed' is the Error Logger's word for a crash; a guard trip is Succeeded with errors.
let g={};
let baseRefusal='';
try{ const m=$('Resolve Mirror Row').first().json; if(m&&m.refused){ baseRefusal=String(m.refused); g=Object.assign({},$('Parse Play').first().json,{guard:'base'}); } }catch(e){}
if(!g.guard){ try{ const p=$('Parse Play').first().json; if(p&&p.config_ok===false) g=p; }catch(e){} }
if(!g.guard){ try{ const l=$('Parse Launch').first().json; if(l&&l.config_ok===false) g=l; }catch(e){} }
let baseMissing=false; if(!g.guard){ try{ const c=$('Client Vars').first().json; if(c&&!c.base){ baseMissing=true; g=Object.assign({},$('Parse Play').first().json,{guard:'client'}); } }catch(e){} }
const what=g.guard==='launch'?'Apify webhook payload'
  :(g.guard==='play'?'Signals row '+(g.play||'')
  :(g.guard==='base'?'the client base':'client row '+(g.client||'')));
const missing=baseRefusal||(baseMissing?'Clayroots Base ID on the Hub Clients row':((g.missing||[]).join(', ')||'unknown'));
const row={
 'Automation':'Discover Reviews Companies',
 'Status':'Failed',
 'Run at': $now.toISO(),
 'Records In': 0,
 'Records Out': 0,
 'Errors': 1,
 'Target': 'Companies',
 'Trigger':'webhook',
 'Execution ID': String($execution.id),
 'Execution Link': 'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id,
 'Description': '**Guard tripped before any paid call, 1 error**\n\n**Where:** '+what+'\n\n**Missing / unreadable:** '+missing+'\n\nThe payload needs {play: <Hub Signals record id>, resource}. The Signals row needs: Client link (its Clients row carries the Clayroots Base ID), Country, ICP. The client base needs a Companies table, a synced Signals mirror carrying Name, and exactly one mirror row named like this signal. Fix and re-fire the Apify task.'
};
if(g.client) row['Client']=[g.client];
return [{json:row}];
