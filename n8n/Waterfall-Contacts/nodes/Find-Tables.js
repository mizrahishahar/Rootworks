// Find Tables: the client base must already carry tables named exactly "Companies" and
// "People" in the register's shape. Nothing here ever creates a table or a field; the
// scaffold is Onboard Client's job (List Building 2.0). DNC is optional and found by name.
const p=$('Launch Params').first().json;
const r=$input.first().json||{};
const body=(r.body!==undefined)?r.body:r;
const tables=(body&&Array.isArray(body.tables))?body.tables:null;
if(!tables){ throw new Error('Could not read the table list for base '+p.base+': '+JSON.stringify(body).slice(0,200)+'. Nothing was pulled.'); }
const byName=(n)=>tables.find(x=>String(x.name||'').trim().toLowerCase()===n);
const companies=byName('companies');
if(!companies){ throw new Error('Base '+p.base+' has no Companies table. Scaffold the client base to the List Building 2.0 standard first. Nothing was pulled.'); }
const people=byName('people');
if(!people){ throw new Error('Base '+p.base+' has no People table. Scaffold the client base to the List Building 2.0 standard first. Nothing was pulled.'); }
const cNames=new Set((companies.fields||[]).map(x=>x.name));
for(const need of ['Domain','Company','Employees','Tag','Contacts Pulled At']){ if(!cNames.has(need)){ throw new Error('Companies table '+companies.id+' is missing the core field "'+need+'". Bring it to the register first. Nothing was pulled.'); } }
const pNames=new Set((people.fields||[]).map(x=>x.name));
for(const need of ['Name','Contact Key','Domain','LinkedIn URL','Companies','Contact Source']){ if(!pNames.has(need)){ throw new Error('People table '+people.id+' is missing the core field "'+need+'". Bring it to the register first. Nothing was pulled.'); } }
const dnc=byName('dnc');
return [{ json: Object.assign({}, p, {
  companiesTableId: companies.id, companiesTableName: companies.name, companiesFields: Array.from(cNames),
  peopleTableId: people.id, peopleTableName: people.name, peopleFields: Array.from(pNames),
  dncTableId: dnc?dnc.id:'', dncTableName: dnc?dnc.name:''
}) }];
