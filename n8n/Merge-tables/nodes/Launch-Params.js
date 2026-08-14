const rec = $('Fetch Launch Record').first().json;
const f = rec.fields || {};
const cf = ($('Resolve Base').first().json.fields) || {};
const baseId = ((cf['Clayroots Base ID'] || '') + '').trim();
const target = ((f['Table ID'] || '') + '').trim();
const hasSourceField = Object.prototype.hasOwnProperty.call(f, 'Source Table ID');
const sourceFieldUsed = hasSourceField ? 'Source Table ID' : 'Target';
const source = hasSourceField ? ((f['Source Table ID'] || '') + '').trim() : ((f['Target'] || '') + '').trim();
if (!target) { throw new Error('Launch guard: launch record ' + rec.id + ' has no Table ID value to use as the TARGET table. Nothing was written.'); }
if (!source) { throw new Error('Launch guard: launch record ' + rec.id + ' has no SOURCE table id (read from the ' + sourceFieldUsed + ' field). Nothing was written.'); }
return [{ json: { 'Clayroots Base ID': baseId, 'Source Table ID': source, 'Target Table ID': target, _launchRecordId: rec.id, _sourceFieldUsed: sourceFieldUsed, submittedAt: new Date().toISOString() } }];