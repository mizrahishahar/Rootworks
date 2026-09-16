// Check Columns: the Rootflow's requirements and its own fields. Requirements (must exist, written
// by others): first_name, last_name, Domain, Email, Status. Refused by name when one is missing.
// Own fields (created here on first use, the Rootflow rule; never renamed or retyped):
//   Final Email          singleLineText   the address that goes out
//   Email Provider       singleSelect     where Final Email came from: database, pattern, LeadMagic
//                                         (typecast mints a new provider's name)
//   Email Verified By    singleSelect     MillionVerifier or BounceBan
//   Email Verified At    dateTime
// Status is a requirement (the register's select: done, verifying, no_email_found, error). A row
// waiting for BounceBan carries nothing but Status verifying: its Email field is what gets verified.
const p=$('Params').first().json;
const t=$('Resolve Table').first().json;
const have=new Set(t.fieldNames||[]);
const REQUIRED=['first_name','last_name','Domain','Email','Status'];
const missing=REQUIRED.filter(n=>!have.has(n));
if(missing.length) throw new Error('People ('+t.tableId+') in base '+p.base+' is missing '+missing.join(', ')+'. Enrich Emails needs them and creates only its own fields. Nothing was verified.');
const OWN=[
  { name:'Final Email', type:'singleLineText' },
  { name:'Email Provider', type:'singleSelect', options:{ choices:[{name:'database',color:'blueLight2'},{name:'pattern',color:'cyanLight2'},{name:'LeadMagic',color:'purpleLight2'}] } },
  { name:'Email Verified By', type:'singleSelect', options:{ choices:[{name:'MillionVerifier',color:'greenLight2'},{name:'BounceBan',color:'yellowLight2'}] } },
  { name:'Email Verified At', type:'dateTime', options:{ dateFormat:{name:'iso'}, timeFormat:{name:'24hour'}, timeZone:'utc' } }
];
const toCreate=OWN.filter(f=>!have.has(f.name));
const url='https://api.airtable.com/v0/meta/bases/'+p.base+'/tables/'+t.tableId+'/fields';
return [{ json:{ base:p.base, tableId:t.tableId, toCreate:toCreate.map(f=>f.name), creates:toCreate.map(f=>({ url:url, body:f })), startedAt:p.startedAt } }];
