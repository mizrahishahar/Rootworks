// Set Watermark: the floor for "since the last successful run". Get Watermark fetched the newest
// Succeeded fleet row of this automation (Status = Succeeded, no Client on the row: a run that served
// everyone with no error line). Its Run at, minus a 24 h overlap, is the floor; both writes this
// machine makes are idempotent, so the overlap costs nothing and covers clock skew. No such row
// (first run): the last 30 days. Leads are compared on their modified_at.
const sd=$getWorkflowStaticData('global');
const R=sd.run;
let wm=null, mode='';
try{
  const r=$input.first().json||{};
  const f=r.fields||r;
  const ra=f['Run at'];
  if(r.id&&ra){ const d=new Date(ra); if(!isNaN(d.getTime())){ wm=new Date(d.getTime()-24*3600*1000); mode='since the last Succeeded fleet run at '+ra+' (24 h overlap)'; } }
}catch(e){}
if(!wm){ wm=new Date(R.startMs-30*86400000); mode='first run: the last 30 days'; }
R.watermark=wm.toISOString();
R.watermarkMs=wm.getTime();
R.watermarkMode=mode;
return [{ json:{ watermark:R.watermark, mode } }];
