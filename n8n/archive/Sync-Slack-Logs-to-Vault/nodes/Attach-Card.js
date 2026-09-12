const rec=$json||{};
const f=rec.fields||rec;
const ts=String(f['BDR Thread TS']||'');
let card=null;
try{ card=$('BDR Cards With Replies').all().map(i=>i.json).find(c=>c&&ts!==''&&String(c.ts||'')===ts)||null; }catch(e){}
return { json: { record_id: rec.id||'', prospect_name: f.Name||'', ts: ts, replies: (card&&card.replies)||[] } };