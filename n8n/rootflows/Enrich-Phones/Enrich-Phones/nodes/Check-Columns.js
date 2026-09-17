// Check Columns: the Rootflow's requirements and its own fields (the view path only; the Hub
// Contacts table is ours and carries its fields already).
//
// REQUIREMENTS (must exist, written by others, never touched here): first_name, last_name, Domain,
// LinkedIn URL, Phone. FullEnrich is asked by LinkedIn URL when the row holds one, else by name +
// domain; Phone is the core cell Enrich Contacts fills, and a row that already holds a number there is
// answered from it for free. A missing requirement is named and refused on the row, before
// FullEnrich is called.
//
// OWN FIELDS (created here on first use, the Rootflow rule; never renamed or retyped):
//   Final Phone      singleLineText   the number that goes out, E.164
//   Phone Provider   singleSelect     where Final Phone came from: database (the Phone cell) or FullEnrich
//   Phone Type       singleSelect     FullEnrich's own word for the line: mobile, landline, voip, unknown
//   Phone Found At   dateTime
//   Phone Status     singleSelect     done, no_phone_found, error (error is retryable)
// A base that ran the old four-provider lane keeps its old choices (direct, toll-free, Supersoniq...);
// typecast mints the new ones beside them. The email lane's Status is not touched.
const p=$('Params').first().json;
const t=$('Resolve Table').first().json;
const have=new Set(t.fieldNames||[]);
const REQUIRED=['first_name','last_name','Domain','LinkedIn URL','Phone'];
const missing=REQUIRED.filter(n=>!have.has(n));
const OWN=[
  { name:'Final Phone', type:'singleLineText' },
  { name:'Phone Provider', type:'singleSelect', options:{ choices:[{name:'database',color:'blueLight2'},{name:'FullEnrich',color:'purpleLight2'}] } },
  { name:'Phone Type', type:'singleSelect', options:{ choices:[{name:'mobile',color:'greenLight2'},{name:'landline',color:'yellowLight2'},{name:'voip',color:'orangeLight2'},{name:'unknown',color:'grayLight2'}] } },
  { name:'Phone Found At', type:'dateTime', options:{ dateFormat:{name:'iso'}, timeFormat:{name:'24hour'}, timeZone:'utc' } },
  { name:'Phone Status', type:'singleSelect', options:{ choices:[{name:'done',color:'greenLight2'},{name:'no_phone_found',color:'grayLight2'},{name:'error',color:'redLight2'}] } }
];
const toCreate=OWN.filter(f=>!have.has(f.name));
const url='https://api.airtable.com/v0/meta/bases/'+p.base+'/tables/'+t.tableId+'/fields';
const refused=missing.length?('People ('+t.tableId+') in base '+p.base+' is missing '+missing.join(', ')+'. Enrich Phones needs them and creates only its own phone lane.'):'';
return [{ json:{ refused, missing, base:p.base, tableId:t.tableId, toCreate:toCreate.map(f=>f.name), creates:toCreate.map(f=>({ url:url, body:f })), startedAt:p.startedAt } }];
