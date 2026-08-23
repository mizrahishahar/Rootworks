// Plan View (runs once per item): the view's visible field names, in view order. This list is
// the contract for every row read from it: each visible column that is not a machine, never-block
// or identity field is a variable that must be filled (Deploy View to Campaign doctrine).
const r=$('Resolve View').item.json||{};
const j=$input.item.json||{};
const body=j.body!==undefined?j.body:j;
const out=Object.assign({},r,{ visible:null });
if(r.viewUrl){
  const ids=Array.isArray(body.visibleFieldIds)?body.visibleFieldIds:null;
  if(ids){ out.visible=ids.map(id=>r.fieldsById[id]).filter(Boolean); }
  else out.why='view metadata call failed for "'+r.view+'": '+String((body&&(body.error&&(body.error.message||body.error.type)))||('HTTP '+(j.statusCode||'?'))).slice(0,120);
}
delete out.fieldsById;
return { json: out };
