// Ark Result Items: one item per finished export; the results door is paged by the HTTP node.
const st=$input.first().json||{};
return (st.done||[]).map(d=>({ json: { trackId:d.trackId, domain:d.domain, gap:d.gap, total:d.total, found:d.found } }));
