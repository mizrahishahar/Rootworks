// Resolve View (runs once per item): from the base schema, find this Intent table's "Email"
// view and the field list, and build the URL that returns the view's visible fields. No view ->
// viewUrl '' and a reason; the run logs it and enrolls nothing from that table.
const VIEW='Email';
const cfg=$('Parse Client Config').item.json||{};
const j=$input.item.json||{};
const body=j.body!==undefined?j.body:j;
const tables=Array.isArray(body.tables)?body.tables:[];
const out=Object.assign({},cfg,{ view:VIEW, viewId:'', viewUrl:'', fieldsById:{}, why:'' });
const t=tables.find(x=>x.id===cfg.tableId||x.name===cfg.tableId);
if(!tables.length) out.why='could not read base schema for '+cfg.baseId;
else if(!t) out.why='table '+cfg.tableId+' not found in base '+cfg.baseId;
else {
  for(const f of (t.fields||[])) out.fieldsById[f.id]=f.name;
  const v=(t.views||[]).find(x=>x.name===VIEW);
  if(!v) out.why='view "'+VIEW+'" not found on table '+(t.name||cfg.tableId)+'; create it (filter: Email Campaign is not empty)';
  else if((v.type||'grid')!=='grid') out.why='view "'+VIEW+'" is type '+v.type+', not grid';
  else { out.viewId=v.id; out.viewUrl='https://api.airtable.com/v0/meta/bases/'+cfg.baseId+'/views/'+v.id+'?include=visibleFieldIds'; }
}
return { json: out };
