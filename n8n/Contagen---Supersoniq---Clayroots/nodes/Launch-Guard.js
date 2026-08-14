const form = $('Waterfall Upload').first().json;
const build = ((form['Build name'] || '') + '').trim();
const tid = ((form['Existing Table ID'] || '') + '').trim();
if (!build && !tid) { throw new Error('Provide a Build name (to create a new table) or an Existing Table ID (to append to one). Nothing was written.'); }
if (tid && !/^tbl[A-Za-z0-9]{14}$/.test(tid)) { throw new Error('Existing Table ID "' + tid + '" is not a valid Airtable table id (expected tbl followed by 14 characters). Nothing was written.'); }
const sd = $getWorkflowStaticData('global');
sd.wfSkips = { cg: 0, sq: 0 };
const bin = $input.first().binary || {};
return [{ json: { buildName: build, existingTableId: tid, mode: tid ? 'append' : 'create', buildNameIgnored: !!(tid && build) }, binary: bin }];