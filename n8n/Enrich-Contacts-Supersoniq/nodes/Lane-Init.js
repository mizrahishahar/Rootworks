// Lane Init: the Supersoniq lane of Enrich Contacts. One run per launch over the WHOLE company
// list; the lane worries about itself: it walks the list in chunks of 500 companies (the
// size this vendor's API and pacing want), asks the vendor per chunk, and hands each chunk's people
// to the writer helper. The Rootflow only orchestrates. The input item is the Rootflow's contract:
// { base, peopleTableId, companiesTableId, peopleFields, contactSourceMulti, dncDomains,
//   companies:[{recordId, domain, company, band, cap, floor}], parentExecId, clientRecId }.
const inp=$input.first().json||{};
const who='Enrich Contacts Supersoniq lane';
if(!/^app[A-Za-z0-9]{14}$/.test(String(inp.base||''))) throw new Error(who+' was called without a valid base.');
if(!inp.peopleTableId) throw new Error(who+' was called without peopleTableId.');
const companies=(Array.isArray(inp.companies)?inp.companies:[]).filter(c=>c&&c.domain);
const sd=$getWorkflowStaticData('global');
sd.lane={ execId:String($execution.id), startedAt:new Date().toISOString(), chunks:0, called:0, returned:0, kept:0, credits:0, errors:0, firstError:'', skipped:'', built:0, updated:0, heldUnchanged:0, dupes:0, noKey:0, fenced:0, emailsAppended:0, dnc:0, written:0, updatedWritten:0, writeErrors:0, writeReasons:[], coveredDomains:{}, singleSelectSource:false, companiesIn:companies.length };
const CHUNK=500;
const out=[];
for(let i=0;i<companies.length;i+=CHUNK){ out.push({ json:{ idx:out.length+1, count:Math.ceil(companies.length/CHUNK), companies:companies.slice(i,i+CHUNK) } }); }
if(!out.length) return [{ json:{ _empty:true, idx:0, count:0, companies:[] } }];
return out;
