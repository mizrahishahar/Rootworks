// Poll Gate: one status answer folded onto the carrier. FullEnrich says CREATED or IN_PROGRESS while
// it works (or answers 400 error.enrichment.in_progress), and FINISHED, CANCELED or
// CREDITS_INSUFFICIENT when it has stopped. The loop asks every 10 seconds for up to 90 seconds (the calling handler waits 120); at
// the cap one last read is forced (forceResults) so whatever FullEnrich found so far is kept, and the
// people without an answer stay retryable. Only the phones ride on: the profile FullEnrich sends back
// with a LinkedIn lookup is dropped here so the batch stays small.
const MAX=90*1000, WAIT=10;
const c=Object.assign({}, $('Poll Input').first().json||{});
const j=$input.first().json||{};
const code=Number(j.statusCode)||0;
let b=(j.body!==undefined)?j.body:j;
if(typeof b==='string'){ try{ b=JSON.parse(b); }catch(e){ b={}; } }
b=b||{};
const elapsed=Date.now()-(Number(c._t0)||Date.now());
c.polls=(Number(c.polls)||0)+1;
const wasForced=!!c._force;
const pick=(list)=>(Array.isArray(list)?list:[]).map(d=>{
  const ci=(d&&d.contact_info)||{};
  const ph=ci.most_probable_phone||((Array.isArray(ci.phones)&&ci.phones[0])||null);
  return { rowId:String(((d&&d.custom)||{}).row_id||''), number:ph?String(ph.number||''):'', lineType:ph?String(ph.line_type||''):'', region:ph?String(ph.region||''):'' };
}).filter(x=>x.rowId);
const STOPPED=['FINISHED','CANCELED','CREDITS_INSUFFICIENT'];
let settled=false;
if(j.error&&j.body===undefined&&b.status===undefined){
  c.pollErr=String((j.error&&j.error.message)||j.error||'poll failed').slice(0,160);
} else if(code===401||code===404){
  c.pollErr='HTTP '+code+' '+String(b.code||'')+' '+String(b.message||''); c.status='UNREADABLE'; settled=true;
} else if(b.status){
  c.status=String(b.status); c.pollErr='';
  if(STOPPED.indexOf(c.status)>-1||wasForced){ c.found=pick(b.data); c.credits=Number((b.cost||{}).credits)||0; settled=true; }
} else {
  // 400 error.enrichment.in_progress, 429, or an answer without a status: still open.
  c.pollErr=(code&&code!==400)?('HTTP '+code+' '+String(b.code||'')):'';
}
if(!settled&&wasForced){ settled=true; }
if(!settled&&elapsed>=MAX){ c._force=true; }
c.timedOut=settled&&wasForced&&STOPPED.indexOf(c.status)<0;
c._loop=!settled;
c._nextWaitSec=c._force?1:WAIT;
c._elapsedS=Math.round(elapsed/1000);
return [{ json:c }];
