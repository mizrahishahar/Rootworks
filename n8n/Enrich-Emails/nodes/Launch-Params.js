// Launch Params: the launch row is the contract (Rootflow rule): Client (resolves the base), Table
// (must be People), View (by name, required), Tag (log only). Nothing else is read. A badly filled
// row throws here, before any table is read or any verification is paid.
const rec=$('Fetch Launch Record').first().json||{};
const f=rec.fields||{};
const cf=(($('Resolve Base').first().json||{}).fields)||{};
const base=String(cf['Clayroots Base ID']||'').trim();
const arr=(v)=>Array.isArray(v)?v:(v==null||v===''?[]:[v]);
const clientRecId=(arr(f['Client']).map(x=>(x&&typeof x==='object')?x.id:x)[0])||'';
const table=String(f['Table']||'').trim();
const view=String(f['View']||'').trim();
const where='Launch record '+(rec.id||'?');
if(!clientRecId) throw new Error(where+' has no Client link. Nothing was verified.');
if(!/^app[A-Za-z0-9]{14}$/.test(base)) throw new Error('Client on '+where.toLowerCase()+' has no valid Clayroots Base ID. Nothing was verified.');
if(!table) throw new Error(where+' has no Table. Enrich Emails takes Table "People" by name. Nothing was verified.');
if(table.toLowerCase()!=='people') throw new Error(where+' names Table "'+table+'". Enrich Emails runs on People (company inboxes are Verify Emails). Nothing was verified.');
if(!view) throw new Error(where+' has no View. A People view is required by name. Nothing was verified.');
return [{ json:{ base, clientRecId, table:'People', view, tag:String(f['Tag']||'').trim(), trigger:'form', _launchRecordId:rec.id||'', startedAt:new Date().toISOString() } }];
