// Check Columns: the requirement (Domain, written by the Inserts) and the fields this run owns:
// Output Field at the Airtable type Output Type declares, and with Evidence on the two companions
// '<Output Field> Evidence' (long text) and '<Output Field> Confidence' (number). Created on first
// use when the table lacks them. A column that exists at another type belongs to someone else and
// the run is refused on the row (it never retypes, never renames). Also emits the field list the
// row read asks for, so a 10,000-row view does not carry every column.
const p=$('Params').first().json;
const t=$('Resolve Table').first().json;
const have=t.fieldTypes||{};
const refuse=(why)=>[{ json:{ refused:why } }];
if(!('Domain' in have)) return refuse('Companies ('+t.tableId+') in base '+p.base+' has no Domain column. An Insert Rootflow owes it. Nothing was asked.');
const AT={ 'Long text':{ type:'multilineText' }, 'Text':{ type:'singleLineText' }, 'Number':{ type:'number', options:{ precision:2 } }, 'Checkbox':{ type:'checkbox', options:{ icon:'check', color:'greenBright' } }, 'Single select':{ type:'singleSelect', options:{ choices:[] } } };
const own=[ Object.assign({ name:p.outputField }, AT[p.outputType]) ];
if(p.evidence){ own.push({ name:p.outputField+' Evidence', type:'multilineText' }); own.push({ name:p.outputField+' Confidence', type:'number', options:{ precision:2 } }); }
const clash=own.filter(f=>(f.name in have)&&have[f.name]!==f.type);
if(clash.length) return refuse('Companies ('+t.tableId+') already holds '+clash.map(f=>'"'+f.name+'" as '+have[f.name]+' (this run wants '+f.type+')').join(', ')+'. A column at another type is not this run\'s to write; pick another Output Field or Output Type. Nothing was asked.');
const toCreate=own.filter(f=>!(f.name in have));
const url='https://api.airtable.com/v0/meta/bases/'+p.base+'/tables/'+t.tableId+'/fields';
return [{ json:{ refused:'', base:p.base, tableId:t.tableId, own:own.map(f=>f.name), toCreate:toCreate.map(f=>f.name), creates:toCreate.map(f=>({ url, body:f })), fetchFields:['Domain'].concat(own.map(f=>f.name)) } }];
