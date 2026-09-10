// Launch Params: the launch row is the whole contract of Discover Discolike Companies (ruled
// 2026-09-09): Client (resolves the base), Query ID (the saved DiscoLike query: an Insert runs on
// a source, and the query is the source), Tag (optional, stamped on every company landed). Table is
// implied (Companies). Nothing else is read: the contacts pull it fires afterwards is Enrich
// Contacts with its own rules; no Tiers, Sources, Departments, Roles or Max companies.
//
// REFUSALS. A badly filled launch row is an expected outcome, not a crash, and it must be visible on
// the row the Operator launched: every guard RETURNS a refusal item (`refused` carries the reason),
// Launch OK? routes it to Build Refusal, which closes the row as Failed with the reason and the
// link. Nothing is pulled and nothing is written.
const rec=$('Fetch Launch Record').first().json||{};
const f=rec.fields||{};
const cf=(($('Resolve Base').first().json||{}).fields)||{};
const base=((cf['Clayroots Base ID']||'')+'').trim();
const arr=(v)=>Array.isArray(v)?v:(v==null||v===''?[]:[v]);
const clientRecId=(arr(f['Client']).map(x=>(x&&typeof x==='object')?x.id:x)[0])||'';
const queryId=((f['Query ID']||'')+'').trim();
const tag=((f['Tag']||'')+'').trim();
const startedAt=new Date().toISOString();
const where='Launch record '+(rec.id||'?');
const refuse=(reason)=>[{ json:{ refused: reason, base, clientRecId, queryId, tag, _launchRecordId: rec.id||'', startedAt } }];
if(!clientRecId){ return refuse(where+' has no Client link. Nothing was pulled.'); }
if(!/^app[A-Za-z0-9]{14}$/.test(base)){ return refuse('Client on '+where.toLowerCase()+' has no valid Clayroots Base ID. Nothing was pulled.'); }
if(!queryId){ return refuse(where+' has no Query ID. This Rootflow runs on a saved DiscoLike query; paste its id. Nothing was pulled.'); }
if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(queryId)){ return refuse('Query ID "'+queryId+'" is not a saved DiscoLike query id (uuid). Save the query in DiscoLike first. Nothing was pulled.'); }
return [{ json:{ refused:'', base, clientRecId, queryId, tag, _launchRecordId: rec.id||'', startedAt } }];
