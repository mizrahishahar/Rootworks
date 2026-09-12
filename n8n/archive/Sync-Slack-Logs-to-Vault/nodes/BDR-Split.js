const msgs=($json.messages)||[];
const threaded=msgs.filter(m=>(m.reply_count||0)>0).map(m=>({json:{ts:m.ts}}));
return threaded.length?threaded:[{json:{ts:'0'}}];