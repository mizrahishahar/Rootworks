// Launch Params: the launch row is the contract: Client (resolves the base), Table (People), View
// (optional: the machine filters Status = verifying itself, so no view means the whole table).
const rec=$('Fetch Launch Record').first().json||{};
const f=rec.fields||{};
const cf=(($('Resolve Base').first().json||{}).fields)||{};
const base=String(cf['Clayroots Base ID']||'').trim();
const arr=(v)=>Array.isArray(v)?v:(v==null||v===''?[]:[v]);
const clientRecId=(arr(f['Client']).map(x=>(x&&typeof x==='object')?x.id:x)[0])||'';
const table=String(f['Table']||'People').trim();
const where='Launch record '+(rec.id||'?');
if(!clientRecId) throw new Error(where+' has no Client link. Nothing was verified.');
if(!/^app[A-Za-z0-9]{14}$/.test(base)) throw new Error('Client on '+where.toLowerCase()+' has no valid Clayroots Base ID. Nothing was verified.');
if(table.toLowerCase()!=='people') throw new Error(where+' names Table "'+table+'". Verify Catch-alls runs on People. Nothing was verified.');
return [{ json:{ base, clientRecId, table:'People', view:String(f['View']||'').trim(), trigger:'form', _launchRecordId:rec.id||'', parentExecId:'', startedAt:new Date().toISOString() } }];
