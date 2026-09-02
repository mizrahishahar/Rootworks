// Event Row: the sub entry carries one item with the same keys as a launch row (Client, Table,
// View, Tiers, Sources, Departments, Roles, Max companies). This is how an insert door calls this
// machine after landing: Table "Companies", View "Not Sourced". Shape it like Fetch Launch
// Record's output so Resolve Base and Launch Params read one shape on both entries; the camelCase
// spellings a door might send are folded into the row keys here. Sources is still folded so a
// door or a launch row from before the Tiers mode still resolves.
const j=$input.first().json||{};
const f=(j.fields&&typeof j.fields==='object')?Object.assign({},j.fields):Object.assign({},j);
const arr=(v)=>Array.isArray(v)?v:(v?[v]:[]);
const alias=(key,alts)=>{ if(f[key]===undefined||f[key]===''||f[key]===null){ for(const a of alts){ if(f[a]!==undefined&&f[a]!==''&&f[a]!==null){ f[key]=f[a]; break; } } } };
alias('Table',['table']); alias('View',['view']); alias('Tiers',['tiers']); alias('Sources',['sources']); alias('Departments',['departments']); alias('Roles',['roles']); alias('Max companies',['maxCompanies','max_companies']);
f.Client=arr(f.Client||f.client||f.clientRecId||f.clientRecordId).map(x=>(x&&typeof x==='object')?x.id:x).filter(Boolean);
if(!f.Client.length){ throw new Error('Waterfall Contacts was called without a Client. Pass the Hub Clients record id as Client. Nothing was pulled.'); }
return [{ json: { id: '', fields: f, _event: true } }];
