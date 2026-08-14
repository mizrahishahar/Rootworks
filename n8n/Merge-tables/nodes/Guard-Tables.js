const v = $('Validate Params').first().json;
const tables = ($input.first().json.tables) || [];
const listing = tables.map(function (t) { return t.id + ' (' + t.name + ')'; }).join(', ');
const src = tables.filter(function (t) { return t.id === v.sourceTableId; })[0];
const tgt = tables.filter(function (t) { return t.id === v.targetTableId; })[0];
if (!src) { throw new Error('Head guard: source table ' + v.sourceTableId + ' does not exist in base ' + v.baseId + '. Tables there: ' + listing + '. Nothing was written.'); }
if (!tgt) { throw new Error('Head guard: target table ' + v.targetTableId + ' does not exist in base ' + v.baseId + '. Tables there: ' + listing + '. Nothing was written.'); }
const sName = src.name; const tName = tgt.name;
const isContacts = function (n) { return /contacts/i.test(n); };
const isDomains = function (n) { return /domains/i.test(n); };
if ((isContacts(sName) && isDomains(tName)) || (isDomains(sName) && isContacts(tName))) { throw new Error("Refusing to merge '" + sName + "' into '" + tName + "' — one is a contacts table and the other is a domains table. Nothing was written."); }
const sf = src.fields || []; const tf = tgt.fields || [];
const findF = function (fs, name) { return fs.filter(function (f) { return String(f.name).toLowerCase() === String(name).toLowerCase(); })[0]; };
const CANDIDATES = ['Contact Key', 'Email', 'Domain'];
let keyRule = ''; let sourceKeyField = ''; let targetKeyField = '';
for (const cand of CANDIDATES) { const a = findF(sf, cand); const b = findF(tf, cand); if (a && b) { keyRule = cand; sourceKeyField = a.name; targetKeyField = b.name; break; } }
if (!keyRule) { const gaps = []; for (const cand of CANDIDATES) { if (!findF(sf, cand)) { gaps.push("source '" + sName + "' has no '" + cand + "' field"); } if (!findF(tf, cand)) { gaps.push("target '" + tName + "' has no '" + cand + "' field"); } } throw new Error('Cannot merge: no key field is present in both tables. Tried Contact Key, then Email, then Domain. ' + gaps.join('; ') + '. Nothing was written.'); }
const UNCOPYABLE = ['formula', 'rollup', 'count', 'multipleLookupValues', 'createdTime', 'lastModifiedTime', 'autoNumber', 'createdBy', 'lastModifiedBy', 'button'];
const sourceFields = sf.map(function (f) { return { name: f.name, type: f.type, options: f.options || null }; });
const targetFieldNames = tf.map(function (f) { return f.name; });
return [{ json: { baseId: v.baseId, sourceTableId: v.sourceTableId, targetTableId: v.targetTableId, sourceName: sName, targetName: tName, keyRule: keyRule, keyRuleIndex: CANDIDATES.indexOf(keyRule) + 1, sourceKeyField: sourceKeyField, targetKeyField: targetKeyField, needsDomainScan: keyRule === 'Domain', uncopyableTypes: UNCOPYABLE, sourceFields: sourceFields, targetFieldNames: targetFieldNames, launchRecordId: v.launchRecordId, launchedVia: v.launchedVia, sourceFieldUsed: v.sourceFieldUsed, startedAt: v.startedAt } }];