const rows = $('Rows Contacts').all().map(i=>i.json);
if(!rows.length) return [];
const keys = [];
for(const r of rows){ for(const k in r){ if(k!=='_sheet_id' && keys.indexOf(k)===-1) keys.push(k); } }
let primary = keys.indexOf('Name')!==-1?'Name':(keys.indexOf('Domain')!==-1?'Domain':keys[0]);
const ordered = [primary].concat(keys.filter(k=>k!==primary));
const fields = ordered.map(k=>({ name:k, type:'singleLineText' }));
const name = (($('Contacts Upload').first().json['Query name'])||'List') + ' - Contacts - ' + $now.toFormat('yyyy-MM-dd');
return [{ json:{ name, fields } }];