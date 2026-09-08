// One item per trackId from the door's body. Fifty per call at most: the two AI-Ark reads are
// paced 600 ms apart each, so a call of fifty answers inside about a minute.
const b=($input.first().json||{}).body||{};
const ids=(Array.isArray(b.trackIds)?b.trackIds:[]).map(s=>String(s||'').trim()).filter(s=>/^[0-9a-f-]{36}$/i.test(s)).slice(0,50);
if(!ids.length) throw new Error('AI-Ark Ops: body.trackIds is empty');
return ids.map((t,i)=>({ json:{ i:i, trackId:t } }));
