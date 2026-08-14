const rec=$json||{};
const name=rec.Name||((rec.fields&&rec.fields.Name)||'');
let card={};
try{card=$('BDR Cards With Replies').item.json||{};}catch(e){}
return { json: { record_id: rec.id||'', prospect_name: name||card.company||'', ts: card.ts||'', replies: card.replies||[] } };