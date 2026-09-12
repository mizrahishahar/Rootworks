// Launch Params: the launch row is the contract. Client (resolves the base), View (a Companies view
// by name, required), Tag (log only), and the five fields this Rootflow owns on Automations: Prompt
// (what DiscoGen is asked), Output Field (the column it writes), Output Type (how that column is
// created), Web Search, Evidence, Overwrite; plus Max companies as the spend cap (DiscoGen runs on
// the account's own LLM key). Table is implied (Companies); a filled Table that is not Companies is
// refused, the Operator meant another machine.
//
// REFUSALS: a badly filled row is an expected outcome, not a crash. Every guard returns a refusal
// item (`refused` carries the reason); Launch OK? routes it to Build Refusal, which closes the row
// Failed with the reason. Nothing is read, submitted or paid for before the guards pass.
const rec=$('Fetch Launch Record').first().json||{};
const f=rec.fields||{};
const cf=(($('Resolve Base').first().json||{}).fields)||{};
const base=String(cf['Clayroots Base ID']||'').trim();
const arr=(v)=>Array.isArray(v)?v:(v==null||v===''?[]:[v]);
const clientRecId=(arr(f['Client']).map(x=>(x&&typeof x==='object')?x.id:x)[0])||'';
const table=String(f['Table']||'').trim();
const view=String(f['View']||'').trim();
const tag=String(f['Tag']||'').trim();
const prompt=String(f['Prompt']||'').trim();
const outputField=String(f['Output Field']||'').trim();
const outputType=String(f['Output Type']||'Long text').trim();
const TYPES=['Long text','Text','Number','Checkbox','Single select'];
const maxRaw=f['Max companies'];
const maxCompanies=(maxRaw===undefined||maxRaw===null||maxRaw==='')?0:Number(maxRaw);
const startedAt=new Date().toISOString();
const where='Launch record '+(rec.id||'?');
const p={ refused:'', base, clientRecId, table:'Companies', view, tag, prompt, outputField, outputType, webSearch:!!f['Web Search'], evidence:!!f['Evidence'], overwrite:!!f['Overwrite'], maxCompanies, trigger:'form', _launchRecordId:rec.id||'', startedAt };
const refuse=(r)=>[{ json:Object.assign({},p,{ refused:r, table:table||'Companies' }) }];
if(!clientRecId) return refuse(where+' has no Client link. Nothing was asked.');
if(!/^app[A-Za-z0-9]{14}$/.test(base)) return refuse('Client on '+where.toLowerCase()+' has no valid Clayroots Base ID. Nothing was asked.');
if(table&&table.toLowerCase()!=='companies') return refuse(where+' names Table "'+table+'". DiscoGen answers per domain, so this machine runs on Companies only. Nothing was asked.');
if(!view) return refuse(where+' has no View. A Companies view is required by name. Nothing was asked.');
if(!prompt) return refuse(where+' has no Prompt. Nothing was asked.');
if(!outputField) return refuse(where+' has no Output Field. Name the column the answer goes into. Nothing was asked.');
if(/\s(Evidence|Confidence)$/.test(outputField)) return refuse(where+' names Output Field "'+outputField+'", which ends in Evidence or Confidence: those suffixes are reserved for the companion columns. Nothing was asked.');
if(TYPES.indexOf(outputType)<0) return refuse(where+' names Output Type "'+outputType+'". Accepted: '+TYPES.join(', ')+'. Nothing was asked.');
if(!(maxCompanies>0)) return refuse(where+' has no Max companies. DiscoGen spends the account\'s LLM key per company; set the cap. Nothing was asked.');
return [{ json:p }];
