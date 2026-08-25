const sd=$getWorkflowStaticData('global'); const dk='deploy_'+$execution.id; const D=sd[dk];
const patches=[];
let deployed=0, missing=0, stamped=0;
const skipCounts={};
for(const rid of Object.keys(D.rows||{})){
  const r=D.rows[rid];
  let v='', inCamp=false;
  if(r.skip){ v=r.skip; const key=r.skip.indexOf('DNC:')===0?'DNC':r.skip; skipCounts[key]=(skipCounts[key]||0)+1; }
  else if(D.rbFailed){ continue; }
  else if(r.email&&D.inCamp[r.email]){ v=''; deployed++; inCamp=true; }
  else { v='not in campaign after deploy (dedupe-skipped or PV-dropped)'; missing++; }
  const fields={'Deploy Error':v};
  // Membership stamp: confirmed leads get this campaign's mirror row linked,
  // as a union with the row's existing links, never a replacement.
  if(inCamp&&D.mirrorRid){
    const set={}; for(const c of (r.camps||[])) set[c]=1; set[D.mirrorRid]=1;
    fields['Campaigns']=Object.keys(set); stamped++;
  }
  patches.push({id:rid, fields});
}
D.deployed=deployed; D.missing=missing; D.skipCounts=skipCounts; D.campsStamped=stamped;
if(deployed&&!stamped&&!D.rbFailed) D.warnings.push('deployed leads were not stamped with a Campaigns link (no mirror row resolved)');
D.inCamp={}; D.emailToRow={};
const out=[];
for(let i=0;i<patches.length;i+=10) out.push({json:{crBase:D.crBase, tableId:D.tableId, body:{records:patches.slice(i,i+10), typecast:true}}});
if(!out.length) return [{json:{_none:true}}];
return out;