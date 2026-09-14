// A fresh scratch space for this client. The nodes that only run on some days or some clients (the
// corrections, the read-back, the stats) write into sd.cw; Decide reads only sd.cw for them. So a node
// that did not run for this client can never hand Decide the previous client's data, which a plain
// node reference inside a loop would. Record Outcome deletes it before the next client.
const sd = $getWorkflowStaticData('global');
const cw = $('Loop Over Clients').first().json;
sd.cw = { client: String(cw.clientName || ''), plan: null, fixes: null, readback: null, stats: null };
return $input.all();
