// Build DNC Creates: Read DNC paged the client's DNC table (Domain only). A domain already there is
// counted as already there and left untouched, its Reason and Notes included: an existing row is never
// overwritten. The rest become create bodies, ten records per call, Reason = Not interested, Added =
// today (Jerusalem, ISO date), Notes = the campaign name and lead email lines. An unreadable DNC table
// is an error line and no create is attempted (a blind create could duplicate a domain).
const sd=$getWorkflowStaticData('global');
const c=sd.clients[sd.currentClient];
const existing={};
let readOk=true;
for(const it of $input.all()){
  const j=it.json||{};
  if(Array.isArray(j.records)){
    for(const r of j.records){ const d=String((r.fields||{})['Domain']||'').toLowerCase().trim(); if(d) existing[d]=1; }
  } else if(j.error||Number(j.statusCode||0)>=400){
    readOk=false;
    c.errors.push('DNC read failed on '+c.dncTableName+' ('+c.dncTableId+'): '+JSON.stringify(j.error||j).slice(0,200)+'; no DNC row was created');
  }
}
if(!readOk){ c.domains={}; return [{ json:{ _none:true } }]; }
const today=$now.setZone('Asia/Jerusalem').toFormat('yyyy-MM-dd');
const recs=[];
for(const dom of Object.keys(c.domains)){
  if(existing[dom]){ c.dncExisting++; continue; }
  const d=c.domains[dom];
  recs.push({ fields:{ 'Domain':dom, 'Reason':'Not interested', 'Added':today, 'Notes':d.notes.join('\n').slice(0,5000) } });
}
c.domains={};
if(!recs.length) return [{ json:{ _none:true } }];
const out=[];
for(let i=0;i<recs.length;i+=10){
  const slice=recs.slice(i,i+10);
  out.push({ json:{ crBase:c.crBase, dncTableId:c.dncTableId, body:{ records:slice, typecast:true }, count:slice.length } });
}
return out;
