const g = $('Guard Tables').first().json;
const S = $getWorkflowStaticData('global');
const k = 'mtscan_' + $execution.id;
const st = S[k] || { seen: {}, pages: 0, which: 'source' };
const res = $input.first().json || {};
const recs = res.records || [];
const which = st.which;
const tableName = which === 'source' ? g.sourceName : g.targetName;
const fieldName = which === 'source' ? g.sourceKeyField : g.targetKeyField;
const dups = [];
for (const r of recs) { const raw = (r.fields || {})[fieldName]; const val = (raw === null || raw === undefined) ? '' : String(Array.isArray(raw) ? raw.join(',') : raw).trim().toLowerCase(); if (!val) { continue; } if (st.seen[val]) { if (dups.indexOf(val) === -1 && dups.length < 3) { dups.push(val); } } else { st.seen[val] = 1; } }
if (dups.length) { delete S[k]; throw new Error("Resolved key is Domain but '" + tableName + "' has repeated Domain values (e.g. " + dups.join(', ') + "), so it is contact-shaped. Refusing to merge on Domain — this would collapse multiple people onto one row. Nothing was written."); }
st.pages = (st.pages || 0) + 1;
const MAX_SCAN_PAGES = 100;
let out = {};
if (res.offset && st.pages < MAX_SCAN_PAGES) { out = { scanTable: which === 'source' ? g.sourceTableId : g.targetTableId, scanField: fieldName, scanOffset: res.offset, scanAction: 'continue', scanWhich: which }; }
else if (which === 'source') { st.which = 'target'; st.seen = {}; st.pages = 0; out = { scanTable: g.targetTableId, scanField: g.targetKeyField, scanOffset: '', scanAction: 'continue', scanWhich: 'target' }; }
else { out = { scanTable: '', scanField: '', scanOffset: '', scanAction: 'done', scanWhich: 'target' }; }
S[k] = st;
if (out.scanAction === 'done') { delete S[k]; }
return [{ json: Object.assign({ scanBase: g.baseId, scanTableName: tableName }, out) }];