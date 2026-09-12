// Results: every settled task's results map (domain -> answer) becomes one write row per Companies
// row of that domain. DiscoGen answers either a bare value (a one-question prompt) or an object whose
// keys it named itself from the questions (a numbered prompt); the task's response_format carries the
// labels (proven 2026-09-12, run 24520: {market_type, supporting_quote, confidence}).
// Evidence off: a bare value is written verbatim into Output Field, coerced to the column's type
// (Number: the first number in the text; Checkbox: yes/true; Single select: the text, typecast mints
// the choice); an object is written as "Label: value" lines. Evidence on: the object is mapped onto
// the three columns: the confidence key (/confid/), the quote key (/quote|evidence|source/), and the
// first remaining key is the answer; "unknown" is written blank in Output Field with the quote and
// confidence beside it, so a rerun picks it up; a bare value with no object is the answer with no
// evidence and is counted unparsed. A domain DiscoGen did not answer is counted missing.
const p=$('Params').first().json;
const plan=$('Pick Rows').first().json||{};
const byDomain=plan.byDomain||{};
let tasks=[]; try{ tasks=$input.all().map(i=>i.json||{}).filter(j=>!j._none); }catch(e){}
const st={ tasks:tasks.length, submitted:0, submitErrors:[], failedTasks:[], timedOut:[], answered:0, unknown:0, unparsed:0, missing:0, rows:0, cost:0, taskIds:[] };
const results={}; const labelsOf={};
for(const t of tasks){
  if(t.taskId) st.taskIds.push(t.taskId);
  if(t.submitErr){ st.submitErrors.push('task '+t.idx+' ('+t.count+' domains): '+t.submitErr); continue; }
  st.submitted+=Number(t.count)||0; st.cost+=Number(t.cost)||0;
  if(t.timedOut){ st.timedOut.push(t.taskId+' ('+t.count+' domains, '+(t.progress||0)+'%)'); continue; }
  if(t.status!=='completed'){ st.failedTasks.push(t.taskId+': '+(t.failReason||t.status)); continue; }
  const labels=((t.format||{}).field_labels)||{};
  for(const k of Object.keys(t.results||{})){ const d=String(k).toLowerCase(); results[d]=t.results[k]; labelsOf[d]=labels; }
}
const strip=(s)=>String(s).replace(/^\s*```(?:json)?\s*/i,'').replace(/\s*```\s*$/,'').trim();
const asObject=(v)=>{ if(v&&typeof v==='object'&&!Array.isArray(v)) return v; if(typeof v!=='string') return null; const s=strip(v); if(!/^\{[\s\S]*\}$/.test(s)) return null; try{ const o=JSON.parse(s); return (o&&typeof o==='object'&&!Array.isArray(o))?o:null; }catch(e){ return null; } };
const text=(v)=>{ if(v===undefined||v===null) return ''; if(typeof v==='object') return JSON.stringify(v); return String(v).trim(); };
const coerce=(v)=>{ const s=text(v); if(!s) return undefined; if(p.outputType==='Number'){ const m=s.replace(/,/g,'').match(/-?\d+(\.\d+)?/); return m?Number(m[0]):undefined; } if(p.outputType==='Checkbox'){ if(/^(yes|true|y)\b/i.test(s)) return true; if(/^(no|false|n)\b/i.test(s)) return false; return undefined; } return s; };
const pickKeys=(o)=>{ const keys=Object.keys(o); const conf=keys.find(k=>/confid/i.test(k))||''; const ev=keys.find(k=>k!==conf&&/quote|evidence|source|support/i.test(k))||''; const ans=keys.find(k=>k!==conf&&k!==ev)||''; return { ans, ev, conf }; };
const lines=(o,labels)=>Object.keys(o).map(k=>(labels[k]||k)+': '+text(o[k])).join('\n');
const out=[];
for(const d of Object.keys(byDomain)){
  if(!(d in results)){ st.missing++; continue; }
  const raw=results[d]; const o=asObject(raw);
  const fields={};
  if(p.evidence){
    if(!o){ st.unparsed++; const c=coerce(raw); if(c!==undefined) fields[p.outputField]=c; fields[p.outputField+' Evidence']=''; }
    else {
      const k=pickKeys(o);
      const ans=text(o[k.ans]);
      const ev=text(o[k.ev]); const evClean=/^(none|n\/a|null|)$/i.test(ev)?'':ev;
      const unknown=!ans||/^unknown$/i.test(ans);
      if(unknown){ st.unknown++; fields[p.outputField+' Evidence']=evClean||'unknown: the source does not say'; }
      else { st.answered++; const c=coerce(ans); if(c!==undefined) fields[p.outputField]=c; fields[p.outputField+' Evidence']=evClean; }
      const conf=Number(String(o[k.conf]||'').replace(/[^0-9.]/g,'')); if(isFinite(conf)&&k.conf) fields[p.outputField+' Confidence']=Math.max(0,Math.min(1,conf));
    }
  } else {
    const v=o?lines(o,labelsOf[d]||{}):raw;
    const c=coerce(v);
    if(c===undefined){ st.unknown++; continue; }
    st.answered++; fields[p.outputField]=c;
  }
  if(p.overwrite&&fields[p.outputField]===undefined&&p.outputType!=='Checkbox') fields[p.outputField]=p.outputType==='Number'?null:'';
  for(const id of byDomain[d]){ st.rows++; out.push({ json:Object.assign({ id }, fields) }); }
}
if(!out.length) return [{ json:{ _empty:true, _stats:st } }];
out[0].json._stats=st;
return out;
