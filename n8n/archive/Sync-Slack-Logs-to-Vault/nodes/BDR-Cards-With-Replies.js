const isBotMsg=(m)=>!!(m&&(m.bot_id||m.app_id||m.subtype));
const items=$input.all().map(i=>i.json).filter(x=>x&&x.msg);
const out=[];
for(const x of items){
  const p=x.msg;
  const botUsers=new Set();
  if(isBotMsg(p)&&p.user) botUsers.add(p.user);
  const human=((p.replies)||[]).filter(r=>r&&!r.bot_id&&!r.app_id&&!r.subtype&&r.user&&!botUsers.has(r.user)&&String(r.text||'').trim());
  if(!human.length) continue;
  out.push({json:{ts:String(p.ts||''), replies:human}});
}
return out.length?out:[{json:{ts:'', replies:[]}}];