// Shared origin: a verbatim copy of n8n/Onboard-Client/nodes/Scaffold-Init.js. Onboard Client
// is the source; change it there and copy here (n8n cannot reference a code file across folders).
// Scaffold Init: opens the scaffold state for this run (static data, reset at the trigger) and,
// when this run created the base (Onboard Client's Create ClayRoots Base), marks the seed as
// "created with the base" so the log tells it from "existed". In the scaffold-only door
// (Scaffold Client Base) there is no base creation: the base and the client name come from
// Launch Params and nothing is marked. The launch's Extras picks (the Hub Automations `Extras`
// multi-select on the scaffold door's launch row; `extras` on Onboard Client's webhook query)
// name the declared extras groups the scaffold creates on top of the register (Operator ruling
// 2026-09-02); a pick the register does not declare is a counted failure, never a crash. Only
// reached when a base id is in hand. One item out.
const sd=$getWorkflowStaticData('global');
const reg=$('Scaffold Register').first().json;
let base='', clientName='', seeded=false, picks=[];
try{ const b=$('Create ClayRoots Base').first().json||{}; base=String(b.id||''); seeded=!!base; }catch(e){}
try{ const v=$('Build Client Vars').first().json||{}; clientName=String(v.clientName||''); picks=Array.isArray(v.extras)?v.extras:[]; }catch(e){}
if(!base){ try{ const p=$('Launch Params').first().json||{}; base=String(p.base||''); clientName=clientName||String(p.clientName||''); picks=Array.isArray(p.extras)?p.extras:picks; }catch(e){} }
const S={ base: base, clientName: clientName, pass: 0, seen: {}, created: [], existed: [], skipped: [], failed: [], pending: [], extras: [], extrasPicked: picks.slice() };
const groups=reg.extras||[];
for(const pick of picks){
  const g=groups.find(x=>x.group===pick||x.choice===pick);
  if(!g){ S.failed.push('Extras: "'+pick+'" is not a declared group (the register declares '+groups.map(x=>x.group).join(', ')+'); nothing created for it'); continue; }
  if(S.extras.indexOf(g.group)<0) S.extras.push(g.group);
}
if(seeded){
  S.seen[reg.seed.name+'.(table)']='created';
  S.created.push({ table: reg.seed.name, name: '(table)', kind: 'table', id: '', how: 'base' });
  for(const f of reg.seed.fields){ S.seen[reg.seed.name+'.'+f.name]='created'; S.created.push({ table: reg.seed.name, name: f.name, kind: 'plain', id: '', how: 'base' }); }
}
sd.scaffold=S;
return [{ json: { base: base, extras: S.extras }, pairedItem: { item: 0 } }];
