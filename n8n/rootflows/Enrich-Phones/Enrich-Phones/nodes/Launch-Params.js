// Launch Params: the launch row is the whole contract of Enrich Phones. Two ways to fill it:
//   a view      Client (resolves the base), View (a People view by name), Tag (log only). Table is
//               implied People, read defensively and refused only when it names something else.
//   contacts    Contact holds one or more Hub Contacts rows: the run works exactly those people on
//               the Hub and ignores View. Client is optional there (attached to the log when set).
// Nothing else is read: FullEnrich is the one provider and that is code, not a launch parameter.
//
// REFUSALS. A badly filled launch row is an expected outcome, not a crash, and it must be visible on
// the row the Operator launched: every guard RETURNS a refusal item (`refused` carries the reason),
// Launch OK? routes it to Build Refusal, which closes the row as Failed with the reason. FullEnrich
// is not called, so a bad row never costs a credit.
const HUB='appQG6dK0FIOhTxOl', HUB_CONTACTS='tblzexq9qzO9IRiYV';
const rec=$('Fetch Launch Record').first().json||{};
const f=rec.fields||{};
const cf=(($('Resolve Base').first().json||{}).fields)||{};
const arr=(v)=>Array.isArray(v)?v:(v==null||v===''?[]:[v]);
const idOf=(x)=>String((x&&typeof x==='object')?(x.id||''):(x||'')).trim();
const clientRecId=arr(f['Client']).map(idOf).filter(Boolean)[0]||'';
const contactIds=Array.from(new Set(arr(f['Contact']).map(idOf).filter(x=>/^rec[A-Za-z0-9]{14}$/.test(x))));
const table=((f['Table']||'')+'').trim();
const view=((f['View']||'')+'').trim();
const tag=((f['Tag']||'')+'').trim();
const startedAt=new Date().toISOString();
const where='Launch record '+(rec.id||'?');
const ctx={ mode:'view', base:'', tableId:'', clientRecId, table:'People', view, tag, contactIds:[], contactFormula:'', trigger:'form', _launchRecordId:rec.id||'', startedAt };
const refuse=(reason)=>[{ json:Object.assign({}, ctx, { refused:reason }) }];
if(contactIds.length){
  const formula='OR('+contactIds.map(id=>"RECORD_ID()='"+id+"'").join(',')+')';
  return [{ json:Object.assign({}, ctx, { refused:'', mode:'contacts', base:HUB, tableId:HUB_CONTACTS, table:'Contacts', view:'', contactIds, contactFormula:formula }) }];
}
const base=((cf['Clayroots Base ID']||'')+'').trim();
ctx.base=base;
if(!clientRecId){ return refuse(where+' has no Client link and no Contact. Give it a Client and a People View, or one or more Contacts. FullEnrich was not called.'); }
if(!/^app[A-Za-z0-9]{14}$/.test(base)){ return refuse('Client on '+where.toLowerCase()+' has no valid Clayroots Base ID. FullEnrich was not called.'); }
if(table&&table.toLowerCase()!=='people'){ return refuse(where+' names Table "'+table+'". Enrich Phones runs on People, which is implied; leave Table empty. FullEnrich was not called.'); }
if(!view){ return refuse(where+' has no View and no Contact. A People view is required by name, and it is the spend cap: only the people in it are looked up. FullEnrich was not called.'); }
return [{ json:Object.assign({}, ctx, { refused:'' }) }];
