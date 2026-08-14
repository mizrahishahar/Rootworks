const out=[];
const commentsItems=$input.all();
let attached=[];
try{attached=$('Attach Card').all();}catch(e){}
for(let idx=0; idx<commentsItems.length; idx++){
  try{
    const resp=(commentsItems[idx]&&commentsItems[idx].json)||{};
    const comments=(resp.comments)||[];
    const seen=comments.map(c=>String(c.text||'')).join('\n');
    const a=(attached[idx]&&attached[idx].json)||{};
    const record_id=a.record_id; if(!record_id) continue;
    const replies=a.replies||[]; const name=a.prospect_name||'';
    for(const r of replies){
      const ts=String(r.ts||''); if(!ts) continue;
      const marker='⟦bdr:'+ts+'⟧'; if(seen.includes(marker)) continue;
      const txt=String(r.text||'').replace(/<@([A-Z0-9]+)>/g,'@$1').trim(); if(!txt) continue;
      const d=new Date((parseFloat(ts)||0)*1000).toISOString().slice(0,10);
      out.push({json:{record_id, text:'BDR call update — '+d+' — '+name+'\n\n'+txt+'\n\n'+marker}});
    }
  }catch(e){}
}
return out;