// SQ Requests: the Supersoniq provider of Enrich Contacts. One POST companies/enrich per
// (floor, cap) group, up to 1,000 domains a call, per_company_limit at the cap, tier full so the
// email rides. The floor in Supersoniq's own vocabulary, exactly as the old batch sent it
// (Unclassified included: "we don't know" is not "not a decision-maker"); Senior added at small
// companies. No department, no country. One credit per delivered contact, inside 90k a month.
const inp=$input.first().json||{};
const companies=(Array.isArray(inp.companies)?inp.companies:[]).filter(c=>c&&c.domain);
const STANDARD=['Manager','Senior Manager','Director','Head','VP','EVP / SVP','President','C-Suite','Owner','Founder','Partner','Board / Chair','Unclassified'];
const LEVELS={ wide:STANDARD.concat(['Senior']), nonjunior:STANDARD.concat(['Senior']), manager:STANDARD };
const groups={};
for(const c of companies){ const floor=LEVELS[c.floor]?c.floor:'wide'; const cap=Math.max(1,Math.min(50,Number(c.cap)||20)); const k=floor+':'+String(cap).padStart(2,'0'); (groups[k]=groups[k]||{ floor, cap, list:[] }).list.push(String(c.domain).toLowerCase()); }
const out=[];
for(const k of Object.keys(groups).sort()){
  const g=groups[k];
  for(let i=0;i<g.list.length;i+=1000){
    const part=g.list.slice(i,i+1000);
    out.push({ json:{ body:{ companies:part.map(d=>({ domain:d })), filters:{ seniority:LEVELS[g.floor] }, per_company_limit:g.cap, tier:'full' }, domains:part, cap:g.cap } });
  }
}
if(!out.length) return [{ json:{ _none:true } }];
return out;
