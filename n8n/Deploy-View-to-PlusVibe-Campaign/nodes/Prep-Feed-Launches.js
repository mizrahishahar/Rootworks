// The daily feed. The feed is a property of the CAMPAIGN (Operator ruling 2026-09-02): a
// Campaigns row that carries a Live View ID drinks from that view, on the table its Table select
// names (People or Companies, blank = People), in its Client's ClayRoots base. Signals describe a
// signal and nothing else now; the retired Signal link -> Signals.View hop is gone, because one
// signal linked to two campaigns pushed the identical view into both of them.
// Get Fed Campaigns owns two of the gates: a non-empty Live View ID, and Status = ACTIVE, so a
// paused, stopped, completed or draft campaign is never fed.
// One launch row per fed campaign, entering the door exactly like a manual launch, dedupe None
// (the view owns dedupe) plus the Campaigns-stamp gate, capped at MAX_ROWS enrolments.
// Refused with a named error, deploying nothing: a missing Campaign ID, a missing Client link,
// and any view feeding two campaigns of the same client on the same table, because two campaigns
// drinking one view enrol the same person twice.
const MAX_ROWS=1000; // rows enrolled per campaign per run; PlusVibe takes leads 200 to a request.
const camps=$('Get Fed Campaigns').all().map(i=>i.json).filter(r=>r&&(r.id||r.fields));
const out=[]; const seenView={};
for(const c of camps){
  const f=c.fields||c;
  const view=String(f['Live View ID']||'').trim();
  if(!view) continue; // the search filter already excludes these; this also drops the empty placeholder item.
  const table=String((f['Table']&&f['Table'].name)||f['Table']||'').trim()||'People';
  const target=String(f['Campaign ID']||'').trim();
  const clientLink=Array.isArray(f['Client'])?f['Client'][0]:null;
  const clientId=clientLink&&typeof clientLink==='object'?String(clientLink.id||''):String(clientLink||'');
  const name=String(f['Campaign']||target||'?');
  const err=(why)=>out.push({json:{ok:false, campaign:name, why}});
  if(!target){ err('Campaign ID is empty'); continue; }
  if(!clientId){ err('no Client link on the campaign row'); continue; }
  // Table is a name, unique only inside one client's base: the key carries the client.
  const vk=clientId+'|'+table.toLowerCase()+'|'+view;
  if(seenView[vk]){
    err('view "'+view+'" already feeds "'+seenView[vk]+'"; one view feeds one campaign');
    for(const o of out){ if(o.json.ok&&o.json.clientId===clientId&&o.json.view===view&&String(o.json.table).toLowerCase()===table.toLowerCase()){ o.json.ok=false; o.json.why='view "'+view+'" feeds two campaigns; one view feeds one campaign'; } }
    continue;
  }
  seenView[vk]=name;
  out.push({json:{ok:true, clientId, table, view, target, campaign:name, maxRows:MAX_ROWS}});
}
if(!out.length) return [{json:{_none:true, ok:false}}];
return out;
