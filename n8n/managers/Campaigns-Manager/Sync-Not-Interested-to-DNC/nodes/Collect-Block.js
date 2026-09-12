// Collect Block: reads one blocklist call back. A 2xx with entries_added adds to the client's blocked
// and already-in-blocklist counts; anything else is an error line naming how many domains the call
// carried. The DNC write still happens either way: the suppression list is the client's record.
const sd=$getWorkflowStaticData('global');
const c=sd.clients[sd.currentClient];
const B=sd.block||{};
const j=($input.first()||{}).json||{};
const hasWrap=Object.prototype.hasOwnProperty.call(j,'body');
const body=hasWrap?j.body:j;
const status=Number(j.statusCode||0);
const ok=(!status||(status>=200&&status<300))&&body&&typeof body==='object'&&(body.entries_added!==undefined||body.status==='success');
if(ok){
  c.blocked+=Number(body.entries_added||0);
  c.alreadyBlocked+=Number(body.already_in_blocklist||0);
} else {
  c.errors.push('blocklist add failed for '+Number(B.currentCount||0)+' domains (status '+(status||'?')+'): '+JSON.stringify(body).slice(0,200));
}
return [{ json:{ next:true } }];
