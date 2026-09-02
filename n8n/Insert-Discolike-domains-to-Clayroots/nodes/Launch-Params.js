// Launch Params: the launch row is the whole contract. Client link resolves the base,
// Query ID names the saved DiscoLike query, Tag is stamped on every row landed.
// Any missing piece stops the run here, before a single paid call.
//
// The contacts pull this door fires afterwards is NOT hardcoded (ruled 2026-09-02). Tiers,
// Departments and Max companies are read off this same launch row and handed to Waterfall
// Contacts by Fire Contacts, so what the Operator asked for on the row is what the contacts
// pull does. Blank on the row means today's behaviour: the full waterfall, no department
// filter, a 5,000-company cap. Tiers falls back to the older Sources multi-select while launch
// rows still carry it, exactly as Waterfall Contacts' own Launch Params does.
const rec=$('Fetch Launch Record').first().json;
const f=rec.fields||{};
const cf=($('Resolve Base').first().json.fields)||{};
const base=((cf['Clayroots Base ID']||'')+'').trim();
const clientRecId=((f['Client']||[])[0])||'';
const queryId=((f['Query ID']||'')+'').trim();
const tag=((f['Tag']||'')+'').trim();
if(!clientRecId){ throw new Error('Launch record '+rec.id+' has no Client link. Nothing was pulled.'); }
if(!/^app[A-Za-z0-9]{14}$/.test(base)){ throw new Error('Client on launch record '+rec.id+' has no valid Clayroots Base ID. Nothing was pulled.'); }
if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(queryId)){ throw new Error('Query ID "'+queryId+'" is not a saved DiscoLike query id (uuid). Save the query in DiscoLike first. Nothing was pulled.'); }
const arr=(v)=>Array.isArray(v)?v:(v==null||v===''?[]:[v]);
const FULL='ContaGen -> Supersoniq -> AI-Ark';
const tiers=((f['Tiers']||'')+'').trim();
const srcRaw=arr(f['Sources']).map(s=>String(s).trim()).filter(Boolean);
const departments=arr(f['Departments']).map(s=>String(s).trim()).filter(Boolean);
const roles=arr(f['Roles']).map(s=>String(s).trim()).filter(Boolean);
const maxRaw=Math.floor(Number(f['Max companies'])||0);
return [{ json: {
  base: base,
  clientRecId: clientRecId,
  queryId: queryId,
  tag: tag,
  contactsTiers: tiers||(srcRaw.length?'':FULL),
  contactsSources: srcRaw,
  contactsDepartments: departments,
  contactsRoles: roles,
  contactsMaxCompanies: maxRaw>0?maxRaw:5000,
  _launchRecordId: rec.id,
  startedAt: new Date().toISOString()
} }];
