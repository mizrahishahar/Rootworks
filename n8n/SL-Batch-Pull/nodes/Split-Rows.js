// Split Rows: one item per Companies row for the helper (Insert domains to Clayroots), with
// the helper's contract as _meta on the first row. allowNew is off: the parent's preflight
// already checked the columns and created any open field once for the run.
const inp = $('Batch Input').first().json;
const rows = $('Process Batch').first().json.rows || [];
const out = rows.map(r => ({ json: r }));
if (out.length) out[0].json._meta = { base: inp.baseId, clientRecId: inp.clientRecId || '', tag: inp.tag || '', domainSource: 'Storeleads', allowNew: false };
return out;
