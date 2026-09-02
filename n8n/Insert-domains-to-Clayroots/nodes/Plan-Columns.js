// Plan Columns: one meta-API call per open field Check Columns approved, a singleLineText
// column on Companies. Runs once per run, only when there is something to create.
const c=$('Check Columns').first().json;
const url='https://api.airtable.com/v0/meta/bases/'+c.base+'/tables/'+c.tableId+'/fields';
return c.toCreate.map(name=>({ json: { name: name, url: url, body: { name: name, type: 'singleLineText' } } }));
