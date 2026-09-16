// Launch Params: the launch row is the contract (Rootflow rule): Client (resolves the base), Table
// (must be People), View (by name, required), Tag (log only). Nothing else is read. A badly filled
// row throws here, before any table is read or any verification is paid. One run per client at a
// time: if Check Running found another Enrich Emails row still Running for this client, this launch
// refuses (two runs on the same rows pay every verification twice; paid for 2026-09-16).
const rec=$('Fetch Launch Record').first().json||{};
const f=rec.fields||{};
const cf=(($('Resolve Base').first().json||{}).fields)||{};
const base=String(cf['Clayroots Base ID']||'').trim();
const arr=(v)=>Array.isArray(v)?v:(v==null||v===''?[]:[v]);
const idOf=(x)=>(x&&typeof x==='object')?x.id:x;
const clientRecId=(arr(f['Client']).map(idOf)[0])||'';
const table=String(f['Table']||'').trim();
const view=String(f['View']||'').trim();
const where='Launch record '+(rec.id||'?');
if(!clientRecId) throw new Error(where+' has no Client link. Nothing was verified.');
if(!/^app[A-Za-z0-9]{14}$/.test(base)) throw new Error('Client on '+where.toLowerCase()+' has no valid Clayroots Base ID. Nothing was verified.');
// Table is implied (People); ruled 2026-09-09: the launch row is Client, View, Tag.
if(table&&table.toLowerCase()!=='people') throw new Error(where+' names Table "'+table+'". Enrich Emails runs on People (company inboxes are Verify Emails). Nothing was verified.');
if(!view) throw new Error(where+' has no View. A People view is required by name. Nothing was verified.');
let running=[]; try{ running=$('Check Running').all().map(i=>i.json||{}).filter(j=>j&&j.id); }catch(e){}
const other=running.find(x=>{ const g=x.fields||{}; return arr(g['Client']).map(idOf).indexOf(clientRecId)>-1&&String(g['Execution ID']||'')!==String($execution.id); });
if(other) throw new Error(where+': Enrich Emails is already Running for this client (execution '+String((other.fields||{})['Execution ID']||'?')+'). A second run on the same rows pays every verification twice. Wait for it, or close its Automations row if that run is dead. Nothing was verified.');
return [{ json:{ base, clientRecId, table:'People', view, tag:String(f['Tag']||'').trim(), trigger:'form', _launchRecordId:rec.id||'', startedAt:new Date().toISOString() } }];
