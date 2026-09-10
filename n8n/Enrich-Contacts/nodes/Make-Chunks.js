// Make Chunks: the whole run as one flat list of chunks in provider priority order (Blitz, GetLeads,
// QuickEnrich, Supersoniq), each sized to its vendor (Blitz and QuickEnrich 100 companies, GetLeads
// and Supersoniq 500). One loop in the Rootflow walks this list and calls Enrich Contacts Chunk per
// item (its own execution, so no execution grows with the list). First writer wins because the
// order is the priority. The per-provider accumulators start here, in this execution's static data.
const plan=$('Plan Companies').first().json;
const companies=(plan.companies||[]).filter(c=>c&&c.domain);
const PROVIDERS=[['Blitz',100],['GetLeads',500],['QuickEnrich',100],['Supersoniq',500]];
const sd=$getWorkflowStaticData('global');
sd.run={ execId:String($execution.id), startedAt:new Date().toISOString(), order:PROVIDERS.map(p=>p[0]), lanes:{} };
const blank=()=>({ startedAt:'', chunks:0, count:0, called:0, returned:0, kept:0, credits:0, errors:0, firstError:'', skipped:'', built:0, updated:0, heldUnchanged:0, dupes:0, noKey:0, fenced:0, emailsAppended:0, dnc:0, written:0, updatedWritten:0, writeErrors:0, writeReasons:[], coveredDomains:{}, singleSelectSource:false, companiesIn:companies.length, gate:null, closed:false });
const out=[];
for(const [provider,size] of PROVIDERS){
  const lane=blank(); const count=Math.ceil(companies.length/size); lane.count=count; sd.run.lanes[provider]=lane;
  for(let i=0;i<companies.length;i+=size){ out.push({ json:{ provider, idx:out.filter(o=>o.json.provider===provider).length+1, count, companies:companies.slice(i,i+size) } }); }
}
if(!out.length) return [{ json:{ _empty:true, provider:'', idx:0, count:0, companies:[] } }];
return out;
