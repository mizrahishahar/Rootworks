// SQ Requests: the Supersoniq provider of Enrich Contacts. Supersoniq is the one metered source
// (one credit per delivered contact, 90k a month), so it gets its own rule (ruled 2026-09-09): a
// HARD cap of 10 people per company whatever the band, and seniors only (Director and up in its
// vocabulary: Director, Head, VP, EVP / SVP, President, C-Suite, Owner, Founder, Partner,
// Board / Chair). One POST companies/enrich per 1,000 domains, tier full so the email rides.
// The gate (ruled 2026-09-09): Supersoniq is asked only for companies that still hold fewer than
// RELEVANT_MIN relevant people after the free providers wrote (Read Relevant People, this chunk).
// A base without a relevance rule has none, so every company passes; the gate counts ride in stats.
const RELEVANT_MIN=5;
const inp=$('Chunk Trigger').first().json||{};
const all=(Array.isArray(inp.companies)?inp.companies:[]).filter(c=>c&&c.domain);
const count={};
try{ for(const it of $('Read Relevant People').all()){ const j=it.json||{}; if(!j.id) continue; const f=j.fields||{}; const v=f.Domain; const d=String(Array.isArray(v)?(v[0]||''):(v||'')).toLowerCase().trim(); if(d) count[d]=(count[d]||0)+1; } }catch(e){}
const companies=all.filter(c=>(count[String(c.domain).toLowerCase()]||0)<RELEVANT_MIN);
const gate={ relevantMin:RELEVANT_MIN, companiesIn:all.length, asked:companies.length, skippedRelevant:all.length-companies.length };
const CAP=10;
const SENIORS=['Director','Head','VP','EVP / SVP','President','C-Suite','Owner','Founder','Partner','Board / Chair'];
const domains=companies.map(c=>String(c.domain).toLowerCase());
const out=[];
for(let i=0;i<domains.length;i+=1000){
  const part=domains.slice(i,i+1000);
  out.push({ json:{ body:{ companies:part.map(d=>({ domain:d })), filters:{ seniority:SENIORS }, per_company_limit:CAP, tier:'full' }, domains:part, cap:CAP } });
}
if(!out.length) return [{ json:{ _none:true, gate } }];
out[0].json.gate=gate;
return out;
