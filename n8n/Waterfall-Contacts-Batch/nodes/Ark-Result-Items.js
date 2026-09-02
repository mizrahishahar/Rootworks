// Ark Result Items: one item per finished export that found anyone (found > 0; 78 percent of
// exports return nothing, measured 2026-09-02, and the results door is not read for those). The
// results door is paged by the HTTP node. Nothing to fetch: one placeholder (empty trackId) so
// Any Ark Results? routes straight to Parse Ark.
const st=$input.first().json||{};
const items=(st.done||[]).filter(d=>Number(d.found)>0).map(d=>({ json: { trackId:d.trackId, domain:d.domain, gap:d.gap, total:d.total, found:d.found } }));
return items.length?items:[{ json: { trackId:'' } }];
