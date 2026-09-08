// QE Companies: the QuickEnrich provider of Enrich Contacts. QuickEnrich has no seniority or
// department filter, so it is asked for everyone (ruled 2026-09-08: insert everyone, no pressure):
// one free contact-finder call per company for the roster, then one paid email search per person
// up to the cap. One item per company out (the roster request), or {_none:true}.
const inp=$input.first().json||{};
const companies=(Array.isArray(inp.companies)?inp.companies:[]).filter(c=>c&&c.domain);
const out=companies.map(c=>({ json:{ domain:String(c.domain).toLowerCase(), cap:Math.max(1,Math.min(50,Number(c.cap)||20)), body:{ company_url:{ include:[String(c.domain).toLowerCase()], exclude:[] }, per_page:100, page:1 } } }));
if(!out.length) return [{ json:{ _none:true } }];
return out;
