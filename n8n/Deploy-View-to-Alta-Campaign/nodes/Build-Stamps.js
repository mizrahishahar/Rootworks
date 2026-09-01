// Build Stamps: confirmed landings get this campaign's mirror row unioned into their
// Campaigns links (never a replacement); everything else visible gets its reason in
// Deploy Error. The stamp is the door's dedupe for every future run.
const sd=$getWorkflowStaticData('global'); const dk='deploy_'+$execution.id;
// Static data does not survive the RB Wait resume; restore from the state Collect Push carried.
let D=sd[dk]; if(!D){ try{ D=$('Collect Push').first().json._state; }catch(e){} if(D) sd[dk]=D; }
if(!D){ return [{json:{_lost:true, error:'run state lost and no Collect Push state to restore'}}]; }
if(D.abort){ return [{json:{_none:true}}]; }
const patches=[];
let stamped=0;
for(const rid of Object.keys(D.rows||{})){
  const r=D.rows[rid];
  const fields={};
  if(D.hasDeployError) fields['Deploy Error']=r.skip||'';
  if(r.landed&&D.stampMirrorRid){
    const set={}; for(const c of (r.camps||[])) set[(c&&typeof c==='object')?c.id:c]=1; set[D.stampMirrorRid]=1;
    fields['Campaigns']=Object.keys(set); stamped++;
  }
  if(Object.keys(fields).length) patches.push({id:rid, fields});
}
D.campsStamped=stamped;
if(D.landed&&!stamped) D.warnings.push('landed prospects were not stamped with a Campaigns link (no mirror row)');
const out=[];
for(let i=0;i<patches.length;i+=10) out.push({json:{crBase:D.crBase, tableId:D.tableId, body:{records:patches.slice(i,i+10), typecast:true}}});
if(!out.length) return [{json:{_none:true}}];
return out;
