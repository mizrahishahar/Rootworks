const r = $('Table Router').first().json;
const baseId = (($('Contacts Launch').first().json['Clayroots Base ID'])||'').trim();
const resp = $('AT Verify Schema').first().json || {};
const tables = Array.isArray(resp.tables) ? resp.tables : null;
if (!tables) { throw new Error('Could not re-read the schema of base ' + baseId + ' after creating fields: ' + JSON.stringify(resp).slice(0,400) + '. Nothing was written.'); }
const target = tables.find(t => t.id === r.tableId);
if (!target) { throw new Error('Table ' + r.tableId + ' is no longer present in base ' + baseId + '. Nothing was written.'); }
const norm = (s) => String(s == null ? '' : s).trim().toLowerCase();
const targetFields = target.fields || [];
const have = new Set(targetFields.map(f => f.name));
const haveCI = new Set(targetFields.map(f => norm(f.name)));
const COMPUTED = new Set(r.formulaNames || []);
const present = (n) => COMPUTED.has(n) ? haveCI.has(norm(n)) : have.has(n);
const still = (r.fields || []).filter(f => !present(f.name)).map(f => f.name);
if (still.length) { throw new Error("Could not create these fields on '" + target.name + "' (" + target.id + '): ' + still.join(', ') + '. Nothing was written.'); }
const wanted = r.missingNames || [];
const created = wanted.filter(n => present(n));
return [{ json: { mode: 'append', tableId: target.id, tableName: target.name, fieldsCreated: created, buildNameIgnored: !!r.buildNameIgnored, createdFieldError: '' } }];