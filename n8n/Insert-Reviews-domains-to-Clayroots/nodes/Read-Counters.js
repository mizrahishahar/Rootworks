// Read Counters: the one counters item the helper Insert domains to Clayroots returns, read into
// one shape for the Any Landed? gate and Build Run Log. The helper's key names are read by alias
// until its contract lands (created / updated / upserted, dnc, in, failed[] or an errors count);
// landed falls back to created + updated. A Check Columns refusal never reaches here: the helper
// throws and the run crashes into the Error Logger with nothing written. Never throws itself: an
// unreadable item reads as zero landed and one failure, so the run still closes its row.
// Reused verbatim from Insert Hiring domains to Clayroots.
const j=$input.first().json||{};
const num=(...ks)=>{ for(const k of ks){ const v=j[k]; if(v!==undefined&&v!==null&&v!==''){ const n=Number(v); if(isFinite(n)) return n; } } return null; };
const created=num('created','new','inserted')||0;
const updated=num('updated','existing')||0;
let landed=num('upserted','landed','written','out','rows_out','records_out'); if(landed===null) landed=created+updated;
const dnc=num('dnc','dnc_skipped','skipped_dnc','suppressed')||0;
const rowsIn=num('in','rows_in','received','records_in')||0;
let failed=[];
if(Array.isArray(j.failed)) failed=j.failed.map(f=>(f&&typeof f==='object')?Object.assign({ tier:'Insert domains' }, f):{ tier:'Insert domains', name:'', reason:String(f) });
else { const e=num('errors','failed'); if(e) failed=[{ tier:'Insert domains', name:e+' row(s)', reason:'reported by the helper, no detail' }]; }
if(!Object.keys(j).length) failed.push({ tier:'Insert domains', name:'counters', reason:'the helper returned no counters item' });
return [{ json:{ rowsIn, created, updated, landed, dnc, failed, counters:j } }];
