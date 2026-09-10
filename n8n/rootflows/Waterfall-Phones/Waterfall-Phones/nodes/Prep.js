// Prep: the batch's state, one item, carried from stage to stage by name (the Enrich Emails shape).
// Per row: the cleaned names, the domain, the LinkedIn URL, the best work email, and the Phone cell
// the contact providers already delivered.
//
// The tiers, first hit wins, unchanged from the machine this Rootflow grew out of:
//   database -> Supersoniq (resolve at the domain, then unlock by contact id) -> AI-Ark -> LeadMagic
//   -> Prospeo
// A person whose Phone cell is already filled is answered from the database and costs nothing: the
// view is the spend cap, so feed this Rootflow a view where Phone is empty when a fresh lookup is
// what you want. A direct number always beats a toll-free switchboard; a toll-free hit is held aside
// and only written when no tier delivered a direct line.
const rows=$('Read Records').all().map(i=>i.json||{}).filter(j=>j.id);
const s=(v)=>String(Array.isArray(v)?(v[0]||''):(v==null?'':v)).trim();
const clean=(v)=>String(v||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z]/g,'');
const digits=(v)=>String(v||'').replace(/\D/g,'');
const plausible=(v)=>{ const d=digits(v); return d.length>=7&&d.length<=15; };
const isTollFree=(v)=>{ let x=digits(v); if(x.length===11&&x.charAt(0)==='1') x=x.slice(1); return x.length===10&&/^(?:800|833|844|855|866|877|888)/.test(x); };
const emails=(v)=>Array.from(new Set(String(v||'').split(/[,;\s]+/).map(e=>e.trim().toLowerCase()).filter(e=>/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e))));
const state={ order:[], rows:{}, domains:{}, stats:{ rows:rows.length, fromDatabase:0, sqDomains:0, sqResolveCalls:0, sqMatched:0, sqUnlockCalls:0, sqFound:0, arkCalls:0, arkFound:0, lmCalls:0, lmFound:0, prCalls:0, prFound:0, tollFreeOnly:0, skips:{} } };
for(const r of rows){
  const f=r.fields||{};
  const domain=s(f.Domain).toLowerCase();
  const firstRaw=s(f.first_name), lastRaw=s(f.last_name);
  // Email is the lane's candidate list; the address at the row's own domain is the work email the
  // phone finders want, and a foreign-domain address is the fallback.
  const list=emails(f.Email);
  const own=list.filter(e=>domain&&(e.slice(e.lastIndexOf('@')+1)===domain||e.slice(e.lastIndexOf('@')+1).endsWith('.'+domain)));
  const email=own[0]||list[0]||'';
  const row={ id:r.id, firstRaw, lastRaw, first:clean(firstRaw), last:clean(lastRaw), fullName:(firstRaw+' '+lastRaw).trim(), domain, linkedin:s(f['LinkedIn URL']), email, resolved:null, tf:null, sqContactId:'', asked:{ sq:false, ark:false, lm:false, pr:false }, error:'' };
  const held=s(f.Phone);
  if(held&&plausible(held)){
    row.resolved={ phone:held, provider:'database', type:isTollFree(held)?'toll-free':'direct' };
    state.stats.fromDatabase++;
  }
  state.order.push(r.id);
  state.rows[r.id]=row;
  if(!row.resolved&&domain){ (state.domains[domain]=state.domains[domain]||[]).push(r.id); }
}
state.stats.sqDomains=Object.keys(state.domains).length;
return [{ json:state }];
