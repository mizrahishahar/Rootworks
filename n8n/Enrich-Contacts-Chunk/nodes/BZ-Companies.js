// BZ Companies: the Blitz provider of Enrich Contacts. Blitz keys everything on the company's
// LinkedIn page, so the pass is two calls per company: domain-to-linkedin, then employee-finder.
// One item per company out (the first call's input), or {_none:true}. The floor in Blitz's own
// six job levels (C-Team, VP, Director, Manager, Staff, Other): Staff only at small companies,
// Other always (unknown is not junior). No job_function filter: every function is asked.
const inp=$input.first().json||{};
// A domain Blitz would refuse (no dot, illegal characters) is skipped here rather than answered 422.
const okDomain=(d)=>/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i.test(String(d||''));
const companies=(Array.isArray(inp.companies)?inp.companies:[]).filter(c=>c&&c.domain&&okDomain(c.domain));
const LEVELS={ wide:['C-Team','VP','Director','Manager','Staff','Other'], nonjunior:['C-Team','VP','Director','Manager','Other'], manager:['C-Team','VP','Director','Manager'] };
const out=companies.map(c=>({ json:{ domain:String(c.domain).toLowerCase(), cap:Math.max(1,Math.min(50,Number(c.cap)||20)), jobLevel:LEVELS[c.floor]||LEVELS.wide, body:{ domain:'https://'+String(c.domain).toLowerCase() } } }));
if(!out.length) return [{ json:{ _none:true } }];
return out;
