// Keeps the previous balance per tool so Normalize can compute Daily Burn. Emits one tick for the chain.
const sd=$getWorkflowStaticData('global');
sd.prevCredits={};
for(const it of $input.all()){ const r=it.json||{}; const f=r.fields||r; const t=String(f.Tool||'').trim(); if(!t) continue; sd.prevCredits[t]={ credits:(f.Credits===undefined||f.Credits===null||f.Credits==='')?null:Number(f.Credits), checkedAt:f['Checked At']||'' }; }
return [{ json: { tick:true, known:Object.keys(sd.prevCredits).length } }];
