const sd=$getWorkflowStaticData('global');
const W=sd.write||{queue:[], idx:0};
if(W.idx<W.queue.length){ W.current=W.queue[W.idx]; W.idx++; return [{json:Object.assign({done:false}, W.current)}]; }
W.current=null;
return [{json:{done:true}}];