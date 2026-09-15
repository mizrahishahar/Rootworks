// BZ Requests: Blitz for the people GetLeads did not answer, by email only (Blitz resolves a person
// from a verified work email, not from a LinkedIn URL), one credit per answer. Only within the
// run's cap: Max Rows on the launch row, less what earlier batches already asked (the run row's
// Tally is the accumulator, read by Read Cap Row just before). A person with no email at the
// domain goes to nobody. Blank or 0 cap means Blitz is never asked.
const ctx=$('Read Records').first().json||{};
const gl=$('GL Match').first().json||{ profiles:{} };
let asked=0; try{ const prior=$('Read Cap Row').first().json; const raw=prior&&prior.fields?prior.fields.Tally:null; if(raw){ const t=JSON.parse(String(raw)); if(t&&String(t.execId)===String(ctx._execId)) asked=Number(t.blitzCalls)||0; } }catch(e){}
const cap=Math.max(0,Number(ctx._maxBlitz)||0);
let room=Math.max(0,cap-asked);
const one=(v)=>String(Array.isArray(v)?(v[0]||''):(v==null?'':v)).trim();
const norm=(d)=>one(d).toLowerCase().replace(/^https?:\/\//,'').replace(/^www\./,'').replace(/\/.*$/,'');
const splitEmails=(s)=>one(s).split(/[,;\s]+/).map(e=>e.trim().toLowerCase()).filter(e=>/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e));
const out=[]; const st={ candidates:0, noEmail:0, capped:0, cap, askedBefore:asked };
for(const i of $('Read Held').all()){
  const j=i.json||{}; if(!j.id||gl.profiles[j.id]) continue;
  st.candidates++;
  const f=j.fields||{}; const domain=norm(f.Domain);
  const emails=[one(f['Final Email']).toLowerCase()].concat(splitEmails(f.Email)).filter(e=>e&&domain&&(e.endsWith('@'+domain)||e.slice(e.lastIndexOf('@')+1).endsWith('.'+domain)));
  if(!emails.length){ st.noEmail++; continue; }
  if(room<=0){ st.capped++; continue; }
  room--;
  out.push({ json:{ id:j.id, domain, body:{ email:emails[0] } } });
}
if(!out.length) return [{ json:{ _none:true, _stats:st } }];
out[0].json._stats=st;
return out;
