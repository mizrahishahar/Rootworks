const item = $input.first();
const form = item.json || {};
const build = ((form['Build name'] || '') + '').trim();
const tid = ((form['Existing Table ID'] || '') + '').trim();
const dtid = ((form['Domains Table ID'] || '') + '').trim();
if (!build && !tid) { throw new Error('Provide a Build name (to create a new table) or an Existing Table ID (to append to one). Nothing was pulled.'); }
if (tid && !/^tbl[A-Za-z0-9]{14}$/.test(tid)) { throw new Error('Existing Table ID "' + tid + '" is not a valid Airtable table id (expected tbl followed by 14 characters). Nothing was pulled.'); }
if (!dtid) { throw new Error('Provide a Domains Table ID - company data is sourced from it, never guessed or pulled live. Nothing was pulled.'); }
if (!/^tbl[A-Za-z0-9]{14}$/.test(dtid)) { throw new Error('Domains Table ID "' + dtid + '" is not a valid Airtable table id (expected tbl followed by 14 characters). Nothing was pulled.'); }
return [{ json: Object.assign({}, form, { buildName: build, existingTableId: tid, domainsTableId: dtid, mode: tid ? 'append' : 'create', buildNameIgnored: !!(tid && build) }), binary: item.binary }];