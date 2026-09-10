// Attach Meta: the call shape the helper Insert domains to Clayroots reads. The rows go through
// as formatted, minus the run's own carriers (_stats and _empty stay behind for Build Run Log),
// and the first item carries _meta {base, clientRecId, tag, domainSource, allowNew}: no Tag (a
// signal is the Signals link, never a Tag), Domain Source = Signal, allowNew false (the Job
// columns are register extras; nothing outside the register may be created, so a base without
// the Hiring group is refused by the helper).
const cv=$('Client Vars').first().json;
const rows=$input.all().map(i=>i.json).filter(j=>j&&!j._empty);
const out=rows.map(j=>{ const r={}; for(const k of Object.keys(j)){ if(!k.startsWith('_')) r[k]=j[k]; } return { json:r }; });
if(!out.length) return [{ json:{ _empty:true } }];
out[0].json._meta={ base: cv.base, clientRecId: cv.clientRecId, tag:'', domainSource:'Signal', allowNew:false };
return out;
