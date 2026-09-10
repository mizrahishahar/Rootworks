// Check Columns: the one column check every landing door runs through (Operator ruling
// 2026-09-02). Resolves Companies, People and DNC by name from the base meta just read, then
// walks the key union Read Meta collected against the field register (inlined by the push as
// REGISTER at the @@register line) and the live schema:
//   the register's 21 landing fields must exist on Companies, else refuse naming them;
//   a blacklisted key (the email lane, the sync fields, the machine fields, relevance) is
//     dropped and counted, never created;
//   a register field the rows carry beyond the landing set (a declared extra such as the
//     Storeleads group, a signal field) must exist, else refuse naming the group to scaffold;
//   a key already on Companies (an Operator column) is written as is;
//   a key that exists on People (register or live) is dropped and counted, never created;
//   any other key is an open field: with allowNew it is created as singleLineText on Companies
//     plus a same-named lookup on People through the Companies link (Plan Columns onward),
//     without allowNew it is dropped and counted.
// Nothing is written here; a refusal leaves the base untouched.
// @@register
const m=$('Read Meta').first().json;
const r=$input.first().json||{}; const body=(r.body!==undefined)?r.body:r;
const tables=(body&&Array.isArray(body.tables))?body.tables:null;
if(!tables){ throw new Error('Could not read the table list for base '+m.base+': '+JSON.stringify(body).slice(0,200)+'. Nothing was written.'); }
const ci=(s)=>String(s||'').trim().toLowerCase();
const byName=(n)=>tables.find(t=>ci(t.name)===n);
const companies=byName('companies'); if(!companies){ throw new Error('Base '+m.base+' has no Companies table. Scaffold the base first. Nothing was written.'); }
const people=byName('people'); if(!people){ throw new Error('Base '+m.base+' has no People table. Scaffold the base first. Nothing was written.'); }
const dnc=byName('dnc'); if(!dnc){ throw new Error('Base '+m.base+' has no DNC table. Scaffold the base first. Nothing was written.'); }
const RC=REGISTER.tables.find(t=>t.name==='Companies'); const RP=REGISTER.tables.find(t=>t.name==='People');
const LANDING=['Domain','Company','Description','Industry Groups','Business Model','Employees','Revenue Range','Keywords','Country','State','City','Street','Zip','Phones','Public Emails','Social URLs','public_emails_clean','MX Provider','Redirect Domain','Domain Source','Tag'];
for(const n of LANDING){ if(!RC.fields.some(f=>f.name===n)) throw new Error('Check Columns: the register has no field "'+n+'" on Companies; the landing list and the register drifted apart.'); }
const cType=new Map((companies.fields||[]).map(f=>[f.name,f.type]));
const cLower=new Map((companies.fields||[]).map(f=>[ci(f.name),f.name]));
const pNames=new Set((people.fields||[]).map(f=>f.name));
const missingLanding=LANDING.filter(n=>!cType.has(n));
if(missingLanding.length){ throw new Error('Table Companies is missing '+missingLanding.join(', ')+'. Scaffold the base first. Nothing was written.'); }
const links=(people.fields||[]).filter(f=>f.type==='multipleRecordLinks'&&f.options&&f.options.linkedTableId===companies.id);
const link=links.find(f=>f.name==='Companies')||links[0];
if(!link){ throw new Error('Table People has no link to Companies. Scaffold the base first. Nothing was written.'); }
const groupOf=new Map();
for(const g of (REGISTER.extras||[])){ if(g.table!=='Companies') continue; for(const f of g.fields){ if(!groupOf.has(f.name)) groupOf.set(f.name,g.group); } }
const regCompanies=new Set(RC.fields.map(f=>f.name).concat(Array.from(groupOf.keys())));
const regPeople=new Set(RP.fields.map(f=>f.name));
// The blacklist, as ruled: the email lane, the sync fields, the machine fields, relevance.
// (Contacts is the register's name for the count; Contacts Count is kept for the ruling's wording.)
const LANE=['Email','MV P0','P1 (Trykitt)','MV P1','P2 (LeadMagic)','MV P2','P3 (Prospeo)','MV P3','BB','Final Email','Email Source','Status'];
const SYNC=['Campaigns','Messages Sent','Last Contacted','Campaign Status','Bounce Reason','Synced At','Deploy Error'];
const MACHINE=['manually_approved','relevance','Build Date','Contacts Pulled At','Contacts','Contacts Count','Contact Sources'];
const BLACKLIST=new Set(LANE.concat(SYNC,MACHINE));
const writable=['Domain']; const dropped=[]; const toCreate=[]; const missingRegister=[];
for(const k of m.keys){
  if(k==='Domain') continue;
  if(BLACKLIST.has(k)){ dropped.push({ key:k, why:'on the blacklist' }); continue; }
  if(regCompanies.has(k)){ if(cType.has(k)) writable.push(k); else missingRegister.push(k); continue; }
  if(cType.has(k)){ writable.push(k); continue; }
  const cv=cLower.get(ci(k)); if(cv){ dropped.push({ key:k, why:'case variant of "'+cv+'" on Companies' }); continue; }
  if(regPeople.has(k)||pNames.has(k)){ dropped.push({ key:k, why:'exists on People' }); continue; }
  if(m.allowNew){ toCreate.push(k); writable.push(k); continue; }
  dropped.push({ key:k, why:'not on the register and allowNew is off' });
}
if(missingRegister.length){
  const groups=Array.from(new Set(missingRegister.map(n=>groupOf.get(n)).filter(Boolean)));
  throw new Error('Table Companies is missing '+missingRegister.join(', ')+(groups.length?' (the '+groups.join(', ')+' extras)':'')+'. Scaffold the base first'+(groups.length?' with Extras = '+groups.join(', '):'')+'. Nothing was written.');
}
return [{ json: {
  base: m.base, clientRecId: m.clientRecId, tag: m.tag, domainSource: m.domainSource, allowNew: m.allowNew,
  tableId: companies.id, tableName: companies.name,
  peopleTableId: people.id, peopleTableName: people.name, peopleLinkId: link.id,
  dncTableId: dnc.id, dncTableName: dnc.name,
  writable: writable, dropped: dropped, toCreate: toCreate
} }];
