const TID='custom.cf_aq8WjpQY6v2Ny4PIfFN9xthAfNikvBJy8W7G6uz9ndk';
const out=[];
for(const it of $input.all()){
  const body=it.json||{};
  const leads=Array.isArray(body)?body:(body.data||[]);
  for(const l of leads){
    const tid=l[TID]||(l.custom&&l.custom['cf_aq8WjpQY6v2Ny4PIfFN9xthAfNikvBJy8W7G6uz9ndk'])||'';
    if(tid){ out.push({ json: { lead_id:l.id, name:l.display_name||l.name||'', threadId:String(tid) } }); }
  }
}
return out;