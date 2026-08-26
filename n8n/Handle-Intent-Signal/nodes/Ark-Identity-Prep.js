// Ark Identity Prep: one AI-Ark people-search body per kept contact (Operator ruling
// 2026-08-25: AI-Ark is the LinkedIn identity authority; LinkedIn matters more than email).
// Search by full name + company domain: the hit IS the person's canonical profile, so one call
// verifies who they are, that they still work at the company, returns the correct URL, and the
// structured seniority/function the decision-maker gate reads. 0.5 credits per returned result,
// size 2 so a same-name ambiguity is visible. The _empty placeholder gets a no-op body.
const out=[];
const NOOP={ contact:{ fullName:{ any:{ include:{ mode:'STRICT', content:['zzz-nobody-zzz'] } } } }, account:{ domain:{ any:{ include:['none.invalid'] } } }, page:0, size:1 };
for(const it of $input.all()){
  const j=it.json||{};
  // AI-Ark-sourced contacts arrive identity-true (stamped at build): no second lookup.
  if(j._empty||j['LinkedIn Verified At']){ out.push({ json: Object.assign({}, j, { arkBody:NOOP, _preverified:!j._empty }) }); continue; }
  out.push({ json: Object.assign({}, j, { arkBody: {
    contact:{ fullName:{ any:{ include:{ mode:'SMART', content:[String(j.Name||'').trim()] } } } },
    account:{ domain:{ any:{ include:[String(j.Domain||'').toLowerCase().trim()] } } },
    page:0, size:2
  } }) });
}
return out;
