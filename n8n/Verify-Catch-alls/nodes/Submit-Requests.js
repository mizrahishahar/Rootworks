// Submit Requests: only the addresses to submit (rows with no candidate carry nothing to BounceBan
// and settle as no_email_found in the verdict).
const items=$input.all().map(i=>i.json||{}).filter(j=>!j._empty&&!j._none&&j.email);
if(!items.length) return [{ json:{ _none:true } }];
return items.map(j=>({ json:{ rowId:j.rowId, email:j.email, origin:j.origin, pos:j.pos } }));
