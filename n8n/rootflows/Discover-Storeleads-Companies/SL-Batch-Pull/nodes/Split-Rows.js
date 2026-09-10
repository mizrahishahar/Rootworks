// Split Rows: the batch's rows become items for the shared landing helper (Insert domains to
// Clayroots), with the helper's contract as _meta on the first item. allowNew is off: the parent's
// Preflight already checked, and created, every column this batch writes, so a batch never touches
// the schema. The helper owns Domain Source (create only), the Tag stamp, the DNC drop, Clean
// Fields and the upsert on Domain in tens.
const inp = $('Batch Input').first().json || {};
const rows = ($('Process Batch').first().json.rows) || [];
const items = rows.map(r => ({ json: Object.assign({}, r) }));
if (!items.length) return [];
items[0].json._meta = { base: String(inp.baseId || ''), clientRecId: String(inp.clientRecId || ''), tag: String(inp.tag || '').trim(), domainSource: 'Storeleads', allowNew: false };
return items;
