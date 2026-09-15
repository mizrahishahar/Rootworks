// Snapshot State: the feed loop ahead pauses between deploy rows, and a Wait node suspends the
// execution; workflow static data does not survive the resume, node output data does. So the run's
// whole state is parked here, in this node's output, and Restore State puts it back after the loop.
// Emits one item; Load Rows brings the deploy rows back from Plan Feed.
const sd = $getWorkflowStaticData('global');
const keep = ['launch', 'results', 'updates', 'feeds', 'failed', 'syncs', 'updated', 'fed', 'abort', 'managed', 'unmanaged', 'scope', 'standard', 'messages'];
const state = {};
for (const k of keep) if (sd[k] !== undefined) state[k] = JSON.parse(JSON.stringify(sd[k]));
return [{ json: { _state: state } }];
