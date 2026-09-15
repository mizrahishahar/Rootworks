// GL Requests: one GetLeads search per person, the cheapest exact key first. Email address is an
// exact match (Final Email, else the first address in Email at the person's domain); a LinkedIn
// URL is a substring match on its slug; last resort is first name and last name at the domain,
// substring matches that narrow rather than identify, so the answer is re-checked by GL Match. The
// answer carries the profile columns. Every returned row is one fair-use row, never cash; limit 5
// keeps a loose name match from costing more than a handful. People with no key at all are
// carried in _stats and go to nobody.
const held=$('Read Held').all().map(i=>i.json||{}).filter(j=>j.id);
const one=(v)=>String(Array.isArray(v)?(v[0]||''):(v==null?'':v)).trim();
const norm=(d)=>one(d).toLowerCase().replace(/^https?:\/\//,'').replace(/^www\./,'').replace(/\/.*$/,'');
const slugOf=(u)=>{ const m=one(u).toLowerCase().match(/linkedin\.com\/in\/([^\/?#]+)/); return m?m[1].replace(/\/+$/,''):''; };
const splitEmails=(s)=>one(s).split(/[,;\s]+/).map(e=>e.trim().toLowerCase()).filter(e=>/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e));
const COLUMNS=['First Name','Last Name','Contact Full Name','Email','Contact LinkedIn URL','Company Domain','Work Email Domain','Profile Headline','About Me','Current Role Description','Current Role Start Date','Work City','Work Country Code','Education','Skills','Languages'];
const out=[]; const st={ people:held.length, byEmail:0, byLinkedin:0, byName:0, noKey:0 };
for(const h of held){
  const f=h.fields||{};
  const domain=norm(f.Domain);
  const emails=[one(f['Final Email']).toLowerCase()].concat(splitEmails(f.Email)).filter(e=>e&&domain&&(e.endsWith('@'+domain)||e.slice(e.lastIndexOf('@')+1).endsWith('.'+domain)));
  const slug=slugOf(f['LinkedIn URL']);
  const first=one(f.first_name), last=one(f.last_name);
  let body=null, how='';
  if(emails.length){ body={ email_address:emails[0], limit:5, offset:0, columns:COLUMNS }; how='email'; st.byEmail++; }
  else if(slug){ body={ linkedin_url:'linkedin.com/in/'+slug, limit:5, offset:0, columns:COLUMNS }; how='linkedin'; st.byLinkedin++; }
  else if(first&&last&&domain){ body={ domains:[domain], first_name:first, last_name:last, limit:5, offset:0, columns:COLUMNS }; how='name'; st.byName++; }
  else { st.noKey++; continue; }
  out.push({ json:{ id:h.id, domain, how, body } });
}
if(!out.length) return [{ json:{ _none:true, _stats:st } }];
out[0].json._stats=st;
return out;
