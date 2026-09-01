// Ensure Extras: the Storeleads declared extras (List Building 2.0, "Companies, declared
// extras") must exist on the client's Companies table before the write. Each missing extra
// goes out as one item for the meta-API create downstream; when nothing is missing a single
// placeholder item carries the contract past the create leg. Nothing here creates a table.
// A column that exists under another type, or under a case variant of the name (Airtable
// field names are case-insensitive on creation), is refused loudly, never overwritten.
const cfg=$('Find Companies Table').first().json;
const r=$('AT List Tables').first().json||{};
const body=(r.body!==undefined)?r.body:r;
const tables=(body&&Array.isArray(body.tables))?body.tables:[];
const t=tables.find(x=>x.id===cfg.tableId)||{};
const existing=t.fields||[];
const byName=new Map(existing.map(x=>[x.name,x]));
const byCI=new Map(existing.map(x=>[String(x.name||'').trim().toLowerCase(),x]));
const txt=(n)=>({ name:n, type:'singleLineText' });
const num=(n,p)=>({ name:n, type:'number', options:{ precision:p } });
const EXTRAS=[
  txt('Plan'), num('Revenue Est Monthly',0), num('Store Age Years',1), num('Product Count',0), num('App Spend Mo',0),
  txt('Key Apps'), txt('Tech Stack'), num('Trustpilot Rating',1), num('Trustpilot Reviews',0),
  txt('Migrated From'), txt('Social Followers'), txt('Growth 90d'), txt('Features')
];
const OK={ singleLineText:['singleLineText','multilineText','richText'], number:['number','currency','percent'] };
const missing=[]; const clashes=[];
for(const fld of EXTRAS){
  const ex=byName.get(fld.name);
  if(ex){ if(!OK[fld.type].includes(ex.type)) clashes.push(fld.name+' (in table: '+ex.type+', expected: '+fld.type+')'); continue; }
  const ci=byCI.get(fld.name.toLowerCase());
  if(ci){ clashes.push(fld.name+' (table carries "'+ci.name+'", a case variant; it can be neither created nor written)'); continue; }
  missing.push(fld);
}
if(clashes.length){ throw new Error('Companies table '+cfg.tableId+' cannot take the Storeleads extras: '+clashes.join('; ')+'. Fix the column first. Nothing was pulled.'); }
const wanted=EXTRAS.map(f=>f.name);
if(!missing.length) return [{ json: { _noop:true, tableId:cfg.tableId, wanted:wanted, missingNames:[] } }];
return missing.map(fld=>({ json: { tableId:cfg.tableId, field:fld, wanted:wanted, missingNames:missing.map(f=>f.name) } }));
