// Launch Params: the launch row is the contract. Client (resolves the base), View (a Companies view
// by name, required) and the three fields this Rootflow reads on Automations: Output Field (the
// number column it writes, created on first use), Titles (the job titles to count; blank counts
// everyone GetLeads holds at the domain) and Exclude Titles (subtracted at the source). Table is
// implied (Companies); a filled Table that is not Companies is refused. No Tag: this machine
// creates no rows. No cap: the count endpoint costs no credits.
//
// REFUSALS: a badly filled row is an expected outcome, not a crash. Every guard returns a refusal
// item (`refused` carries the reason); Launch OK? routes it to Build Refusal, which closes the row
// Failed with the reason. Nothing is read or asked before the guards pass.
const rec=$('Fetch Launch Record').first().json||{};
const f=rec.fields||{};
const cf=(($('Resolve Base').first().json||{}).fields)||{};
const base=String(cf['Clayroots Base ID']||'').trim();
const arr=(v)=>Array.isArray(v)?v:(v==null||v===''?[]:[v]);
const clientRecId=(arr(f['Client']).map(x=>(x&&typeof x==='object')?x.id:x)[0])||'';
const table=String(f['Table']||'').trim();
const view=String(f['View']||'').trim();
const outputField=String(f['Output Field']||'').trim();
const list=(v)=>Array.from(new Set(String(v==null?'':v).split(/[\n,;]+/).map(x=>x.trim()).filter(Boolean)));
const titles=list(f['Titles']);
const excludeTitles=list(f['Exclude Titles']);
const startedAt=new Date().toISOString();
const where='Launch record '+(rec.id||'?');
const p={ refused:'', base, clientRecId, table:'Companies', view, outputField, titles, excludeTitles, trigger:'form', _launchRecordId:rec.id||'', startedAt };
const refuse=(r)=>[{ json:Object.assign({},p,{ refused:r, table:table||'Companies' }) }];
if(!clientRecId) return refuse(where+' has no Client link. Nothing was asked.');
if(!/^app[A-Za-z0-9]{14}$/.test(base)) return refuse('Client on '+where.toLowerCase()+' has no valid Clayroots Base ID. Nothing was asked.');
if(table&&table.toLowerCase()!=='companies') return refuse(where+' names Table "'+table+'". GetLeads counts per domain, so this machine runs on Companies only. Nothing was asked.');
if(!view) return refuse(where+' has no View. A Companies view is required by name. Nothing was asked.');
if(!outputField) return refuse(where+' has no Output Field. Name the number column the count goes into. Nothing was asked.');
if(!titles.length&&excludeTitles.length) return refuse(where+' has Exclude Titles but no Titles. Excluding from everyone is not a count this machine makes. Nothing was asked.');
return [{ json:p }];
