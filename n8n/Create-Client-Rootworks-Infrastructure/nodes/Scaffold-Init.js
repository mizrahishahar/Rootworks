// Scaffold Init: opens the scaffold state for this run (static data, reset at the trigger). The
// base and the client name come from Launch Params. This machine no longer creates a base and so
// seeds nothing: the base arrives as a duplicate of the CLAYROOTS SCHEMA template, already
// carrying Companies, People and DNC with their views, and the scaffold's whole job here is to
// find that, count it as existed, and add what the template deliberately leaves out. The launch's
// Extras picks (the Hub Automations `Extras` multi-select) name the declared extras groups the
// scaffold creates on top of the register (Operator ruling 2026-09-02); a pick the register does
// not declare is a counted failure, never a crash. Only reached when a base id is in hand, which
// Launch Params has already proven. One item out.
const sd = $getWorkflowStaticData('global');
const reg = $('Scaffold Register').first().json;
const p = $('Launch Params').first().json || {};
const base = String(p.base || '');
const clientName = String(p.clientName || '');
const picks = Array.isArray(p.extras) ? p.extras : [];
const S = { base: base, clientName: clientName, pass: 0, seen: {}, created: [], existed: [], skipped: [], failed: [], pending: [], extras: [], extrasPicked: picks.slice() };
const groups = reg.extras || [];
for (const pick of picks) {
  const g = groups.find(x => x.group === pick || x.choice === pick);
  if (!g) { S.failed.push('Extras: "' + pick + '" is not a declared group (the register declares ' + groups.map(x => x.group).join(', ') + '); nothing created for it'); continue; }
  if (S.extras.indexOf(g.group) < 0) S.extras.push(g.group);
}
sd.scaffold = S;
return [{ json: { base: base, extras: S.extras }, pairedItem: { item: 0 } }];
