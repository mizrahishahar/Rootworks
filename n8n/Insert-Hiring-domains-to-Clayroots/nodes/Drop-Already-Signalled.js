// Drop Already Signalled: the cross-day dedupe, before any paid call (Operator ruling 2026-09-06).
// Filter & Qualify Jobs dedupes inside one scrape (one row per domain). This node dedupes against
// the base: a company whose Companies row already links THIS signal's mirror row has been through
// the whole chain before (ICP judged, landed, sourced, queued) and is dropped here, so DiscoLike is
// not paid to judge it again and it does not re-enter the queue. A company already in the base
// under a different signal, or under none, passes: a new signal on a known company is exactly what
// we want. Read Known Signals is one Airtable read by Domain over the qualified domains.
// The kept items keep Filter & Qualify Jobs' shape byte for byte: Company Facts aligns BizData
// answers to this list by index, so nothing downstream changes but the count.
const mirrorId=String(($('Resolve Mirror Row').first().json||{}).mirrorId||'');
const norm=(d)=>String(d||'').trim().toLowerCase();
const known=new Set();
try{ for(const it of $('Read Known Signals').all()){ const j=it.json||{}; const f=j.fields||j; const d=norm(f.Domain); const s=(Array.isArray(f.Signals)?f.Signals:[]).map(x=>(x&&typeof x==='object')?x.id:x); if(d&&mirrorId&&s.indexOf(mirrorId)>-1) known.add(d); } }catch(e){}
const items=$('Filter & Qualify Jobs').all();
let stats=null; const out=[]; const dropped=[];
for(const it of items){
  const j=it.json||{};
  if(j._stats&&!stats) stats=Object.assign({},j._stats);
  if(j._empty) continue;
  const d=norm(j.domain); if(!d) continue;
  if(known.has(d)){ dropped.push(d); continue; }
  const copy=Object.assign({},j); delete copy._stats; out.push({ json: copy });
}
stats=stats||{ jobs_in:0, qualified:0, drops:{} };
stats.already_signalled=dropped.length; stats.already_signalled_domains=dropped.slice(0,40); stats.new_to_signal=out.length;
if(!out.length) return [{ json:{ _empty:true, _stats:stats } }];
out[0].json._stats=stats;
return out;
