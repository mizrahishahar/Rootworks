// Merge: the profiles against what each held row already carries. Same rule as Enrich Contacts: a
// held value stands, a blank is filled, nothing is overwritten, a blank never travels. GetLeads'
// profile first, Blitz's fills what is still blank. One item per row that changes, {id, fields};
// the first carries _stats; {_empty} when nothing changed.
const ctx=$('Read Records').first().json||{};
const PROFILE=Array.isArray(ctx._profileFields)&&ctx._profileFields.length?ctx._profileFields:['Headline','About','Role Description','Role Start Date','Person City','Person Country','Education','Skills','Languages','Prior Employer','Prior Title'];
const gl=$('GL Match').first().json||{ profiles:{}, stats:{} };
let bz={ profiles:{}, stats:{} }; try{ bz=$('BZ Match').first().json||bz; }catch(e){}
const one=(v)=>String(Array.isArray(v)?(v[0]||''):(v==null?'':v)).trim();
const st={ rows:0, answered:0, unanswered:0, filled:0, cells:0, byGetLeads:0, byBlitz:0, gl:gl.stats||{}, bz:bz.stats||{} };
const out=[];
for(const i of $('Read Held').all()){
  const j=i.json||{}; if(!j.id) continue;
  st.rows++;
  const f=j.fields||{};
  const sources=[gl.profiles[j.id], bz.profiles[j.id]].filter(Boolean);
  if(!sources.length){ st.unanswered++; continue; }
  st.answered++;
  const changes={}; let by='';
  for(const k of PROFILE){
    if(one(f[k])) continue;
    for(const src of sources){ let v=String(src[k]==null?'':src[k]).trim(); if(k==='Role Start Date'&&!/^\d{4}-\d{2}-\d{2}$/.test(v)) v=''; if(v){ changes[k]=v; by=by||src._by; break; } }
  }
  const n=Object.keys(changes).length;
  if(!n) continue;
  st.filled++; st.cells+=n; if(by==='Blitz') st.byBlitz++; else st.byGetLeads++;
  out.push({ json:Object.assign({ id:j.id }, changes) });
}
if(!out.length) return [{ json:{ _empty:true, _stats:st } }];
out[0].json._stats=st;
return out;
