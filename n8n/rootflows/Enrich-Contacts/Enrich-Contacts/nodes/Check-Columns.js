// Check Columns: the profile columns Enrich Contacts brings to People, created on first use.
// Find Tables proved the core (Name, Contact Key, Domain, LinkedIn URL, Companies, Contact Source);
// this node owns the eleven profile columns the providers fill: Headline, About, Role Description,
// Role Start Date, Person City, Person Country, Education, Skills, Languages, Prior Employer, Prior
// Title. A column the table lacks is created through the meta API before a provider is called; a
// column already there at a compatible type is used as is; a column at a foreign type (a number, a
// select, a link) belongs to someone else and the launch is refused on the row. Nothing is retyped
// or renamed. Emits Find Tables' contract with peopleFields extended by the eleven, which is true
// by construction once Verify Columns has passed: Chunk Input reads it from here.
const cfg=$('Find Tables').first().json;
const p=$('Launch Params').first().json;
const have=cfg.peopleFieldTypes||{};
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
if(clash.length) return [{ json:{ refused:'People ('+cfg.peopleTableId+') in base '+p.base+' already holds '+clash.map(f=>'"'+f.name+'" as '+have[f.name]+' (Enrich Contacts writes it as '+f.type+')').join(', ')+'. A column at another type is not this machine\'s to write; rename or retype it by hand. Nothing was pulled.' } }];
const toCreate=PROFILE.filter(f=>!(f.name in have));
const url='https://api.airtable.com/v0/meta/bases/'+p.base+'/tables/'+cfg.peopleTableId+'/fields';
const names=PROFILE.map(f=>f.name);
const fields=(cfg.peopleFields||[]).slice(); for(const n of names){ if(fields.indexOf(n)<0) fields.push(n); }
return [{ json: Object.assign({}, cfg, { refused:'', profileFields:names, peopleFields:fields, toCreate:toCreate.map(f=>f.name), creates:toCreate.map(f=>({ url, body:{ name:f.name, type:f.type, options:f.options } })) }) }];
