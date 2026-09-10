// Launch Params: the launch row is the whole contract of Discover Storeleads Companies (brought to
// the Rootflows standard 2026-09-10): Client (resolves the base), Tag (optional, stamped on every
// company landed), and the Storeleads source variables, which for this Rootflow ARE the source: an
// Insert runs on a source, and Storeleads has no saved query, so the filter set is it. Max companies
// is the spend cap the loop enforces, and Storeleads is metered, so it is required.
//
// The source variables, exactly the Hub columns Build SL Query reads: Country, Platforms, Plan,
// Monthly revenue, Employees, Product count, Store age, Min monthly visits, Category, Technologies,
// Must-have app IDs, Max companies. Table is implied (Companies). Nothing else is read: the contacts
// pull this Rootflow fires afterwards is Enrich Contacts with its own rules, so the old contacts
// parameters (Tiers, Sources, Departments, Roles) are dead and dropped.
//
// REFUSALS. A badly filled launch row is an expected outcome, not a crash, and it must be visible on
// the row the Operator launched: every guard RETURNS a refusal item (`refused` carries the reason),
// Launch OK? routes it to Build Refusal, which closes the row as Failed with the reason and the
// link. Nothing is pulled and nothing is written.
const rec=$('Fetch Launch Record').first().json||{};
const f=rec.fields||{};
const cf=(($('Resolve Base').first().json||{}).fields)||{};
const base=((cf['Clayroots Base ID']||'')+'').trim();
const arr=(v)=>Array.isArray(v)?v:(v==null||v===''?[]:[v]);
const clientRecId=(arr(f['Client']).map(x=>(x&&typeof x==='object')?x.id:x)[0])||'';
const tag=((f['Tag']||'')+'').trim();
const list=(v)=>Array.isArray(v)?v.map(x=>String(x).trim()).filter(Boolean):((v==null||v==='')?[]:String(v).split(',').map(s=>s.trim()).filter(Boolean));
const text=(v)=>(v==null?'':String(v)).trim();
const maxCompanies=parseInt(f['Max companies'],10);
const visits=f['Min monthly visits'];
const src={
  country: list(f['Country']),
  platforms: list(f['Platforms']),
  plan: list(f['Plan']),
  monthlyRevenue: list(f['Monthly revenue']),
  employees: list(f['Employees']),
  productCount: list(f['Product count']),
  storeAge: list(f['Store age']),
  minMonthlyVisits: (visits==null||visits==='')?null:Number(visits),
  category: text(f['Category']),
  technologies: text(f['Technologies']),
  mustHaveAppIds: text(f['Must-have app IDs'])
};
const anyFilter=src.country.length||src.platforms.length||src.plan.length||src.monthlyRevenue.length||src.employees.length||src.productCount.length||src.storeAge.length||(Number.isFinite(src.minMonthlyVisits)&&src.minMonthlyVisits>0)||src.category||src.technologies||src.mustHaveAppIds;
const startedAt=new Date().toISOString();
const where='Launch record '+(rec.id||'?');
const shape=Object.assign({ refused:'', base, clientRecId, tag, maxCompanies: Number.isFinite(maxCompanies)?maxCompanies:null, _launchRecordId: rec.id||'', startedAt }, src);
const refuse=(reason)=>[{ json: Object.assign({}, shape, { refused: reason }) }];
if(!clientRecId){ return refuse(where+' has no Client link. Nothing was pulled.'); }
if(!/^app[A-Za-z0-9]{14}$/.test(base)){ return refuse('Client on '+where.toLowerCase()+' has no valid Clayroots Base ID. Nothing was pulled.'); }
if(!Number.isFinite(maxCompanies)||maxCompanies<1){ return refuse(where+' has no Max companies. Storeleads is metered and it is the spend cap of this run. Nothing was pulled.'); }
if(!anyFilter){ return refuse(where+' carries no Storeleads filter. The filter set is this Rootflow\'s source: tick at least one of Country, Platforms, Plan, Monthly revenue, Employees, Product count, Store age, Min monthly visits, Category, Technologies, Must-have app IDs. Nothing was pulled.'); }
return [{ json: shape }];
