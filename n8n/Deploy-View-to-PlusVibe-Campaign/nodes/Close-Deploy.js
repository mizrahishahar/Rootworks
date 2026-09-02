// Close Deploy: the send lane is over; everything it learned goes back to the shared machine,
// which stamps the source rows, writes the receipt and writes the run's Hub row. The state leaves
// static data here so nothing of this run is left behind in the workflow.
const sd = $getWorkflowStaticData('global'); const dk = 'deploy_' + $execution.id;
const D = sd[dk] || { errors: ['deploy state missing'], warnings: [], rows: {}, skipCounts: {}, launchId: '', sender: 'PlusVibe' };
delete sd[dk];
return [{ json: {
  mode: 'finish',
  sender: 'PlusVibe',
  automation: 'Deploy View to PlusVibe Campaign',
  execId: String($execution.id),
  wfId: String($workflow.id),
  state: D
} }];
