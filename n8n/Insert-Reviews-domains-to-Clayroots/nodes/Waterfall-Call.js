// Waterfall Call: the one event item Waterfall Contacts reads at its Sub Trigger (Event Row):
// the same keys as a launch row. Client = the Hub Clients record, Table Companies, View
// "Not Sourced", all three sources, no department cut, Max companies 5000 as the spend cap
// (Operator ruling 2026-09-02). Reached only after at least one company landed; the sub-workflow
// runs on its own (waitForSubWorkflow false) and writes its own run-log row.
// Reused verbatim from Insert Hiring domains to Clayroots.
const cv=$('Client Vars').first().json;
return [{ json:{ Client:[cv.clientRecId], Table:'Companies', View:'Not Sourced', Sources:['ContaGen','Supersoniq','AI-Ark'], Departments:[], 'Max companies':5000 } }];
