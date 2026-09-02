// Fire Contacts: one item in Waterfall Contacts' event shape (Event Row reads the launch-row
// keys), so the companies just landed get their people at once. The view "Not Sourced" on
// Companies, all three sources, no department filter and a 5000-company cap, as ruled
// 2026-09-02. Waterfall Contacts writes its own run-log row.
const p=$('Launch Params').first().json;
return [{ json: { Client: [p.clientRecId], Table: 'Companies', View: 'Not Sourced', Sources: ['ContaGen','Supersoniq','AI-Ark'], Departments: [], 'Max companies': 5000, Tag: p.tag||'' } }];
