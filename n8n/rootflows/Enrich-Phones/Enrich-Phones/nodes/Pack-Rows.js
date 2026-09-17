// Pack Rows: every row the run works, in one shape whichever table it came from, each carrying the
// run context the batch sub-execution needs (Params and Resolve Table do not exist inside a
// sub-execution). One row = one person to look up.
//   view       a People row of the client base: first_name, last_name, Domain, LinkedIn URL, Phone
//   contacts   a Hub Contacts row: firstName, lastName, domain (lookup), linkedin, phone; a contact
//              without a company domain falls back to its own email domain unless it is a freemail
const p=$('Params').first().json;
let t={}; try{ t=$('Resolve Table').first().json||{}; }catch(e){}
const contacts=p.mode==='contacts';
const s=(v)=>String(Array.isArray(v)?(v[0]==null?'':v[0]):(v==null?'':v)).trim();
const FREEMAIL=new Set(['gmail.com','yahoo.com','outlook.com','hotmail.com','icloud.com','aol.com','proton.me','protonmail.com','live.com','msn.com','gmx.com','mail.com','walla.co.il','walla.com']);
const rows=$input.all().map(i=>i.json).filter(j=>j&&j.id);
const ctx={ _mode:p.mode||'view', _baseId:p.base, _tableId:contacts?p.tableId:t.tableId, _tableName:contacts?'Contacts':(t.tableName||'People'), _view:contacts?(rows.length+' contact'+(rows.length===1?'':'s')+' named on the launch row'):(t.viewName||p.view), _execId:String($execution.id), _startedAt:p.startedAt, _clientId:p.clientRecId||'', _trigger:p.trigger||'form', _total:rows.length, _tag:p.tag||'' };
return rows.map(j=>{
  const f=j.fields||j;
  let person;
  if(contacts){
    const email=s(f.email).toLowerCase();
    let domain=s(f.domain).toLowerCase();
    if(!domain&&email.indexOf('@')>0){ const d=email.split('@')[1]; if(d&&!FREEMAIL.has(d)) domain=d; }
    person={ first:s(f.firstName), last:s(f.lastName), domain, linkedin:s(f.linkedin), held:s(f.phone) };
  } else {
    person={ first:s(f.first_name), last:s(f.last_name), domain:s(f.Domain).toLowerCase(), linkedin:s(f['LinkedIn URL']), held:s(f.Phone) };
  }
  return { json:Object.assign({ id:j.id, person }, ctx) };
});
