// Event Params: the record door of Enrich Phones, for a caller that holds no launch row. Two bodies:
//   {baseId, clientRecordId, view}       a People view of a client base (same shape as Enrich Emails)
//   {contactIds:[...], clientRecordId?}  one or more Hub Contacts rows
// The door answers 200 on receipt and the run carries on alone, so a caller never waits on a phone
// lookup. A bad body is a refusal on the run's own Hub row, never a crash.
const HUB='appQG6dK0FIOhTxOl', HUB_CONTACTS='tblzexq9qzO9IRiYV';
const b=($input.first().json||{}).body||{};
const s=(v)=>String(v==null?'':v).trim();
const clientRecId=s(b.clientRecordId||b.clientRecId);
const ctx={ mode:'view', base:'', tableId:'', clientRecId, table:'People', view:s(b.view), tag:s(b.tag), contactIds:[], contactFormula:'', trigger:'event', _launchRecordId:'', startedAt:new Date().toISOString() };
const refuse=(reason)=>[{ json:Object.assign({}, ctx, { refused:reason }) }];
const ids=Array.from(new Set((Array.isArray(b.contactIds)?b.contactIds:[]).map(s).filter(x=>/^rec[A-Za-z0-9]{14}$/.test(x))));
if(ids.length){
  const formula='OR('+ids.map(id=>"RECORD_ID()='"+id+"'").join(',')+')';
  return [{ json:Object.assign({}, ctx, { refused:'', mode:'contacts', base:HUB, tableId:HUB_CONTACTS, table:'Contacts', view:'', contactIds:ids, contactFormula:formula }) }];
}
const base=s(b.baseId||b.base);
const table=s(b.table||'People');
ctx.base=base;
if(!/^app[A-Za-z0-9]{14}$/.test(base)) return refuse('Enrich Phones record door: no valid baseId and no contactIds in the body. FullEnrich was not called.');
if(table.toLowerCase()!=='people') return refuse('Enrich Phones record door: Table "'+table+'" is not People. FullEnrich was not called.');
if(!ctx.view) return refuse('Enrich Phones record door: no view in the body. A People view is the spend cap. FullEnrich was not called.');
return [{ json:Object.assign({}, ctx, { refused:'' }) }];
