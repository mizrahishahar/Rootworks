// Ark Plan: tier 3 is absolute, sized to the gap the base still shows after ContaGen and
// Supersoniq landed: only companies under their band cap, size = cap minus held, the LinkedIn
// URLs held at that domain excluded (contact.linkedin.any.exclude, verified in their docs
// 2026-09-02). One export per company. Export People with Email: 0.5 credits per person plus
// 0.5 per email found. The recount is what the base holds now, not what this batch wrote.
const plan=$('Plan Batch').first().json;
const held={};
try{
  for(const it of $('Recount People').all()){
    const j=it.json||{}; if(!j.id) continue;
    const f=j.fields||{};
    const d=String(f.Domain||'').trim().toLowerCase(); if(!d) continue;
    const h=held[d]||(held[d]={ count:0, keys:[], linkedin:[] });
    h.count++;
    const k=String(f['Contact Key']||'').trim().toLowerCase(); if(k) h.keys.push(k);
    const li=String(f['LinkedIn URL']||'').trim(); if(li) h.linkedin.push(li);
  }
}catch(e){}
// Seniority enum verified in docs 2026-09-02 (people-export-with-email): founder, owner, partner,
// c_suite, vp, director, head, manager, senior, mid-level, entry, intern. The contract's "cxo" is c_suite.
const SENIORITY=['founder','owner','partner','c_suite','vp','head','director','manager'];
// The export endpoint requires an HTTPS webhook (verified in docs); this no-op door must exist on
// n8n (POST /webhook/ai-ark-export-noop, respond 200). Polling the free statistics endpoint is
// the real completion signal. TODO(live): confirm the noop door exists before the first run.
const WEBHOOK='https://n8n.flowroots.com/webhook/ai-ark-export-noop';
const functions=Array.isArray(plan.arkFunctions)?plan.arkFunctions:[];
const requests=[]; const heldOut={};
if(plan.arkOn){
  for(const c of plan.plan){
    const h=held[c.domain]||{ count:0, keys:[], linkedin:[] };
    heldOut[c.domain]={ count:h.count, keys:h.keys, linkedin:h.linkedin };
    const gap=c.cap-h.count; if(gap<=0) continue;
    const exclude=Array.from(new Set(h.linkedin.filter(u=>/linkedin\.com\/in\//i.test(u))));
    const contact={ seniority:{ any:{ include:SENIORITY } } };
    if(exclude.length) contact.linkedin={ any:{ exclude:exclude } };
    // contact.departmentAndFunction.any.include (key and nesting verified in docs); values come from
    // the parent's mapping of the launch row's Departments into AI-Ark's taxonomy, never guessed here.
    if(functions.length) contact.departmentAndFunction={ any:{ include:functions } };
    requests.push({ domain:c.domain, gap:gap, body:{ account:{ domain:{ any:{ include:[c.domain] } } }, contact:contact, page:0, size:gap, webhook:WEBHOOK } });
  }
}
return [{ json: { arkRequests:requests, held:heldOut } }];
