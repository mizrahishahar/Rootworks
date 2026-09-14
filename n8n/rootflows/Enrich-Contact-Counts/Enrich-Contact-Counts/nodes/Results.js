// Results: the verdicts settled (the coverage answers close every pending zero) and turned into
// write rows: {id, <Output Field>: number or null}. A blank is written on purpose for a company
// GetLeads does not know, so a stale number never survives a recount. A domain whose call errored
// is not written at all. One item per row, the first carrying _stats; {_empty} when nothing.
const p=$('Params').first().json;
const pick=$('Pick Rows').first().json||{};
const cr=$('Count Results').first().json||{ verdicts:{}, coverage:[], stats:{} };
const verdicts=Object.assign({}, cr.verdicts||{});
const st=Object.assign({ called:0, counted:0, errors:0, credits:0, firstError:'', failReasons:[], noKey:0 }, cr.stats||{});
st.coverageCalled=0; st.coverageUnknown=0; st.coverageZero=0;
const errMsg=(e)=>{ if(!e) return 'call failed'; if(typeof e==='string') return e; return String((e.message||'')+' '+(e.description||'')).trim()||'call failed'; };
const note=(r)=>{ if(!st.firstError) st.firstError=r; if(st.failReasons.length<12) st.failReasons.push(r); };
let asks=[]; try{ asks=$('Coverage Asks').all().map(i=>i.json||{}).filter(j=>!j._none); }catch(e){}
let answers=[]; try{ answers=$('GL Coverage').all(); }catch(e){}
answers.forEach((it,i)=>{
  const ask=asks[i]; if(!ask) return;
  st.coverageCalled++;
  const j=it.json||{};
  if(j.error&&j.total_matching===undefined&&j.body===undefined){ st.errors++; const r='GetLeads coverage '+ask.domain+': '+errMsg(j.error).slice(0,160); verdicts[ask.domain]={ error:r }; note(r); return; }
  const b=(j.body!==undefined&&typeof j.body==='object')?j.body:j;
  if(typeof b.total_matching!=='number'){ st.errors++; const r='GetLeads coverage '+ask.domain+': no total_matching'; verdicts[ask.domain]={ error:r }; note(r); return; }
  st.credits+=Number(b.credits_used)||0;
  if(b.total_matching===0){ st.coverageUnknown++; verdicts[ask.domain]={ value:null, unknown:true }; } else { st.coverageZero++; verdicts[ask.domain]={ value:0 }; }
});
// A pending verdict with no coverage answer (the call never ran) is an error, not a blank.
for(const d of Object.keys(verdicts)){ if(verdicts[d].pending){ st.errors++; verdicts[d]={ error:'coverage call missing' }; note('GetLeads coverage '+d+': no answer'); } }
st.unknown=0; st.zero=0; st.positive=0; st.sum=0; st.rows=0; st.notWritten=0;
const out=[];
for(const d of Object.keys(pick.byDomain||{})){
  const v=verdicts[d];
  if(!v||v.error){ st.notWritten+=(pick.byDomain[d]||[]).length; continue; }
  if(v.value===null) st.unknown++; else if(v.value===0) st.zero++; else { st.positive++; st.sum+=v.value; }
  for(const id of pick.byDomain[d]){ const row={ id }; row[p.outputField]=v.value; out.push({ json:row }); st.rows++; }
}
if(!out.length) return [{ json:{ _empty:true, _stats:st } }];
out[0].json._stats=st;
return out;
