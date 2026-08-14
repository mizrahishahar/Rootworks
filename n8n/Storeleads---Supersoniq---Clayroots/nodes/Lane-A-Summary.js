const BLACK=new Set(['hr','careers','career','jobs','job','legal','privacy','noreply','no-reply','donotreply','abuse','postmaster','compliance','recruiting','recruitment','press','media','unsubscribe','webmaster','admin','info-security']);
const emailsFrom=(ci)=>{const out=[];for(const c of (Array.isArray(ci)?ci:[])){if(!c||typeof c!=='object')continue;for(const k in c){const v=c[k];if(typeof v==='string'&&v.includes('@')&&!/\s/.test(v)){out.push(v.replace(/^mailto:/i,'').trim());}}}return out;};
const keepPublic=(arr)=>arr.filter(e=>{const lp=e.split('@')[0].toLowerCase().split('+')[0];return !BLACK.has(lp);});
const emailMap={};
for(const it of $('SL Pull').all()){const p=it.json||{};const doms=Array.isArray(p.domains)?p.domains:[];for(const d of doms){const dom=String(d.tld1||'').trim().toLowerCase();if(!dom)continue;const em=emailsFrom(d.contact_info);if(em.length){(emailMap[dom]=emailMap[dom]||[]).push(...em);}}}
const comps=$('Collect Domains').first().json._companies||[];
let n=0;
for(const c of comps){const dom=String(c.Domain||'').toLowerCase();const raw=keepPublic(emailMap[dom]||[]);const emails=Array.from(new Set(raw.map(e=>e.toLowerCase().trim())));if(emails.length)n++;}
const build=($('Waterfall Storeleads').first().json['Build name'])||'';
return [{ json:{ _laneA:true, companiesWithEmails:n, storesPulled:comps.length, domainsTable: build+' - Domains - '+$now.toFormat('yyyy-MM-dd') } }];