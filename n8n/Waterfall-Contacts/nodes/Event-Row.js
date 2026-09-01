// Event Row: the sub entry carries one item with the same keys as a launch row (Client, View,
// Seniority, Departments, Sources, Max companies, Fire Waterfall, Tag). Shape it like Fetch
// Launch Record's output so Resolve Base and Launch Params read one shape on both entries.
const j=$input.first().json||{};
const f=(j.fields&&typeof j.fields==='object')?Object.assign({},j.fields):Object.assign({},j);
const arr=(v)=>Array.isArray(v)?v:(v?[v]:[]);
f.Client=arr(f.Client||f.client||f.clientRecId||f.clientRecordId).map(x=>(x&&typeof x==='object')?x.id:x).filter(Boolean);
if(!f.Client.length){ throw new Error('Waterfall Contacts was called without a Client. Pass the Hub Clients record id as Client. Nothing was pulled.'); }
return [{ json: { id: '', fields: f, _event: true } }];
