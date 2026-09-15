// Run Context: this sync runs inside the Campaigns Manager, which hands it the run's launch shape.
// sd.launch.trigger      = the manager's trigger, 'schedule' or 'form'
// sd.launch.clientFilter = the manager's client scope (one Clients record id) or '' for every client
const sd=$getWorkflowStaticData('global');
const inp=($input.first()||{}).json||{};
sd.launch={ recordId:String(inp.recordId||''), trigger:String(inp.trigger||'schedule'), clientFilter:String(inp.clientFilter||''), startedAt:$now.toMillis() };
return [{ json: Object.assign({}, sd.launch) }];
