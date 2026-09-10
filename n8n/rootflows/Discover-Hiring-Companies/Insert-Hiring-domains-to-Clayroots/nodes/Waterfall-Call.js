// Waterfall Call: the one event item Waterfall Contacts reads at its Sub Trigger (Event Row):
// the same keys as a launch row. Client = the Hub Clients record, Table Companies, View
// "Not Sourced", plus Domains: the domains THIS run landed, so the pull is scoped to the signal's
// own companies and never to the whole view. Max companies 150 as the spend cap.
//
// Paid for 2026-09-04 to 09-06: without Domains the call meant "source the whole Not Sourced
// view", which after the 09-03 migration held 20,000 old companies with no Contacts Pulled At.
// Three mornings of 5,000-company AI-Ark sweeps, about 2,500 credits on companies the signal never
// named. The view stays "Not Sourced" so a company signalled again after it was sourced is skipped.
//
// Tiers is "AI-Ark", the intent path (Operator ruling 2026-09-02). This door has no launch row to
// read a mode off, and the intent lane is deliberately AI-Ark only: a flat five people per company
// and the buyer seniorities only, not the full waterfall's wide net. Departments and Roles stay
// empty on purpose: nothing about who gets MESSAGED is configured in this machine, the relevance
// formula and the views on People do all the cutting. The Signals row's Roles field is the hiring
// signal's job-title intent, not a contact filter, and is deliberately not read here.
//
// Reached only after at least one company landed; the sub-workflow runs on its own
// (waitForSubWorkflow false) and writes its own run-log row.
const cv=$('Client Vars').first().json;
const norm=(d)=>String(d||'').trim().toLowerCase().replace(/^https?:\/\//,'').replace(/^www\./,'').replace(/\/.*$/,'');
const domains=[];
try{ for(const it of $('Format Companies').all()){ const d=norm((it.json||{}).Domain); if(d&&domains.indexOf(d)<0) domains.push(d); } }catch(e){}
return [{ json:{ Client:[cv.clientRecId], Table:'Companies', View:'Not Sourced', Domains:domains, Tiers:'AI-Ark', Departments:[], Roles:[], 'Max companies':150 } }];
