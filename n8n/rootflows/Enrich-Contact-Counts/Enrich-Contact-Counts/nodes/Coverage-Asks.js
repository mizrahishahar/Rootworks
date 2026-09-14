// Coverage Asks: the domains whose titled count was zero, asked once more with no titles. If
// GetLeads holds nobody at the domain the cell stays blank (unknown, never lean: the one-off's law,
// 274 companies were once dialed as "no infra owner" on that mistake); if it holds people, the
// zero was real and is written.
const c=$('Count Results').first().json||{};
const out=(c.coverage||[]).map(d=>({ json:{ domain:d, body:{ domains:[d] } } }));
if(!out.length) return [{ json:{ _none:true } }];
return out;
