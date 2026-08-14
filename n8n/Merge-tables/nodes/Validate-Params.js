const p = $('Merge Launch').first().json;
const baseId = String(p['Clayroots Base ID'] || '').trim();
const sourceTableId = String(p['Source Table ID'] || '').trim();
const targetTableId = String(p['Target Table ID'] || '').trim();
if (!/^app[A-Za-z0-9]{14}$/.test(baseId)) { throw new Error('Head guard: Clayroots Base ID \'' + baseId + '\' is not a valid Airtable base id (appXXXXXXXXXXXXXX). Nothing was written.'); }
if (!/^tbl[A-Za-z0-9]{14}$/.test(sourceTableId)) { throw new Error('Head guard: Source Table ID \'' + sourceTableId + '\' is not a valid Airtable table id (tblXXXXXXXXXXXXXX). Nothing was written.'); }
if (!/^tbl[A-Za-z0-9]{14}$/.test(targetTableId)) { throw new Error('Head guard: Target Table ID \'' + targetTableId + '\' is not a valid Airtable table id (tblXXXXXXXXXXXXXX). Nothing was written.'); }
if (sourceTableId === targetTableId) { throw new Error('Head guard: Source and target are the same table (' + sourceTableId + '). Nothing was written.'); }
return [{ json: { baseId: baseId, sourceTableId: sourceTableId, targetTableId: targetTableId, launchRecordId: p._launchRecordId || '', launchedVia: p._launchRecordId ? 'record' : 'form', sourceFieldUsed: p._sourceFieldUsed || '', startedAt: p.submittedAt || new Date().toISOString() } }];