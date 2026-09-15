// Event Params: the record door. Any caller may POST {baseId, clientRecordId, view, maxRows}; the
// same contract as the launch row, the same refusals, no launch row and no Running stamp (the
// close creates the run row on Execution ID). The door answers 200 on receipt and the run carries
// on alone.
const b=($input.first().json||{}).body||{};
const s=(v)=>String(v==null?'':v).trim();
const base=s(b.baseId||b.base);
const table=s(b.table)||'People';
const view=s(b.view);
const maxBlitz=Math.max(0,Math.floor(Number(b.maxRows||b.max_rows||b.maxBlitz)||0));
const startedAt=new Date().toISOString();
const p={ refused:'', base, clientRecId:s(b.clientRecordId||b.clientRecId), table:'People', view, maxBlitz, trigger:'event', _launchRecordId:'', startedAt };
const refuse=(r)=>[{ json:Object.assign({},p,{ refused:r, table }) }];
if(!/^app[A-Za-z0-9]{14}$/.test(base)) return refuse('Record door: no valid baseId in the body. Nothing was asked.');
if(table.toLowerCase()!=='people') return refuse('Record door: Table "'+table+'" is not People. Nothing was asked.');
if(!view) return refuse('Record door: no view in the body. Nothing was asked.');
return [{ json:p }];
