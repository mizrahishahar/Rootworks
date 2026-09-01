// Parse Ark: export result pages (bodies carrying trackId and content[]) -> people per domain,
// kept up to the gap. Results endpoint verified in docs 2026-09-02: GET
// /v1/people/export/{trackId}/inquiries?page&size, content[] of { id, profile { full_name,
// title, headline }, department { seniority, functions }, link { linkedin }, location, email
// { state, output [ { address, status } ] } }. Email: the first VALID address delivered, else
// the first address; emails land as delivered. Credits: 0.5 per person plus 0.5 per email
// found, from the statistics each export reported (the results door carries no credit figure).
let st={ pending:[], done:[], errors:[], submitted:0, attempts:0 };
try{ st=$('Ark Check').first().json||st; }catch(e){ try{ st=$('Ark Track').first().json||st; }catch(e2){} }
let items=[]; try{ items=$('Ark Results').all(); }catch(e){}
const doneByTrack={}; for(const d of (st.done||[])) doneByTrack[d.trackId]=d;
const people={};
const stats={ called:Number(st.submitted)||0, returned:0, kept:0, credits:0, errors:(st.errors||[]).length, firstError:((st.errors||[])[0]||{}).reason||'', failReasons:(st.errors||[]).slice(0,5).map(e=>'AI-Ark '+e.domain+': '+e.reason), polls:Number(st.attempts)||0 };
for(const d of (st.done||[])) stats.credits+=0.5*(Number(d.total)||0)+0.5*(Number(d.found)||0);
const pickEmail=(e)=>{ const out=e&&Array.isArray(e.output)?e.output:[]; const valid=out.find(o=>String((o||{}).status||'').toUpperCase()==='VALID'); const o=valid||out[0]; return o?String(o.address||'').trim():''; };
for(const it of items){
  const b=it.json||{};
  if(!Array.isArray(b.content)){ if(b.error||b.status>=400){ stats.errors++; const r='AI-Ark results: '+String((b.error&&b.error.message)||b.message||b.description||'call failed').slice(0,160); if(!stats.firstError) stats.firstError=r; stats.failReasons.push(r); } continue; }
  const d=doneByTrack[String(b.trackId||'')]; if(!d) continue;
  const list=people[d.domain]||(people[d.domain]=[]);
  for(const h of b.content){
    const prof=(h&&h.profile)||{}; if(!prof.full_name) continue;
    stats.returned++;
    if(list.length>=d.gap) continue;
    const loc=h.location||{};
    list.push({ source:'AI-Ark', sourceId:String(h.id||''), name:String(prof.full_name||'').trim(), title:String(prof.title||prof.headline||'').trim(), seniority:String((h.department||{}).seniority||''), department:[].concat((h.department||{}).functions||[]).join(', '), email:pickEmail(h.email), linkedin:String((h.link||{}).linkedin||'').trim(), phone:'', state:String(loc.state||'') });
    stats.kept++;
  }
}
return [{ json: { people: people, stats: stats } }];
