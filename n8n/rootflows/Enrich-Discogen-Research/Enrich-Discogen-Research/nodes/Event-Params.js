// Event Params: the record door. Any caller may POST {baseId, clientRecordId, view, prompt,
// outputField, outputType, webSearch, evidence, overwrite, maxCompanies, tag}; the same contract as
// the launch row, the same refusals, no launch row and no Running stamp (the close creates the run
// row on Execution ID). The door answers 200 on receipt and the run carries on alone.
const b=($input.first().json||{}).body||{};
const s=(v)=>String(v==null?'':v).trim();
const base=s(b.baseId||b.base);
const table=s(b.table)||'Companies';
const view=s(b.view);
const prompt=s(b.prompt);
const outputField=s(b.outputField||b.output_field);
const outputType=s(b.outputType||b.output_type)||'Long text';
const TYPES=['Long text','Text','Number','Checkbox','Single select'];
const maxCompanies=Number(b.maxCompanies||b.max_companies)||0;
const startedAt=new Date().toISOString();
const p={ refused:'', base, clientRecId:s(b.clientRecordId||b.clientRecId), table:'Companies', view, tag:s(b.tag), prompt, outputField, outputType, webSearch:!!(b.webSearch||b.web_search), evidence:!!b.evidence, overwrite:!!b.overwrite, maxCompanies, trigger:'event', _launchRecordId:'', startedAt };
const refuse=(r)=>[{ json:Object.assign({},p,{ refused:r, table }) }];
if(!/^app[A-Za-z0-9]{14}$/.test(base)) return refuse('Record door: no valid baseId in the body. Nothing was asked.');
if(table.toLowerCase()!=='companies') return refuse('Record door: Table "'+table+'" is not Companies. Nothing was asked.');
if(!view) return refuse('Record door: no view in the body. Nothing was asked.');
if(!prompt) return refuse('Record door: no prompt in the body. Nothing was asked.');
if(!outputField) return refuse('Record door: no outputField in the body. Nothing was asked.');
if(/\s(Evidence|Confidence)$/.test(outputField)) return refuse('Record door: outputField "'+outputField+'" ends in a reserved suffix. Nothing was asked.');
if(TYPES.indexOf(outputType)<0) return refuse('Record door: outputType "'+outputType+'" is not one of '+TYPES.join(', ')+'. Nothing was asked.');
if(!(maxCompanies>0)) return refuse('Record door: no maxCompanies in the body; the spend cap is required. Nothing was asked.');
return [{ json:p }];
