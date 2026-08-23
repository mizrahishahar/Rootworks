// One-off: add fields to a table through Airtable's meta API. Body: { base, table, fields:[{name,type,options?}] }.
// Exists because the Airtable MCP cannot always reach the schema; the Airtable credential in n8n can.
const b=($input.first().json||{}).body||{};
if(!b.base||!b.table||!Array.isArray(b.fields)||!b.fields.length) throw new Error('need base, table, fields[]');
return b.fields.map(f=>({ json:{ base:b.base, table:b.table, field:f } }));
