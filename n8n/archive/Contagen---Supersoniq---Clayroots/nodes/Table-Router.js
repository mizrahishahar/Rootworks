const spec = $('Build Table Schema').first().json;
const baseId = (($('Waterfall Upload').first().json['Clayroots Base ID'])||'').trim();
const resp = $('AT List Tables').first().json || {};
const tables = Array.isArray(resp.tables) ? resp.tables : null;
if (!tables) { throw new Error('Could not read the table list for base ' + baseId + ': ' + JSON.stringify(resp).slice(0,400) + '. Nothing was written.'); }
const plain = spec.fields || [];
const formulas = spec.formulaFields || [];
if (spec.mode !== 'append') {
  const taken = new Set(tables.map(t => String(t.name)));
  let name = spec.desiredName; let n = 1;
  while (taken.has(name)) { n++; name = spec.desiredName + ' (' + n + ')'; }
  return [{ json: { mode: 'create', createName: name, fields: plain, missing: [], missingNames: [], formulaNames: formulas.map(f => f.name), buildNameIgnored: false } }];
}
const target = tables.find(t => t.id === spec.existingTableId);
if (!target) { throw new Error('Table ' + spec.existingTableId + ' does not exist in base ' + baseId + '. Tables there: ' + tables.map(t => t.name).join(', ') + '. Nothing was written.'); }
if (/domains/i.test(String(target.name || ''))) { throw new Error("Refusing to write contacts into '" + target.name + "' - that table is a domains table. Nothing was written."); }
const norm = (s) => String(s == null ? '' : s).trim().toLowerCase();
const targetFields = target.fields || [];
const existing = new Map(targetFields.map(f => [f.name, f]));
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
const pf = targetFields[0] || {};
return [{ json: { mode: 'append', tableId: target.id, tableName: target.name, primaryFieldName: pf.name || '', hasContactKey: existing.has('Contact Key'), fields: contract, missing, missingNames: missing.map(f => f.name), formulaNames: formulas.map(f => f.name), buildNameIgnored: !!spec.buildNameIgnored } }];