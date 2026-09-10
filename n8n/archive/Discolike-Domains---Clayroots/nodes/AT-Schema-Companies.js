const g = ($('Launch Guard').first().json._guard) || {};
const rows = $('Companies Handler').all().map(i=>i.json);
if(!rows.length) return [];
// Operator ruling 2026-08-12: company_clean is retired estate-wide, the cleaned value lives in the
// company column itself (here that is Name). 'Source' is split into 'Contact Source' (where the record
// came from) and 'Email Source' (which waterfall tier found the email, owned by the verification lane).
const DROP = new Set(['_sheet_id','query_name','ingested_at','Tag','company_clean','Source']);
const keys = [];
for(const r of rows){ for(const k in r){ if(!DROP.has(k) && keys.indexOf(k)===-1) keys.push(k); } }
let primary = keys.indexOf('Name')!==-1?'Name':(keys.indexOf('Domain')!==-1?'Domain':keys[0]);
const ordered = [primary].concat(keys.filter(k=>k!==primary));
const EMP=[{name:'1-10'},{name:'11-50'},{name:'51-200'},{name:'201-500'},{name:'501-1000'},{name:'1001-5000'},{name:'5001-10000'},{name:'10001+'}];
const fields = ordered.map(k => (k==='Employees') ? ({ name:'Employees', type:'singleSelect', options:{ choices: EMP } }) : ({ name:k, type:'singleLineText' }));
const have = new Set(fields.map(f=>f.name));
if(!have.has('public_emails_clean')){ fields.push({ name:'public_emails_clean', type:'singleLineText' }); have.add('public_emails_clean'); }
if(!have.has('Tag')){ fields.push({ name:'Tag', type:'singleLineText' }); have.add('Tag'); }
if(!have.has('Contact Source')){ fields.push({ name:'Contact Source', type:'singleLineText' }); have.add('Contact Source'); }
const MV=[{name:'ok',color:'greenBright'},{name:'catch_all',color:'yellowBright'},{name:'invalid',color:'redBright'},{name:'disposable',color:'orangeLight2'},{name:'unknown',color:'grayBright'},{name:'error',color:'orangeBright'},{name:'skipped',color:'grayLight2'}];
const BB=[{name:'verifying',color:'blueBright'},{name:'deliverable',color:'greenBright'},{name:'undeliverable',color:'redBright'},{name:'risky',color:'yellowBright'},{name:'unknown',color:'grayBright'},{name:'error',color:'orangeBright'},{name:'skipped',color:'grayLight2'}];
const STc=[{name:'done',color:'greenBright'},{name:'verifying',color:'blueBright'},{name:'no_email_found',color:'redBright'},{name:'error',color:'orangeBright'}];
const vfields=[ {name:'MV P0',type:'singleSelect',options:{choices:MV}}, {name:'BB',type:'singleSelect',options:{choices:BB}}, {name:'Final Email',type:'singleLineText'}, {name:'Status',type:'singleSelect',options:{choices:STc}} ];
for(const vf of vfields){ if(!have.has(vf.name)){ fields.push(vf); have.add(vf.name); } }
const formulaFields = [{ name:'Build Date', type:'formula', options:{ formula:'CREATED_TIME()' } }];
const desiredName = (g.buildName || 'List') + ' - Domains';
return [{ json: { mode: g.mode, existingTableId: g.existingTableId, buildNameIgnored: !!g.buildNameIgnored, desiredName, fields, formulaFields } }];