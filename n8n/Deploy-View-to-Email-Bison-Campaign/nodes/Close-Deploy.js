// Close Deploy: the send lane is over; everything it learned goes back to the shared machine,
// which stamps the source rows, writes the receipt and writes the run's Hub row. The state leaves
// static data here so nothing of this run is left behind in the workflow.
const sd = $getWorkflowStaticData('global'); const dk = 'deploy_' + $execution.id;
const D = sd[dk] || { errors: ['deploy state missing'], warnings: [], rows: {}, skipCounts: {}, launchId: '', sender: 'Email Bison' };
delete sd[dk];
D.bisonIds = null; D.pendingIds = null;
return [{ json: {
  mode: 'finish',
  sender: 'Email Bison',
  automation: 'Deploy View to Email Bison Campaign',
  execId: String($execution.id),
  wfId: String($workflow.id),
  state: D
} }];
