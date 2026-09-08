// Close Deploy: the send lane is over; everything it learned goes back to the shared machine,
// which stamps the source rows, writes the receipt and writes the run's Hub row. The state leaves
// static data here so nothing of this run is left behind in the workflow, and the HeyReach key
// leaves the state: finish has no call to make and the key has no business on the finish lane.
const sd = $getWorkflowStaticData('global'); const dk = 'deploy_' + $execution.id;
const D = sd[dk] || { errors: ['deploy state missing'], warnings: [], rows: {}, skipCounts: {}, launchId: '', sender: 'HeyReach' };
delete sd[dk];
D.hrKey = '';
return [{ json: {
  mode: 'finish',
  sender: 'HeyReach',
  automation: 'Deploy View to HeyReach Campaign',
  execId: String($execution.id),
  wfId: String($workflow.id),
  state: D
} }];
