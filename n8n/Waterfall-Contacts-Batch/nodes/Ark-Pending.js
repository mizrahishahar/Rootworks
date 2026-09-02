// Ark Pending: one item per track id still pending. The whole poll state rides on the FIRST item
// only, which is all Ark Check reads: the lane can hold thousands of pending exports at once, and
// a copy of the state on every item is quadratic memory (the n8n host has been OOM-killed by
// exactly that shape before). Read Callbacks queries the data table once per item, by track id.
const st=$input.first().json||{};
return (st.pending||[]).map((p,i)=>{
  const o={ trackId:p.trackId, domain:p.domain, gap:p.gap };
  if(i===0) o.state=st;
  return { json: o };
});
