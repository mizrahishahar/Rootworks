// Meta Router: the two-phase meta read. Phase one (schema) takes the table Resolve Table found,
// the launch's view on it (by id or exact name; a view not on the table aborts, nothing sent), and
// the client-facing share link from the table description (the receipt's List URL; absent = a
// warning, never a gate). Phase two fetches the view's visible field ids, the merge contract.
// Any view the launch row names deploys (Operator ruling 2026-09-02): the old gate that accepted
// only "... : Campaigns" views is gone.
const sd=$getWorkflowStaticData('global'); const dk='deploy_'+$execution.id; const D=sd[dk];
const j=($input.first()||{}).json||{};
if(!D.metaPhase||D.metaPhase==='schema'){
  const tables=Array.isArray(j.tables)?j.tables:[];
  D.schemaTables=tables;
  let viewUrl='';
  if(!tables.length){
    if(!D.abort){ D.abort='could not read base schema'; D.errors.push('could not read base schema for '+D.crBase+(j.error?': '+JSON.stringify(j.error).slice(0,150):'')); }
  } else if(!D.abort){
    // Resolve Table already turned the launch's table name into D.tableId; a miss aborted there.
    const t=tables.find(x=>x.id===D.tableId);
    if(!t){ D.abort='table not found'; D.errors.push('table '+(D.tableName||D.table)+' not found in base '+D.crBase); }
    else {
      D.tableId=t.id; D.tableName=t.name;
      // The client-facing share link lives in the table description ("Campaigns view:
      // https://airtable.com/shr..."), pasted at setup; the API cannot mint share links.
      const shrM=String(t.description||'').match(/https:\/\/airtable\.com\/(?:app[A-Za-z0-9]{14}\/)?shr[A-Za-z0-9]+/);
      if(shrM){ D.shareViewLink=shrM[0]; }
      else { D.warnings.push('table "'+t.name+'" description carries no share link; receipt written without a client link'); }
      const v=(t.views||[]).find(x=>x.id===D.view||String(x.name||'').trim()===D.view);
      if(!v){ D.abort='view not found'; D.errors.push('view "'+D.view+'" is not on table "'+t.name+'" in base '+D.crBase+'; nothing was sent'); }
      else {
        D.viewId=v.id; D.viewType=v.type||'';
        if((v.type||'grid')==='grid'){ viewUrl='https://api.airtable.com/v0/meta/bases/'+D.crBase+'/views/'+v.id+'?include=visibleFieldIds'; }
      }
    }
  }
  if(viewUrl && !D.abort){ D.metaPhase='view'; return [{json:{metaUrl:viewUrl, again:true}}]; }
  D.metaPhase='done'; D.viewMeta=null;
  return [{json:{again:false}}];
}
D.metaPhase='done';
D.viewMeta=j;
return [{json:{again:false}}];
