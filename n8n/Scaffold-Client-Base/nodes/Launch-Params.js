// Launch Params: the launch row is the whole contract. Its Client link resolves the base from the
// Clients row's Clayroots Base ID and names the client (the mirrors are found as "<Client>
// Signals" / "<Client> Campaigns"). Its Extras multi-select (Storeleads, Hiring, Reviews) names
// the declared extras groups the scaffold creates on Companies on top of the register; blank
// means the core only. Nothing else on the row is read. A missing piece stops the run here,
// before a single meta-API call. Resets the scaffold state at the trigger.
const sd=$getWorkflowStaticData('global');
sd.scaffold=null;
sd.runStartedAt=Date.now();
const rec=$('Fetch Launch Record').first().json;
const f=rec.fields||{};
const cf=(($('Resolve Base').first().json)||{}).fields||{};
const base=((cf['Clayroots Base ID']||'')+'').trim();
const arr=(v)=>Array.isArray(v)?v:(v==null||v===''?[]:[v]);
const clientRecId=(arr(f['Client']).map(x=>(x&&typeof x==='object')?x.id:x)[0])||'';
if(!clientRecId){ throw new Error('Launch record '+rec.id+' has no Client link. Nothing was scaffolded.'); }
if(!/^app[A-Za-z0-9]{14}$/.test(base)){ throw new Error('Client on launch record '+rec.id+' has no valid Clayroots Base ID. Nothing was scaffolded.'); }
const extras=arr(f['Extras']).map(x=>String((x&&typeof x==='object')?(x.name||x.id||''):x).trim()).filter(Boolean);
return [{ json: {
  base: base,
  clientName: ((cf['Client']||'')+'').trim(),
  clientRecId: clientRecId,
  extras: extras,
  _launchRecordId: rec.id||'',
  startedAt: new Date().toISOString()
} }];
