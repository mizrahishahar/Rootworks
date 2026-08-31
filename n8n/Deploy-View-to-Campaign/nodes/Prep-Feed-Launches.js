// The daily feed: every Campaigns row whose Signal link is set drinks from its Signal View.
// One launch row per feed, entering the door exactly like a manual launch, dedupe Strict plus
// the Campaigns-stamp gate. Refused with a named error, deploying nothing: an empty Signal
// View, an unresolvable Signal link, a missing Campaign ID or Client, and any view feeding
// two campaigns at once.
const camps=$('Get Fed Campaigns').all().map(i=>i.json).filter(r=>r&&(r.id||r.fields));
const sigs={};
try{ for(const it of $('Get Signals Rows').all()){ const j=it.json||{}; const f=j.fields||j; if(j.id) sigs[j.id]={ table:String(f['Target Table']||'').trim(), name:String(f['Name']||'') }; } }catch(e){}
const out=[]; const seenView={};
for(const c of camps){
  const f=c.fields||c;
  if(!f['Campaign ID']&&!f['Signal']) continue;
  const link=Array.isArray(f['Signal'])?f['Signal'][0]:null;
  const sigId=link&&typeof link==='object'?String(link.id||''):String(link||'');
  const sig=sigs[sigId];
  const view=String(f['Signal View']||'').trim();
  const target=String(f['Campaign ID']||'').trim();
  const clientLink=Array.isArray(f['Client'])?f['Client'][0]:null;
  const clientId=clientLink&&typeof clientLink==='object'?String(clientLink.id||''):String(clientLink||'');
  const name=String(f['Campaign']||target||'?');
  const err=(why)=>out.push({json:{ok:false, campaign:name, why}});
  if(!sig||!sig.table){ err('Signal link does not resolve to a Signals row with a Target Table'); continue; }
  if(!view){ err('Signal View is empty; fill it or remove the Signal link'); continue; }
  if(!target){ err('Campaign ID is empty'); continue; }
  if(!clientId){ err('no Client link on the campaign row'); continue; }
  const vk=sig.table+'|'+view;
  if(seenView[vk]){
    err('view "'+view+'" already feeds "'+seenView[vk]+'"; one view feeds one campaign');
    for(const o of out){ if(o.json.ok&&o.json.view===view&&o.json.tableId===sig.table){ o.json.ok=false; o.json.why='view "'+view+'" feeds two campaigns; one view feeds one campaign'; } }
    continue;
  }
  seenView[vk]=name;
  out.push({json:{ok:true, clientId, tableId:sig.table, view, target, campaign:name, signal:sig.name}});
}
if(!out.length) return [{json:{_none:true, ok:false}}];
return out;
