// Launch Params: the launch row (or the caller's passthrough item, same keys) is the whole
// contract, and since 2026-09-08 it is four fields: Client (resolves the base), Table (by name,
// required, no default, and it must be "Companies": this machine sources people for companies and
// refuses any other table), View (a Companies view, by name, required, no default; the insert
// doors call with "Not Sourced"), Tag (carried for the log only: People stores no Tag, it is a
// lookup through the Companies link). Nothing else is read. Every provider is asked for every
// company; the cap and the seniority floor are rules in code (Plan Batch); a provider with no
// credential on its node is a logged skip. Any missing piece stops the run here, before a call.
//
// REFUSALS (2026-09-03). A launch row that was not properly filled is an EXPECTED outcome, not a
// crash, and it must be visible on the row the Operator launched. So every guard below RETURNS a
// refusal item (`refused` carries the named reason) instead of throwing. `Launch OK?` routes that
// item to Build Refusal, which closes the launch row as Failed with the reason and the execution
// link, and the run ends there: no table read, no call, nothing written.
let rec=null, trigger='form';
try{ rec=$('Fetch Launch Record').first().json; }catch(e){}
if(!rec||!rec.fields){ rec=$('Event Row').first().json; trigger='event'; }
const f=rec.fields||{};
// Resolve Base is allowed to answer with an error item (a launch row with no Client link is asked
// for record "recMISSING"), so read it defensively.
const cf=(($('Resolve Base').first().json||{}).fields)||{};
const base=((cf['Clayroots Base ID']||'')+'').trim();
const arr=(v)=>Array.isArray(v)?v:(v==null||v===''?[]:[v]);
const where='Launch record '+(rec.id||'(event)');
const clientRecId=(arr(f['Client']).map(x=>(x&&typeof x==='object')?x.id:x)[0])||'';
const table=((f['Table']||'')+'').trim();
const view=((f['View']||'')+'').trim();
const tag=((f['Tag']||'')+'').trim();
const domains=arr(f['Domains']).map(x=>String(x||'').trim().toLowerCase().replace(/^https?:\/\//,'').replace(/^www\./,'').replace(/\/.*$/,'')).filter(Boolean);
const startedAt=new Date().toISOString();
const refuse=(reason)=>[{ json:{ refused: reason, trigger: trigger, _launchRecordId: rec.id||'', clientRecId: clientRecId, base: base, table: table, view: view, tag: tag, startedAt: startedAt } }];
if(!clientRecId){ return refuse(where+' has no Client link. Nothing was pulled.'); }
if(!/^app[A-Za-z0-9]{14}$/.test(base)){ return refuse('Client on '+where.toLowerCase()+' has no valid Clayroots Base ID. Nothing was pulled.'); }
// Table is implied by the Rootflow (ruled 2026-09-09: the launch row is Client, View, Tag). A Table that
// is filled and is not Companies is still refused: the Operator meant another machine.
if(table&&table.toLowerCase()!=='companies'){ return refuse(where+' names Table "'+table+'". This machine sources people for companies and takes only Table "Companies". Nothing was pulled.'); }
if(!view){ return refuse(where+' has no View. A Companies view is required by name, no default (the insert doors pass "Not Sourced"). Nothing was pulled.'); }
return [{ json: { refused: '', base: base, clientRecId: clientRecId, table: 'Companies', view: view, tag: tag, domains: domains, trigger: trigger, _launchRecordId: rec.id||'', startedAt: startedAt } }];
