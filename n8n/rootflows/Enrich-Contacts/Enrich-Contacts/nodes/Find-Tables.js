// Find Tables: the client base must already carry tables named exactly "Companies" and
// "People" in the register's shape. Nothing here ever creates a table or a field; the
// scaffold is Onboard Client's job. DNC is optional and found by name. Since 2026-09-08 the
// People field types travel too: Contact Source is written as a list when the base carries it as
// a multi-select, and as the first source only while it is still a single select.
const p=$('Launch Params').first().json;
const r=$input.first().json||{};
const body=(r.body!==undefined)?r.body:r;
const tables=(body&&Array.isArray(body.tables))?body.tables:null;
if(!tables){ throw new Error('Could not read the table list for base '+p.base+': '+JSON.stringify(body).slice(0,200)+'. Nothing was pulled.'); }
const byName=(n)=>tables.find(x=>String(x.name||'').trim().toLowerCase()===n);
const companies=byName('companies');
if(!companies){ throw new Error('Base '+p.base+' has no Companies table. Scaffold the client base to the ClayRoots Standard first. Nothing was pulled.'); }
const people=byName('people');
if(!people){ throw new Error('Base '+p.base+' has no People table. Scaffold the client base to the ClayRoots Standard first. Nothing was pulled.'); }
const cNames=new Set((companies.fields||[]).map(x=>x.name));
for(const need of ['Domain','Company','Employees','Tag','Contacts Pulled At']){ if(!cNames.has(need)){ throw new Error('Companies table '+companies.id+' is missing the core field "'+need+'". Bring it to the register first. Nothing was pulled.'); } }
const pNames=new Set((people.fields||[]).map(x=>x.name));
for(const need of ['Name','Contact Key','Domain','LinkedIn URL','Companies','Contact Source']){ if(!pNames.has(need)){ throw new Error('People table '+people.id+' is missing the core field "'+need+'". Bring it to the register first. Nothing was pulled.'); } }
const pTypes={}; for(const x of (people.fields||[])) pTypes[x.name]=x.type;
const dnc=byName('dnc');
return [{ json: Object.assign({}, p, {
  companiesTableId: companies.id, companiesTableName: companies.name, companiesFields: Array.from(cNames),
  peopleTableId: people.id, peopleTableName: people.name, peopleFields: Array.from(pNames), peopleFieldTypes: pTypes,
  contactSourceMulti: pTypes['Contact Source']==='multipleSelects',
  dncTableId: dnc?dnc.id:'', dncTableName: dnc?dnc.name:''
}) }];
