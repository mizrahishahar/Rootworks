const sd=$getWorkflowStaticData('global'); const D=sd.deploy;
const j=($input.first()||{}).json||{};
if(!D.metaPhase||D.metaPhase==='schema'){
  const tables=Array.isArray(j.tables)?j.tables:[];
  D.schemaTables=tables;
  let viewUrl='';
  if(!tables.length){
    if(!D.abort){ D.abort='could not read base schema'; D.errors.push('could not read base schema for '+D.crBase+(j.error?': '+JSON.stringify(j.error).slice(0,150):'')); }
  } else {
    const t=tables.find(x=>x.id===D.tableId||x.name===D.tableId);
    if(!t){
      if(!D.abort){ D.abort='table not found'; D.errors.push('table '+D.tableId+' not found in base '+D.crBase); }
    } else {
      D.tableId=t.id; D.tableName=t.name;
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