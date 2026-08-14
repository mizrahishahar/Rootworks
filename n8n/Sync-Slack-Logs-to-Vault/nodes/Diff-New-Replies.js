const seenBy={};
for(const i of $input.all()){ const j=(i&&i.json)||{}; const rid=j.record_id||''; if(!rid) continue; seenBy[rid]=(seenBy[rid]||'')+'\n'+(j.seen||''); }
const names={};
try{ $('Get User Details').all().forEach(i=>{const u=(i&&i.json)||{}; if(u.id) names[u.id]=u.real_name||(u.profile&&u.profile.display_name)||u.name||u.id;}); }catch(e){}
const resolve=(t)=>String(t||'').replace(/<@([A-Z0-9]+)>/g,(_,id)=>'@'+(names[id]||id));
let cards=[];
try{ cards=$('Attach Card').all().map(i=>(i&&i.json)||{}); }catch(e){}
const out=[]; const posted=new Set();
for(const a of cards){
  const rid=a.record_id||''; if(!rid) continue;
  if(!Object.prototype.hasOwnProperty.call(seenBy,rid)) continue;
  const seen=seenBy[rid]||'';
  const nm=a.prospect_name||'';
  for(const r of (a.replies||[])){
    const ts=String((r&&r.ts)||''); if(!ts) continue;
    const marker='⟦bdr:'+ts+'⟧';
    if(seen.indexOf(marker)!==-1) continue;
    const key=rid+marker; if(posted.has(key)) continue;
    const txt=resolve((r&&r.text)||'').trim(); if(!txt) continue;
    posted.add(key);
    const d=new Date((parseFloat(ts)||0)*1000).toISOString().slice(0,10);
    out.push({json:{record_id:rid, text:'BDR call update — '+d+' — '+nm+'\n\n'+txt+'\n\n'+marker}});
  }
}
return out;