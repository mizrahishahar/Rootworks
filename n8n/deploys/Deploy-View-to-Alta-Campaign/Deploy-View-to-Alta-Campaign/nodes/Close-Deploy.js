// Close Deploy: the push lane is over; everything it learned goes back to the shared machine,
// which stamps the source rows, writes the receipt and writes the run's Hub row.
// Three ways in: no prospects to push at all (static data still intact, the wait was never
// crossed), no persons to verify, and the full path through the title gate. After the wait the
// state comes off the item Collect Push carried, never off static data.
const sd = $getWorkflowStaticData('global'); const dk = 'deploy_' + $execution.id;
let D = sd[dk];
if (!D) { try { D = $('Collect Push').first().json._state; } catch (e) {} }
if (!D) {
  try { D = $('Prepare').first().json.state; } catch (e) {}
  if (D) D.errors.push('run state was lost after the readback wait and was rebuilt from what prepare returned; push and landing counts for this run are not trustworthy');
}
if (!D) throw new Error('Deploy View to Alta Campaign lost its run state entirely; nothing can be stamped or logged for this run.');
delete sd[dk];
return [{ json: {
  mode: 'finish',
  sender: 'Alta',
  automation: 'Deploy View to Alta Campaign',
  execId: String($execution.id),
  wfId: String($workflow.id),
  state: D
} }];
