// Check Columns: requirements (Status, Email, first_name, last_name, Domain) must exist; the
// fields shared with Enrich Emails (Final Email, Email Provider, Email Verified By, Email Verified
// At, Email Candidates) are created here on first use when the base lacks them, the same
// definitions as Enrich Emails declares.
const p=$('Params').first().json;
const t=$('Resolve Table').first().json;
const have=new Set(t.fieldNames||[]);
const REQUIRED=['Status','Email','first_name','last_name','Domain'];
const missing=REQUIRED.filter(n=>!have.has(n));
if(missing.length) throw new Error('People ('+t.tableId+') in base '+p.base+' is missing '+missing.join(', ')+'. Nothing was verified.');
const OWN=[
  { name:'Final Email', type:'singleLineText' },
  { name:'Email Provider', type:'singleSelect', options:{ choices:[{name:'database',color:'blueLight2'},{name:'pattern',color:'cyanLight2'},{name:'Blitz',color:'tealLight2'},{name:'LeadMagic',color:'purpleLight2'}] } },
  { name:'Email Verified By', type:'singleSelect', options:{ choices:[{name:'MillionVerifier',color:'greenLight2'},{name:'BounceBan',color:'yellowLight2'}] } },
  { name:'Email Verified At', type:'dateTime', options:{ dateFormat:{name:'iso'}, timeFormat:{name:'24hour'}, timeZone:'utc' } },
  { name:'Email Candidates', type:'singleLineText' }
];
const toCreate=OWN.filter(f=>!have.has(f.name));
const url='https://api.airtable.com/v0/meta/bases/'+p.base+'/tables/'+t.tableId+'/fields';
return [{ json:{ base:p.base, tableId:t.tableId, toCreate:toCreate.map(f=>f.name), creates:toCreate.map(f=>({ url:url, body:f })) } }];
