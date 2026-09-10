// Init: the submit answers (aligned to Submit Requests) with BounceBan's verification id attached;
// an address BounceBan refused carries no id and is written as an error in the verdict.
const reqs=$('Submit Requests').all().map(i=>i.json||{}).filter(j=>!j._none);
const t0=Date.now();
return $input.all().map((it,i)=>{ const q=reqs[i]||{}; const r=it.json||{}; return { json:{ rowId:q.rowId, email:q.email, origin:q.origin, pos:q.pos, id:(r&&r.id)?String(r.id):'', result:'', _t0:t0, _submitErr:(r&&r.id)?'':String((r&&(r.message||r.error))||'no id in the answer').slice(0,120) } }; });
