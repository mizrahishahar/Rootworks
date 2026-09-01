// Launch Params: the launch row is the whole contract. Client link resolves the base, the
// Storeleads filter fields on the row shape the pull, Max companies is the spend cap, Tag is
// stamped on every row landed. Any missing piece stops the run here, before a single paid call.
const rec=$('Fetch Launch Record').first().json;
const f=rec.fields||{};
const cf=($('Resolve Base').first().json.fields)||{};
const base=((cf['Clayroots Base ID']||'')+'').trim();
const clientRecId=((f['Client']||[])[0])||'';
const tag=((f['Tag']||'')+'').trim();
const maxCompanies=parseInt(f['Max companies'],10);
if(!clientRecId){ throw new Error('Launch record '+rec.id+' has no Client link. Nothing was pulled.'); }
if(!/^app[A-Za-z0-9]{14}$/.test(base)){ throw new Error('Client on launch record '+rec.id+' has no valid Clayroots Base ID. Nothing was pulled.'); }
if(!Number.isFinite(maxCompanies)||maxCompanies<1){ throw new Error('Launch record '+rec.id+' has no Max companies. It is the Storeleads spend cap and is required. Nothing was pulled.'); }
const list=(v)=>Array.isArray(v)?v.map(x=>String(x).trim()).filter(Boolean):((v==null||v==='')?[]:String(v).split(',').map(s=>s.trim()).filter(Boolean));
const text=(v)=>(v==null?'':String(v)).trim();
const visits=f['Min monthly visits'];
return [{ json: {
  base: base,
  clientRecId: clientRecId,
  tag: tag,
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
  mustHaveAppIds: text(f['Must-have app IDs']),
  maxCompanies: maxCompanies,
  _launchRecordId: rec.id,
  startedAt: new Date().toISOString()
} }];
