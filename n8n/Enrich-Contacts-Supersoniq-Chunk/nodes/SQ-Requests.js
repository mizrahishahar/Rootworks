// SQ Requests: the Supersoniq provider of Enrich Contacts. Supersoniq is the one metered source
// (one credit per delivered contact, 90k a month), so it gets its own rule (ruled 2026-09-09): a
// HARD cap of 10 people per company whatever the band, and seniors only (Director and up in its
// vocabulary: Director, Head, VP, EVP / SVP, President, C-Suite, Owner, Founder, Partner,
// Board / Chair). One POST companies/enrich per 1,000 domains, tier full so the email rides.
const inp=$input.first().json||{};
const companies=(Array.isArray(inp.companies)?inp.companies:[]).filter(c=>c&&c.domain);
const CAP=10;
const SENIORS=['Director','Head','VP','EVP / SVP','President','C-Suite','Owner','Founder','Partner','Board / Chair'];
const domains=companies.map(c=>String(c.domain).toLowerCase());
const out=[];
for(let i=0;i<domains.length;i+=1000){
  const part=domains.slice(i,i+1000);
  out.push({ json:{ body:{ companies:part.map(d=>({ domain:d })), filters:{ seniority:SENIORS }, per_company_limit:CAP, tier:'full' }, domains:part, cap:CAP } });
}
if(!out.length) return [{ json:{ _none:true } }];
return out;
