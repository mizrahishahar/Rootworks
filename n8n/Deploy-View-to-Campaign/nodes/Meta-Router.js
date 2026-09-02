const sd=$getWorkflowStaticData('global'); const dk='deploy_'+$execution.id; const D=sd[dk];
const j=($input.first()||{}).json||{};
if(!D.metaPhase||D.metaPhase==='schema'){
  const tables=Array.isArray(j.tables)?j.tables:[];
  D.schemaTables=tables;
  let viewUrl='';
  if(!tables.length){
    if(!D.abort){ D.abort='could not read base schema'; D.errors.push('could not read base schema for '+D.crBase+(j.error?': '+JSON.stringify(j.error).slice(0,150):'')); }
  } else {
    // Resolve Table already turned the launch's table name into D.tableId; a miss aborted there.
    const t=tables.find(x=>x.id===D.tableId);
    if(!t){
      if(!D.abort){ D.abort='table not found'; D.errors.push('table '+(D.tableName||D.table)+' not found in base '+D.crBase); }
    } else {
      D.tableId=t.id; D.tableName=t.name;
      // The standing receipt view is a hard gate: no deploy without it. It is the
      // one durable window (filter: Relevant AND Status=done, campaign fields)
      // that every Lead Lists receipt links to, per the clayroots-tables standard.
      const rv=(t.views||[]).find(x=>['relevant & found : campaigns','relevant : campaigns'].includes(String(x.name||'').trim().toLowerCase()));
      if(rv){ D.receiptViewId=rv.id; }
      else if(!D.abort){ D.abort='missing standing view'; D.errors.push('table "'+t.name+'" has no "Relevant & Found : Campaigns" (or intent "Relevant : Campaigns") view; build the standing chain (clayroots-tables table-setup) before deploying; nothing was sent'); }
      // The client-facing share link for that view lives in the table description
      // ("Campaigns view: https://airtable.com/shr..."), pasted at setup; the API
      // cannot mint share links, so its absence is the second hard gate.
      const shrM=String(t.description||'').match(/https:\/\/airtable\.com\/(?:app[A-Za-z0-9]{14}\/)?shr[A-Za-z0-9]+/);
      if(shrM){ D.shareViewLink=shrM[0]; }
      else if(!D.abort){ D.abort='missing share link'; D.errors.push('table "'+t.name+'" description carries no share link for the Relevant & Found : Campaigns view; in Chrome: Share view -> create link, password {Client}01, then paste "Campaigns view: https://airtable.com/shr..." into the table description (clayroots-tables table-setup); nothing was sent'); }
      const v=(t.views||[]).find(x=>x.id===D.view||x.name===D.view);
      if(v){
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