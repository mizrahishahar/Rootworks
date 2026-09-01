// Ark Pending: one item per track id still pending, each carrying the whole poll state so
// Ark Check can rebuild it without reaching back across the loop.
const st=$input.first().json||{};
return (st.pending||[]).map(p=>({ json: { trackId:p.trackId, domain:p.domain, state:st } }));
