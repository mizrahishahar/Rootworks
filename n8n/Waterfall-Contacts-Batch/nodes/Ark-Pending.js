// Ark Pending: one item per track id still pending, each carrying the whole poll state so Ark
// Check can rebuild it without reaching back across the loop. Read Callbacks queries the data
// table once per item, by track id.
const st=$input.first().json||{};
return (st.pending||[]).map(p=>({ json: { trackId:p.trackId, domain:p.domain, gap:p.gap, state:st } }));
