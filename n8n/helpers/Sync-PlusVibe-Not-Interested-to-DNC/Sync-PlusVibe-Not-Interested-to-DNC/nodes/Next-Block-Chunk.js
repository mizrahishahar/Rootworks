// Next Block Chunk: hands the next 200 domains to the blocklist call as the request body
// (POST /api/v1/blocklist/add/entries, {workspace_id, entries}), or done when the queue is drained.
// The sender dedupes on its side and reports entries_added / already_in_blocklist, which is how
// "add if not there" is honored without a read of the whole blocklist first.
const sd=$getWorkflowStaticData('global');
const c=sd.clients[sd.currentClient];
const B=sd.block||{ queue:[], idx:0, currentCount:0 };
if(B.idx<B.queue.length){
  const entries=B.queue[B.idx];
  B.idx++;
  B.currentCount=entries.length;
  return [{ json:{ done:false, body:{ workspace_id:c.ws, entries }, count:entries.length } }];
}
B.currentCount=0;
return [{ json:{ done:true, clientRecId:sd.currentClient, crBase:c.crBase, dncTableId:c.dncTableId } }];
