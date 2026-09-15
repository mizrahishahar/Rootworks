// Launch Params: the launch row is the contract. Client (resolves the base), View (a People view by
// name, required) and Max Rows: how many people Blitz may be asked in this run, one credit each,
// for the people GetLeads does not answer. Blank or 0 means GetLeads only, which costs no cash.
// Table is implied (People); a filled Table that is not People is refused.
//
// REFUSALS: a badly filled row is an expected outcome, not a crash. Every guard returns a refusal
// item (`refused` carries the reason); Launch OK? routes it to Build Refusal, which closes the row
// Failed with the reason. Nothing is read or asked before the guards pass.
const rec=$('Fetch Launch Record').first().json||{};
const f=rec.fields||{};
const cf=(($('Resolve Base').first().json||{}).fields)||{};
const base=String(cf['Clayroots Base ID']||'').trim();
const arr=(v)=>Array.isArray(v)?v:(v==null||v===''?[]:[v]);
const clientRecId=(arr(f['Client']).map(x=>(x&&typeof x==='object')?x.id:x)[0])||'';
const table=String(f['Table']||'').trim();
const view=String(f['View']||'').trim();
const maxRaw=f['Max Rows'];
const maxBlitz=(maxRaw===undefined||maxRaw===null||maxRaw==='')?0:Math.max(0,Math.floor(Number(maxRaw)||0));
const startedAt=new Date().toISOString();
const where='Launch record '+(rec.id||'?');
const p={ refused:'', base, clientRecId, table:'People', view, maxBlitz, trigger:'form', _launchRecordId:rec.id||'', startedAt };
const refuse=(r)=>[{ json:Object.assign({},p,{ refused:r, table:table||'People' }) }];
if(!clientRecId) return refuse(where+' has no Client link. Nothing was asked.');
if(!/^app[A-Za-z0-9]{14}$/.test(base)) return refuse('Client on '+where.toLowerCase()+' has no valid Clayroots Base ID. Nothing was asked.');
if(table&&table.toLowerCase()!=='people') return refuse(where+' names Table "'+table+'". A profile belongs to a person, so this machine runs on People only. Nothing was asked.');
if(!view) return refuse(where+' has no View. A People view is required by name. Nothing was asked.');
return [{ json:p }];
