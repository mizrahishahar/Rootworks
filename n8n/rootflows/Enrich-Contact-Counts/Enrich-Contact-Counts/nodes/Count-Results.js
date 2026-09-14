// Count Results: the count answers (aligned to Make Asks by index; the node hands a failure over as
// {error}) -> one verdict per domain: a number, or an error. A zero with Titles is ambiguous: no
// such people, or a company GetLeads has never heard of. Those domains go to one more free call
// with no titles (Coverage Asks); a zero with no Titles is already that call, and means unknown.
// Emits one item carrying every verdict plus the coverage list; never throws.
const p=$('Params').first().json;
const errMsg=(e)=>{ if(!e) return 'call failed'; if(typeof e==='string') return e; return String((e.message||'')+' '+(e.description||'')).trim()||'call failed'; };
let asks=[]; try{ asks=$('Make Asks').all().map(i=>i.json||{}).filter(j=>!j._none); }catch(e){}
let answers=[]; try{ answers=$('GL Count').all(); }catch(e){}
const verdicts={}; const coverage=[]; const st={ called:0, counted:0, errors:0, credits:0, firstError:'', failReasons:[], noKey:0 };
const note=(r)=>{ if(!st.firstError) st.firstError=r; if(st.failReasons.length<12) st.failReasons.push(r); };
answers.forEach((it,i)=>{
  const ask=asks[i]; if(!ask) return;
  st.called++;
  const j=it.json||{};
  if(j.error&&j.total_matching===undefined&&j.body===undefined){
    const msg=errMsg(j.error);
    if(/credential/i.test(msg)){ st.noKey++; verdicts[ask.domain]={ error:'no credential on the GetLeads node' }; return; }
    st.errors++; verdicts[ask.domain]={ error:msg.slice(0,160) }; note('GetLeads count '+ask.domain+': '+msg.slice(0,160)); return;
  }
  const b=(j.body!==undefined&&typeof j.body==='object')?j.body:j;
  if(typeof b.total_matching!=='number'){ st.errors++; const r='GetLeads count '+ask.domain+': no total_matching in '+JSON.stringify(b).slice(0,120); verdicts[ask.domain]={ error:r }; note(r); return; }
  st.credits+=Number(b.credits_used)||0;
  st.counted++;
  const n=b.total_matching;
  if(n===0){ if(p.titles.length){ coverage.push(ask.domain); verdicts[ask.domain]={ pending:true }; } else verdicts[ask.domain]={ value:null, unknown:true }; return; }
  verdicts[ask.domain]={ value:n };
});
return [{ json:{ verdicts, coverage, stats:st } }];
