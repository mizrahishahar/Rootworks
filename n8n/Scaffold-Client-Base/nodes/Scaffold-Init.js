// Shared origin: a verbatim copy of n8n/Onboard-Client/nodes/Scaffold-Init.js. Onboard Client
// is the source; change it there and copy here (n8n cannot reference a code file across folders).
// Scaffold Init: opens the scaffold state for this run (static data, reset at the trigger) and,
// when this run created the base (Onboard Client's Create ClayRoots Base), marks the seed as
// "created with the base" so the log tells it from "existed". In the scaffold-only door
// (Scaffold Client Base) there is no base creation: the base and the client name come from
// Launch Params and nothing is marked. Only reached when a base id is in hand. One item out.
const sd=$getWorkflowStaticData('global');
const reg=$('Scaffold Register').first().json;
let base='', clientName='', seeded=false;
try{ const b=$('Create ClayRoots Base').first().json||{}; base=String(b.id||''); seeded=!!base; }catch(e){}
try{ clientName=String($('Build Client Vars').first().json.clientName||''); }catch(e){}
if(!base){ try{ const p=$('Launch Params').first().json||{}; base=String(p.base||''); clientName=clientName||String(p.clientName||''); }catch(e){} }
const S={ base: base, clientName: clientName, pass: 0, seen: {}, created: [], existed: [], skipped: [], failed: [], pending: [] };
if(seeded){
  S.seen[reg.seed.name+'.(table)']='created';
  S.created.push({ table: reg.seed.name, name: '(table)', kind: 'table', id: '', how: 'base' });
  for(const f of reg.seed.fields){ S.seen[reg.seed.name+'.'+f.name]='created'; S.created.push({ table: reg.seed.name, name: f.name, kind: 'plain', id: '', how: 'base' }); }
}
sd.scaffold=S;
return [{ json: { base: base }, pairedItem: { item: 0 } }];
