const notesBody=$json||{};
const notes=Array.isArray(notesBody)?notesBody:(notesBody.data||[]);
const seen=notes.map(n=>String(n.note||'')).join('\n');
const lead=$('Leads With Thread').item.json||{};
const thread=$('Get BDR Thread').item.json||{};
const lead_id=lead.lead_id; const name=lead.name||'';
const msgs=(thread.messages||[]); const replies=msgs.slice(1);
const out=[];
for(const r of replies){
  const ts=String(r.ts||''); if(!ts) continue;
  const marker='\u27e6bdr:'+ts+'\u27e7';
  if(seen.includes(marker)) continue;
  const txt=String(r.text||'').replace(/<@([A-Z0-9]+)>/g,'@$1').trim();
  if(!txt) continue;
  const d=new Date((parseFloat(ts)||0)*1000).toISOString().slice(0,10);
  const note='BDR call update — '+d+' — '+name+'\n\n'+txt+'\n\n'+marker;
  out.push({ json: { lead_id, note } });
}
return out;