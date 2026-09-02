// Plan Base: the client base's schema into the run's plan. Resolves, in one read:
//   the table the launch named (the registry's id first, the name on the schema second),
//   the view (by id or exact name; ids are rename-proof and Campaigns.Live View ID holds ids),
//   the DNC table (by name; absent = no deploy-time DNC filtering, and the run log says so),
//   the campaigns mirror table (Campaign ID + Sequencer, no Final Email, the signature the
//     sequencer syncs use),
//   the client-facing share link from the table description (the receipt's List URL; the API
//     cannot mint share links, so it is pasted there at setup),
//   and the table's field names, which Plan Contract turns into the merge contract.
// Any view the launch row names deploys (Operator ruling 2026-09-02): the old gate that accepted
// only "... : Campaigns" views is gone.
const sd = $getWorkflowStaticData('global'); const dk = 'deploy_' + $execution.id; const D = sd[dk];
// Every return carries the addresses the nodes downstream read off this node's output.
const shape = (extra) => Object.assign({ ok: false, viewUrl: '', crBase: D.crBase || 'appMISSING', tableId: D.tableId || '', dncTableId: D.dncTableId || '', mirrorTableId: D.mirrorTableId || 'tblMISSING', target: D.target || '' }, extra || {});
if (D.abort) { return [{ json: shape() }]; }
let tables = [];
try { const j = ($input.first() || {}).json || {}; tables = Array.isArray(j.tables) ? j.tables : []; } catch (e) {}
if (!tables.length) {
  let j = {}; try { j = ($input.first() || {}).json || {}; } catch (e) {}
  D.abort = 'could not read base schema';
  D.errors.push('could not read base schema for ' + D.crBase + (j.error ? ': ' + JSON.stringify(j.error).slice(0, 150) : ''));
  return [{ json: shape() }];
}
const want = String(D.table || '').trim();
let t = D.regTableId ? tables.find(x => x.id === D.regTableId) : null;
if (!t && D.regTableId) D.warnings.push('registry ' + want + ' table id ' + D.regTableId + ' is not in base ' + D.crBase + '; resolved by name instead');
if (!t) t = want ? tables.find(x => String(x.name || '').trim().toLowerCase() === want.toLowerCase()) : null;
if (!t) {
  D.abort = 'table not found';
  D.errors.push('Base ' + D.crBase + ' has no ' + (want || '(blank)') + ' table. Scaffold the base first. Nothing was spent or written.');
  return [{ json: shape() }];
}
D.tableId = t.id; D.tableName = t.name || t.id;
// The client-facing share link lives in the table description ("Campaigns view:
// https://airtable.com/shr..."), pasted at setup.
const m = String(t.description || '').match(/https:\/\/airtable\.com\/(?:app[A-Za-z0-9]{14}\/)?shr[A-Za-z0-9]+/);
D.shareViewLink = m ? m[0] : '';
if (!D.shareViewLink) D.warnings.push('table "' + D.tableName + '" description carries no share link; receipt written without a client link');
const v = (t.views || []).find(x => x.id === D.view || String(x.name || '').trim() === D.view);
if (!v) {
  D.abort = 'view not found';
  D.errors.push('view "' + D.view + '" is not on table "' + D.tableName + '" in base ' + D.crBase + '; nothing was sent');
  return [{ json: shape() }];
}
D.viewId = v.id; D.viewType = v.type || '';
const dncT = tables.find(x => String(x.name).toLowerCase() === 'dnc');
D.dncTableId = dncT ? dncT.id : '';
if (!D.dncTableId) D.warnings.push('no DNC table in base; DNC domains were not filtered at deploy time');
const mirT = tables.find(x => { const ns = new Set((x.fields || []).map(f => f.name)); return !ns.has('Final Email') && ns.has('Campaign ID') && ns.has('Sequencer'); });
D.mirrorTableId = mirT ? mirT.id : '';
if (!D.mirrorTableId) D.warnings.push('no campaigns mirror table in base (Campaign ID + Sequencer, no Final Email); Campaigns links not stamped');
const fields = t.fields || [];
D.fieldsById = {}; const names = new Set();
for (const f of fields) { D.fieldsById[f.id] = f.name; names.add(f.name); }
D.fieldNames = Array.from(names);
D.hasDeployError = names.has('Deploy Error');
// The lead's LinkedIn URL column: `LinkedIn URL` on a register-shaped table; `Social` only on a
// legacy table that has no `LinkedIn URL`. Never both, never guessed.
D.linkedinCol = names.has('LinkedIn URL') ? 'LinkedIn URL' : (names.has('Social') ? 'Social' : '');
// The view's visible field ids are the merge contract; only a grid view has them.
const viewUrl = ((v.type || 'grid') === 'grid') ? ('https://api.airtable.com/v0/meta/bases/' + D.crBase + '/views/' + v.id + '?include=visibleFieldIds') : '';
return [{ json: shape({ ok: true, viewUrl }) }];
