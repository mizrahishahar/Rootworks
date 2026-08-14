// ---------------------------------------------------------------------------
// The contract arrives CORRECT from `Companies Schema`: `Build Date` is declared in
// `formulaFields` as a CREATED_TIME() formula, and `Run ID` is gone. This node does
// not rewrite the contract; it only routes and guards it.
//
// `Build Date` must stay a formula. It is a computed field in all 23 ClayRoots tables:
// writing it returns 422, and declaring it as `type: date` anywhere makes every append
// fail the type-clash guard below. That is the bug that re-dated 731 rows in Piper.
//
// The COMPUTED branch is the guard, not boilerplate. Absent from the target table ->
// pushed to `missing` so it gets created afterwards. Present as a formula -> skipped.
// Present as any other type -> throw, because that table has not been converted yet.
// ---------------------------------------------------------------------------
const spec = $('Companies Schema').first().json;
const baseId = (($('Storeleads Launch').first().json['Clayroots Base ID'])||'').trim();
const resp = $('AT List Tables').first().json || {};
const tables = Array.isArray(resp.tables) ? resp.tables : null;
if (!tables) { throw new Error('Could not read the table list for base ' + baseId + ': ' + JSON.stringify(resp).slice(0,400) + '. Nothing was written.'); }
const norm = (s) => String(s == null ? '' : s).trim().toLowerCase();
const plain = spec.fields || [];
const formulas = spec.formulaFields || [];
if (spec.mode !== 'append') {
  const taken = new Set(tables.map(t => String(t.name)));
  let name = spec.desiredName; let n = 1;
  while (taken.has(name)) { n++; name = spec.desiredName + ' (' + n + ')'; }
  // Airtable refuses a computed field inside a create-table call, so the formula
  // fields ride out as `missing` and are added after the table exists.
  return [{ json: { mode: 'create', createName: name, fields: plain, missing: formulas, missingNames: formulas.map(f => f.name), buildNameIgnored: false } }];
}
const target = tables.find(t => t.id === spec.existingTableId);
if (!target) { throw new Error('Table ' + spec.existingTableId + ' does not exist in base ' + baseId + '. Tables there: ' + tables.map(t => t.name).join(', ') + '. Nothing was written.'); }
if (/contacts/i.test(String(target.name || ''))) { throw new Error("Refusing to write domains into '" + target.name + "' - that table is a contacts table. Nothing was written."); }
const targetFields = target.fields || [];
const existing = new Map(targetFields.map(f => [f.name, f]));
// Airtable field names are case-insensitive on creation, so a case variant of a computed
// field has to be recognised as present and type-checked, never pushed to `missing`.
const existingCI = new Map(targetFields.map(f => [norm(f.name), f]));
const COMPUTED = new Set(formulas.map(f => f.name));
const kind = (ty) => ty === 'number' ? 'number' : (ty === 'singleSelect' ? 'select' : (ty === 'date' ? 'date' : 'text'));
const okWith = { number: ['number'], text: ['singleLineText','multilineText','singleSelect'], select: ['singleSelect','singleLineText'], date: ['date','dateTime'] };
const contract = plain.concat(formulas);
const clashes = []; const missing = [];
for (const cf of contract) {
  if (COMPUTED.has(cf.name)) {
    const exc = existingCI.get(norm(cf.name));
    if (!exc) { missing.push(cf); continue; }
    if (exc.type !== 'formula') { throw new Error("Table '" + target.name + "' (" + target.id + ') still has a writable ' + cf.name + ' (type: ' + exc.type + '). Convert it to a CREATED_TIME() formula field before building. Nothing was written.'); }
    continue;
  }
  const ex = existing.get(cf.name);
  if (!ex) { missing.push(cf); continue; }
  if (!okWith[kind(cf.type)].includes(ex.type)) { clashes.push(cf.name + ' (type in table: ' + ex.type + ', type expected: ' + cf.type + ')'); }
}
if (clashes.length) { throw new Error("Type clash in table '" + target.name + "' (" + target.id + '): ' + clashes.join('; ') + '. Nothing was written.'); }
return [{ json: { mode: 'append', tableId: target.id, tableName: target.name, fields: contract, missing, missingNames: missing.map(f => f.name), buildNameIgnored: !!spec.buildNameIgnored } }];