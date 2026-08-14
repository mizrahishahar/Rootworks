const sd=$getWorkflowStaticData('global');
const c=sd.clients[sd.currentClient];
let wm=null;
if(!((sd.run||{}).fullPass)){
  try{
    const r=$input.first().json||{};
    const f=r.fields||r;
    const ra=f['Run at'];
    if(r.id&&ra){ const d=new Date(ra); if(!isNaN(d.getTime())) wm=new Date(d.getTime()-24*3600*1000).toISOString(); }
  }catch(e){}
}
c.watermark=wm;
return [{json:{clientRecId:sd.currentClient, watermark:wm, ws:c.ws}}];