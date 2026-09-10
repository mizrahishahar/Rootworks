// Launch Params: the launch row is the whole contract of Enrich Phones (the Rootflow rule):
// Client (resolves the base), View (a People view by name, required), Tag (log only). Table is
// implied People, read defensively and refused only when it names something else. Nothing else is
// read: the tier order, the caps and the toll-free rule are code, not launch parameters.
//
// REFUSALS. A badly filled launch row is an expected outcome, not a crash, and it must be visible on
// the row the Operator launched: every guard RETURNS a refusal item (`refused` carries the reason),
// Launch OK? routes it to Build Refusal, which closes the row as Failed with the reason. No provider
// is called, so a bad row never costs a phone credit.
const rec=$('Fetch Launch Record').first().json||{};
const f=rec.fields||{};
const cf=(($('Resolve Base').first().json||{}).fields)||{};
const base=((cf['Clayroots Base ID']||'')+'').trim();
const arr=(v)=>Array.isArray(v)?v:(v==null||v===''?[]:[v]);
const clientRecId=(arr(f['Client']).map(x=>(x&&typeof x==='object')?x.id:x)[0])||'';
const table=((f['Table']||'')+'').trim();
const view=((f['View']||'')+'').trim();
const tag=((f['Tag']||'')+'').trim();
const startedAt=new Date().toISOString();
const where='Launch record '+(rec.id||'?');
const ctx={ base, clientRecId, table:'People', view, tag, trigger:'form', _launchRecordId:rec.id||'', startedAt };
const refuse=(reason)=>[{ json:Object.assign({ refused:reason }, ctx) }];
if(!clientRecId){ return refuse(where+' has no Client link. No provider was called.'); }
if(!/^app[A-Za-z0-9]{14}$/.test(base)){ return refuse('Client on '+where.toLowerCase()+' has no valid Clayroots Base ID. No provider was called.'); }
if(table&&table.toLowerCase()!=='people'){ return refuse(where+' names Table "'+table+'". Enrich Phones runs on People, which is implied; leave Table empty. No provider was called.'); }
if(!view){ return refuse(where+' has no View. A People view is required by name, and it is the spend cap: only the people in it are looked up. No provider was called.'); }
return [{ json:Object.assign({ refused:'' }, ctx) }];
