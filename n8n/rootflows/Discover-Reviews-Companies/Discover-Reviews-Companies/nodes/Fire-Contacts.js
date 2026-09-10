// Fire Contacts: the one item Enrich Contacts reads at its Sub Trigger (its Event Row reads
// launch-row keys), so the companies just landed get their people at once. The hand-off is fixed
// by the standard (ruled 2026-09-10) and carries exactly five keys, nothing else:
//
//   Client   the Hub Clients record
//   Table    'Companies'
//   View     'Not Sourced', so a company signalled again after it was sourced is skipped
//   Tag      '' here: on a signal Insert the signal is the Signals link, never a Tag
//   Domains  exactly the domains THIS run landed, so the pull is scoped to the signal's own
//            companies and never re-sweeps the whole view
//
// Paid for 2026-09-04 to 09-06: without Domains the call meant "source the whole Not Sourced
// view", which after the 09-03 migration held 20,000 old companies with no Contacts Pulled At.
// Three mornings of 5,000-company sweeps on companies the signal never named.
//
// Dropped 2026-09-10 as dead: Tiers, Departments, Roles and Max companies. Enrich Contacts owns
// its own providers, its cap and its floor (by the Employees band on our row), so a caller naming
// a provider lane or a cap was passing parameters the Rootflow no longer reads. Nothing about who
// gets MESSAGED is configured in this machine either: the relevance formula and the views on
// People do all the cutting.
//
// Reached only after at least one company landed; the sub-workflow runs on its own
// (waitForSubWorkflow false) and writes its own run-log row.
const cv=$('Client Vars').first().json;
const norm=(d)=>String(d||'').trim().toLowerCase().replace(/^https?:\/\//,'').replace(/^www\./,'').replace(/\/.*$/,'');
const domains=[];
try{ for(const it of $('Format Companies').all()){ const d=norm((it.json||{}).Domain); if(d&&domains.indexOf(d)<0) domains.push(d); } }catch(e){}
return [{ json:{ Client:[cv.clientRecId], Table:'Companies', View:'Not Sourced', Tag:'', Domains:domains } }];
