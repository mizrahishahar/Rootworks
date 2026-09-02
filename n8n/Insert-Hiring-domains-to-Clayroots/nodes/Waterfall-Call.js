// Waterfall Call: the one event item Waterfall Contacts reads at its Sub Trigger (Event Row):
// the same keys as a launch row. Client = the Hub Clients record, Table Companies, View
// "Not Sourced", Max companies 5000 as the spend cap.
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
return [{ json:{ Client:[cv.clientRecId], Table:'Companies', View:'Not Sourced', Tiers:'AI-Ark', Departments:[], Roles:[], 'Max companies':5000 } }];
