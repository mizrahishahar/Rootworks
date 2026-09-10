// Fire Contacts: one item in Enrich Contacts' event shape (its Event Row reads launch-row keys),
// so the companies just landed get their people at once. Client, Table Companies, View Not Sourced,
// Tag, and Domains = exactly the domains this run landed, so on a base with a backlog the contacts
// pull is scoped to this signal's own companies and never re-sweeps the whole view. Enrich Contacts
// writes its own launch row; nothing else is passed (ruled 2026-09-10, the hand-off is these five
// keys for every Insert).
//
// Paid for 2026-09-04 to 09-06: without Domains the call meant "source the whole Not Sourced
// view", which after the 09-03 migration held 20,000 old companies with no Contacts Pulled At.
// Three mornings of 5,000-company sweeps, about 2,500 credits on companies the signal never named.
// The view stays "Not Sourced" so a company signalled again after it was sourced is skipped.
//
// Tiers, Departments, Roles and Max companies are gone (2026-09-10): the provider lanes, the caps
// and the floor are Enrich Contacts' own rules, read off our Employees band, and nothing about who
// gets MESSAGED is configured in this machine. The Signals row's Roles field is the hiring signal's
// job-title intent, not a contact filter.
//
// Reached only after at least one company landed; the sub-workflow runs on its own
// (waitForSubWorkflow false) and writes its own run-log row.
const cv=$('Client Vars').first().json;
const cfg=$('Parse Play').first().json;
const norm=(d)=>String(d||'').trim().toLowerCase().replace(/^https?:\/\//,'').replace(/^www\./,'').replace(/\/.*$/,'');
const domains=[];
try{ for(const it of $('Format Companies').all()){ const d=norm((it.json||{}).Domain); if(d&&domains.indexOf(d)<0) domains.push(d); } }catch(e){}
return [{ json:{ Client:[cv.clientRecId], Table:'Companies', View:'Not Sourced', Tag:cfg.tag||'', Domains:domains } }];
