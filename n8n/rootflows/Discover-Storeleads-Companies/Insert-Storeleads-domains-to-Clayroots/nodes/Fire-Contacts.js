// Fire Contacts: one item in Waterfall Contacts' event shape (Event Row reads the launch-row
// keys), so the companies just landed get their people at once. Table Companies and View
// "Not Sourced" are structural, this door always sources what it just landed. Everything else
// comes off THIS door's own launch row (Launch Params read it): Tiers, Departments, Roles and
// Max companies pass straight through, the row's Max companies serving as the contacts cap too.
// Blank on the row means the full waterfall, no department filter, no role filter, which is what
// this door always did before 2026-09-02. Waterfall Contacts writes its own run-log row.
const p=$('Launch Params').first().json;
const out={ Client: [p.clientRecId], Table: 'Companies', View: 'Not Sourced', 'Max companies': p.contactsMaxCompanies, Departments: p.contactsDepartments||[], Roles: p.contactsRoles||[], Tag: p.tag||'' };
if(p.contactsTiers) out.Tiers=p.contactsTiers;
if((p.contactsSources||[]).length) out.Sources=p.contactsSources;
return [{ json: out }];
