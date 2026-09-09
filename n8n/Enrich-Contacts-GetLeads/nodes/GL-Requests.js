// GL Requests: the GetLeads provider of Enrich Contacts. Input: the batch plan, one item
// { companies:[{recordId, domain, company, band, cap, floor}] }. Output: one item per
// POST /api/v1/contacts/search call, or one {_none:true} when there is nothing to ask.
//
// The floor is expressed in GetLeads' own six levels (C-Team, VP, Director, Manager, Staff, Other;
// pulled live 2026-09-08). "Everyone non-junior": Staff (individual contributors) rides along
// only at small companies, Other (unknown) always rides (unknown is not junior). No department
// filter: every function is asked (ruled 2026-09-08, everyone who is not junior).
//
// One call per (floor, cap) group, sized so ONE page always holds the whole answer: domains per call =
// floor(5,000 / cap) (cap 20: 250 domains, cap 30: 166, cap 50: 100). No node pagination: proven
// 2026-09-09 (run 22643) that n8n paging on a JSON body repeats the same page and aborts with
// "identical 5x", discarding every page including the first, so the whole tier came back empty.
// Every row costs one fair-use row, never cash.
const inp=$input.first().json||{};
const companies=(Array.isArray(inp.companies)?inp.companies:[]).filter(c=>c&&c.domain);
const LEVELS={ wide:['C-Team','VP','Director','Manager','Staff','Other'], nonjunior:['C-Team','VP','Director','Manager','Other'], manager:['C-Team','VP','Director','Manager'] };
const COLUMNS=['First Name','Last Name','Contact Full Name','Email','Email Verification Status','Current Job Title','Seniority Level','Department / Function','Contact LinkedIn URL','Cellphone','Direct Office Phone','Company Domain','Work Email Domain','Current Employer Name'];
const groups={};
for(const c of companies){ const floor=LEVELS[c.floor]?c.floor:'wide'; const cap=Math.max(1,Math.min(50,Number(c.cap)||20)); const k=floor+':'+String(cap).padStart(2,'0'); (groups[k]=groups[k]||{ floor, cap, list:[] }).list.push(c.domain); }
const out=[];
for(const k of Object.keys(groups).sort()){
  const g=groups[k];
  const per=Math.max(1,Math.floor(5000/g.cap));
  for(let i=0;i<g.list.length;i+=per){
    const part=g.list.slice(i,i+per);
    out.push({ json:{ body:{ domains:part, seniority:LEVELS[g.floor], max_per_company:g.cap, limit:5000, offset:0, columns:COLUMNS }, domains:part, cap:g.cap, floor:g.floor } });
  }
}
if(!out.length) return [{ json:{ _none:true } }];
return out;
