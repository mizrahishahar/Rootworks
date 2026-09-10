// Keeps only prospects whose client is in this run's scope (the PV clients picked by Init Results).
// A prospect of a client outside the scope (an Alta client, a non-PV client, a client filtered out
// on an on-demand run) is out of scope, not a thread problem: counted once as a skip, never as an error.
const sd=$getWorkflowStaticData('global');
const cm=sd.clientMap||{};
const toId=(c)=>typeof c==='string'?c:((c&&c.id)||'');
let scopeSkipped=0;
const items=[];
for(const it of $input.all()){
  if(!it||!it.json||!it.json.id) continue;
  const f=it.json.fields||it.json;
  const cl=Array.isArray(f.Client)?f.Client.map(toId):[];
  if(!cl.length||!cm[cl[0]]){ scopeSkipped++; continue; }
  items.push(it);
}
sd.threadStats=sd.threadStats||{checked:0,updated:0,problems:[]};
sd.threadStats.scopeSkipped=scopeSkipped;
if(!items.length) return [{ json: { _empty:true } }];
return items;
