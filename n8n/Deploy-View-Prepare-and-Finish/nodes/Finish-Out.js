// Finish Out: the receipt back to the door, and the end of this run's slot in static data.
// The door does nothing with it but end; the row is already written, and it is the record.
const sd = $getWorkflowStaticData('global'); const dk = 'deploy_' + $execution.id;
const D = sd[dk] || {};
delete sd[dk];
let rowId = '';
try { const r = ($input.first() || {}).json || {}; rowId = r.id || ''; } catch (e) {}
return [{ json: {
  ok: true,
  status: D.finalStatus || '',
  rowId: rowId,
  launchId: D.launchId || '',
  campaign: D.campName || D.target || '',
  recordsIn: D.rowsTotal || 0,
  recordsOut: (D.sender === 'PlusVibe' ? (D.deployed || 0) : (D.landed || 0)),
  errors: (D.errors || []).length,
  warnings: (D.warnings || []).length
} }];
