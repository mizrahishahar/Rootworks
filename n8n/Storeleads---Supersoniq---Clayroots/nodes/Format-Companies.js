const cleanCompany=(nm)=>{if(!nm)return'';let c=String(nm).trim().replace(/[®™]/g,'');for(let i=0;i<2;i++){c=c.replace(/[,\s]+(inc|llc|l\.l\.c\.|ltd|limited|corp|corporation|co|company|gmbh|plc|llp|lp|pllc|pc)\.?$/i,'').trim();}return c.replace(/,+$/,'').trim();};
const BLACK=new Set(['hr','careers','career','jobs','job','legal','privacy','noreply','no-reply','donotreply','abuse','postmaster','compliance','recruiting','recruitment','press','media','unsubscribe','webmaster','admin','info-security']);
const emailsFrom=(ci)=>{const out=[];for(const c of (Array.isArray(ci)?ci:[])){if(!c||typeof c!=='object')continue;for(const k in c){const v=c[k];if(typeof v==='string'&&v.includes('@')&&!/\s/.test(v)){out.push(v.replace(/^mailto:/i,'').trim());}}}return out;};
const keepPublic=(arr)=>arr.filter(e=>{const lp=e.split('@')[0].toLowerCase().split('+')[0];return !BLACK.has(lp);});
const emailMap={};
for(const it of $('SL Pull').all()){const p=it.json||{};const doms=Array.isArray(p.domains)?p.domains:[];for(const d of doms){const dom=String(d.tld1||'').trim().toLowerCase();if(!dom)continue;const em=emailsFrom(d.contact_info);if(em.length){(emailMap[dom]=emailMap[dom]||[]).push(...em);}}}
const comps=$('Collect Domains').first().json._companies||[];
const qn=($('Waterfall Storeleads').first().json['Build name'])||'';
const out=[];
for(const c of comps){
  const dom=String(c.Domain||'').toLowerCase();
  const raw=keepPublic(emailMap[dom]||[]);
  const emails=Array.from(new Set(raw.map(e=>e.toLowerCase().trim())));
  if(!emails.length)continue;
  out.push({json:{
    Domain:dom, Company:c.Company||'', company_clean:cleanCompany(c.Company),
    public_emails_clean:emails.join(', '),
    'Industry Groups':c['Industry Groups']||'', Employees:(c.Employees===''||c.Employees==null)?'':String(c.Employees),
    City:c.City||'', State:c.State||'', Country:c.Country||'', Description:c.Description||'', Plan:c.Plan||'',
    'Revenue Est Monthly':(c['Revenue Est Monthly']==null?null:c['Revenue Est Monthly']),
    'Store Age Years':(c['Store Age Years']==null?null:c['Store Age Years']),
    'Product Count':(c['Product Count']==null?null:c['Product Count']),
    'App Spend Mo':(c['App Spend Mo']==null?null:c['App Spend Mo']),
    'Key Apps':c['Key Apps']||'', 'Tech Stack':c['Tech Stack']||'',
    'Trustpilot Rating':(c['Trustpilot Rating']==null?null:c['Trustpilot Rating']),
    'Trustpilot Reviews':(c['Trustpilot Reviews']==null?null:c['Trustpilot Reviews']),
    'Migrated From':c['Migrated From']||'', 'Social Followers':c['Social Followers']||'', Features:c.Features||'',
    segment:'has_public', query_name:qn, ingested_at:$now.toISO(), Source:'Storeleads'
  }});
}
return out;