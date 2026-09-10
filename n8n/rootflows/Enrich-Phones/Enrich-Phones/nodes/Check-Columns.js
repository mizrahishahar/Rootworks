// Check Columns: the Rootflow's requirements and its own fields.
//
// REQUIREMENTS (must exist, written by others, never touched here): first_name, last_name, Domain,
// Email, LinkedIn URL, Phone. Each provider needs some of them (Supersoniq: domain + name;
// AI-Ark: LinkedIn URL, else domain + name; LeadMagic: Email; Prospeo: Email, else name + domain),
// and Phone is the core cell Enrich Contacts fills, read here as the first candidate. A missing
// requirement is named and refused on the row, before any provider is called.
//
// OWN FIELDS (created here on first use, the Rootflow rule; never renamed or retyped):
//   Final Phone      singleLineText   the number that goes out, E.164
//   Phone Provider   singleSelect     where Final Phone came from: database (the Phone cell),
//                                     Supersoniq, AI-Ark, LeadMagic, Prospeo (typecast mints a new
//                                     provider's name)
//   Phone Type       singleSelect     direct or toll-free; a switchboard is the last resort and the
//                                     lane says so instead of hiding it
//   Phone Found At   dateTime
//   Phone Status     singleSelect     done, no_phone_found, error (error is retryable)
// The email lane's Status is not touched: the phone lane carries its own.
const p=$('Params').first().json;
const t=$('Resolve Table').first().json;
const have=new Set(t.fieldNames||[]);
const REQUIRED=['first_name','last_name','Domain','Email','LinkedIn URL','Phone'];
const missing=REQUIRED.filter(n=>!have.has(n));
const OWN=[
  { name:'Final Phone', type:'singleLineText' },
  { name:'Phone Provider', type:'singleSelect', options:{ choices:[{name:'database',color:'blueLight2'},{name:'Supersoniq',color:'purpleLight2'},{name:'AI-Ark',color:'tealLight2'},{name:'LeadMagic',color:'cyanLight2'},{name:'Prospeo',color:'orangeLight2'}] } },
  { name:'Phone Type', type:'singleSelect', options:{ choices:[{name:'direct',color:'greenLight2'},{name:'toll-free',color:'yellowLight2'}] } },
  { name:'Phone Found At', type:'dateTime', options:{ dateFormat:{name:'iso'}, timeFormat:{name:'24hour'}, timeZone:'utc' } },
  { name:'Phone Status', type:'singleSelect', options:{ choices:[{name:'done',color:'greenLight2'},{name:'no_phone_found',color:'grayLight2'},{name:'error',color:'redLight2'}] } }
];
const toCreate=OWN.filter(f=>!have.has(f.name));
const url='https://api.airtable.com/v0/meta/bases/'+p.base+'/tables/'+t.tableId+'/fields';
const refused=missing.length?('People ('+t.tableId+') in base '+p.base+' is missing '+missing.join(', ')+'. Enrich Phones needs them and creates only its own phone lane.'):'';
return [{ json:{ refused, missing, base:p.base, tableId:t.tableId, toCreate:toCreate.map(f=>f.name), creates:toCreate.map(f=>({ url:url, body:f })), startedAt:p.startedAt } }];
