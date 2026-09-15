// Check Columns: what a person row must carry (Name, Domain, and at least one of LinkedIn URL,
// Email, first_name; written by Enrich Contacts) and the eleven profile columns this machine
// fills, the same eleven Enrich Contacts brings: Headline, About, Role Description, Role Start
// Date, Person City, Person Country, Education, Skills, Languages, Prior Employer, Prior Title.
// Created on first use when People lacks them; a column at a compatible type is used as is; a
// column at a foreign type refuses the launch on the row. Nothing is retyped or renamed. Also
// emits the field list the row read asks for, so a 40,000-row view stays light.
const p=$('Params').first().json;
const t=$('Resolve Table').first().json;
const have=t.fieldTypes||{};
const refuse=(why)=>[{ json:{ refused:why } }];
for(const need of ['Name','Domain','Contact Key']){ if(!(need in have)) return refuse('People ('+t.tableId+') in base '+p.base+' has no '+need+' column. Enrich Contacts owes it. Nothing was asked.'); }
const PROFILE=[
  { name:'Headline', type:'singleLineText' },
  { name:'About', type:'multilineText' },
  { name:'Role Description', type:'multilineText' },
  { name:'Role Start Date', type:'date', options:{ dateFormat:{ name:'iso' } } },
  { name:'Person City', type:'singleLineText' },
  { name:'Person Country', type:'singleLineText' },
  { name:'Education', type:'multilineText' },
  { name:'Skills', type:'multilineText' },
  { name:'Languages', type:'multilineText' },
  { name:'Prior Employer', type:'singleLineText' },
  { name:'Prior Title', type:'singleLineText' }
];
const FAMILY={ singleLineText:['singleLineText','multilineText','richText'], multilineText:['multilineText','singleLineText','richText'], date:['date','dateTime'] };
const clash=PROFILE.filter(f=>(f.name in have)&&FAMILY[f.type].indexOf(have[f.name])<0);
if(clash.length) return refuse('People ('+t.tableId+') in base '+p.base+' already holds '+clash.map(f=>'"'+f.name+'" as '+have[f.name]+' (this machine writes it as '+f.type+')').join(', ')+'. A column at another type is not this machine\'s to write; rename or retype it by hand. Nothing was asked.');
const toCreate=PROFILE.filter(f=>!(f.name in have));
const url='https://api.airtable.com/v0/meta/bases/'+p.base+'/tables/'+t.tableId+'/fields';
const optional=['first_name','last_name','Email','Final Email','LinkedIn URL'].filter(n=>n in have);
return [{ json:{ refused:'', base:p.base, tableId:t.tableId, profileFields:PROFILE.map(f=>f.name), toCreate:toCreate.map(f=>f.name), creates:toCreate.map(f=>({ url, body:{ name:f.name, type:f.type, options:f.options } })), fetchFields:['Name','Domain','Contact Key'].concat(optional,['Headline','Person City','Person Country']), heldFields:['Name','Domain','Contact Key'].concat(optional,PROFILE.map(f=>f.name)) } }];
