const cutoff=(Date.now()/1000)-86400;
const out=[];
for(const i of $input.all()){
  const m=i.json.messages||[]; if(!m.length) continue;
  const parent=Object.assign({},m[0]);
  const allReplies=m.slice(1);
  const parentNew=(parseFloat(parent.ts||'0')||0)>=cutoff;
  const recent=allReplies.filter(r=>(parseFloat(r.ts||'0')||0)>=cutoff);
  if(!parentNew && recent.length===0) continue;
  parent.replies=parentNew?allReplies:recent;
  out.push({json:{channel:'BDR',msg:parent}});
}
return out;