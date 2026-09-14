// Event Params: the record door. Any caller may POST {baseId, clientRecordId, view, outputField,
// titles, excludeTitles} (titles as a list or a comma string); the same contract as the launch row,
// the same refusals, no launch row and no Running stamp (the close creates the run row on
// Execution ID). The door answers 200 on receipt and the run carries on alone.
const b=($input.first().json||{}).body||{};
const s=(v)=>String(v==null?'':v).trim();
const list=(v)=>Array.from(new Set((Array.isArray(v)?v:String(v==null?'':v).split(/[\n,;]+/)).map(x=>String(x).trim()).filter(Boolean)));
const base=s(b.baseId||b.base);
const table=s(b.table)||'Companies';
const view=s(b.view);
const outputField=s(b.outputField||b.output_field);
const titles=list(b.titles);
const excludeTitles=list(b.excludeTitles||b.exclude_titles);
const startedAt=new Date().toISOString();
const p={ refused:'', base, clientRecId:s(b.clientRecordId||b.clientRecId), table:'Companies', view, outputField, titles, excludeTitles, trigger:'event', _launchRecordId:'', startedAt };
const refuse=(r)=>[{ json:Object.assign({},p,{ refused:r, table }) }];
if(!/^app[A-Za-z0-9]{14}$/.test(base)) return refuse('Record door: no valid baseId in the body. Nothing was asked.');
if(table.toLowerCase()!=='companies') return refuse('Record door: Table "'+table+'" is not Companies. Nothing was asked.');
if(!view) return refuse('Record door: no view in the body. Nothing was asked.');
if(!outputField) return refuse('Record door: no outputField in the body. Nothing was asked.');
if(!titles.length&&excludeTitles.length) return refuse('Record door: excludeTitles without titles. Nothing was asked.');
return [{ json:p }];
