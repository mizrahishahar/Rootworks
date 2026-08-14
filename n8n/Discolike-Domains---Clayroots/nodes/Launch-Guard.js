const items = $input.all();
const f = (items[0] && items[0].json) ? items[0].json : {};
const build = ((f['Build name'] || '') + '').trim();
const tid = ((f['Existing Table ID'] || '') + '').trim();
if (!build && !tid) { throw new Error('Provide a Build name (to create a new table) or an Existing Table ID (to append to one). Nothing was written.'); }
if (tid && !/^tbl[A-Za-z0-9]{14}$/.test(tid)) { throw new Error('Existing Table ID "' + tid + '" is not a valid Airtable table id (expected tbl followed by 14 characters). Nothing was written.'); }
const g = { buildName: build, existingTableId: tid, mode: tid ? 'append' : 'create', buildNameIgnored: !!(tid && build) };
return items.map(i => ({ json: Object.assign({}, i.json, { _guard: g }), binary: i.binary }));