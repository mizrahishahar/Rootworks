// Check Columns: the requirement (Domain, written by the Inserts) and the one column this run owns:
// Output Field as a whole number, created on first use when Companies lacks it. A column that
// exists as anything but a number (text, a formula, a select) belongs to someone else and the run
// is refused on the row; it never retypes, never renames. Also emits the field list the row read
// asks for, so a 10,000-row view does not carry every column.
const p=$('Params').first().json;
const t=$('Resolve Table').first().json;
const have=t.fieldTypes||{};
const refuse=(why)=>[{ json:{ refused:why } }];
if(!('Domain' in have)) return refuse('Companies ('+t.tableId+') in base '+p.base+' has no Domain column. An Insert Rootflow owes it. Nothing was asked.');
const own={ name:p.outputField, type:'number', options:{ precision:0 } };
if((own.name in have)&&have[own.name]!=='number') return refuse('Companies ('+t.tableId+') already holds "'+own.name+'" as '+have[own.name]+' (this run writes a number). A column at another type is not this run\'s to write; pick another Output Field. Nothing was asked.');
const toCreate=(own.name in have)?[]:[own];
const url='https://api.airtable.com/v0/meta/bases/'+p.base+'/tables/'+t.tableId+'/fields';
return [{ json:{ refused:'', base:p.base, tableId:t.tableId, own:[own.name], toCreate:toCreate.map(f=>f.name), creates:toCreate.map(f=>({ url, body:f })), fetchFields:['Domain'] } }];
