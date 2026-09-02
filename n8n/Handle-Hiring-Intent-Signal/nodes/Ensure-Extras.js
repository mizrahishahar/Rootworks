// Ensure Extras: the Hiring signal's declared extras (List Building 2.0, "Companies, declared
// extras") must exist on the client's Companies table before the write. Each missing extra
// goes out as one item for the meta-API create downstream; when nothing is missing a single
// placeholder item carries the contract past the create leg. Nothing here creates a table.
// A column that exists under another type, or under a case variant of the name (Airtable
// field names are case-insensitive on creation), is refused loudly, never overwritten.
// A column not on this list is never written by this machine.
const cfg=$('Find Companies Table').first().json;
const r=$('AT List Tables').first().json||{};
const body=(r.body!==undefined)?r.body:r;
const tables=(body&&Array.isArray(body.tables))?body.tables:[];
const t=tables.find(x=>x.id===cfg.tableId)||{};
const existing=t.fields||[];
const byName=new Map(existing.map(x=>[x.name,x]));
const byCI=new Map(existing.map(x=>[String(x.name||'').trim().toLowerCase(),x]));
const txt=(n)=>({ name:n, type:'singleLineText' });
const long=(n)=>({ name:n, type:'multilineText' });
const num=(n,p)=>({ name:n, type:'number', options:{ precision:p } });
const when=(n)=>({ name:n, type:'dateTime', options:{ timeZone:'utc', dateFormat:{ name:'iso', format:'YYYY-MM-DD' }, timeFormat:{ name:'24hour', format:'HH:mm' } } });
const EXTRAS=[
  txt('Job ID'), txt('Job Title'), txt('Job Link'), when('Job Posted'), long('Job Description'),
  txt('Job Seniority'), txt('Job Function'), txt('Job Employment Type'), txt('Job Industries'),
  num('Job Applicants',0), txt('Job Salary'), txt('Job Poster Name'), txt('Job Poster Title'),
  txt('Job Poster LinkedIn'), num('Existing In Role',0)
];
const OK={ singleLineText:['singleLineText','multilineText','richText','url'], multilineText:['multilineText','richText','singleLineText'], number:['number','currency','percent'], dateTime:['dateTime','date'] };
const missing=[]; const clashes=[];
for(const fld of EXTRAS){
  const ex=byName.get(fld.name);
  if(ex){ if(!OK[fld.type].includes(ex.type)) clashes.push(fld.name+' (in table: '+ex.type+', expected: '+fld.type+')'); continue; }
  const ci=byCI.get(fld.name.toLowerCase());
  if(ci){ clashes.push(fld.name+' (table carries "'+ci.name+'", a case variant; it can be neither created nor written)'); continue; }
  missing.push(fld);
}
if(clashes.length){ throw new Error('Companies table '+cfg.tableId+' cannot take the Hiring signal extras: '+clashes.join('; ')+'. Fix the column first. Nothing was spent or written.'); }
const wanted=EXTRAS.map(f=>f.name);
if(!missing.length) return [{ json: { _noop:true, tableId:cfg.tableId, wanted:wanted, missingNames:[] } }];
return missing.map(fld=>({ json: { tableId:cfg.tableId, field:fld, wanted:wanted, missingNames:missing.map(f=>f.name) } }));
