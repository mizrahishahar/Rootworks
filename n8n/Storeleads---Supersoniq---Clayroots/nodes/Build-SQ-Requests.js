const form = $('Waterfall Storeleads').first().json;
const domains = ($('Collect Domains').first().json._companies || []).map(c => c.Domain);
const asArr = (v, def) => { if (v===undefined||v===null||v==='') return def; if (Array.isArray(v)) return v.map(x=>String(x).trim()).filter(Boolean); return String(v).split(',').map(s=>s.trim()).filter(Boolean); };
const seniority = asArr(form['Seniority levels (default net pre-ticked; untick to narrow)'], ['C-Suite','Founder','Owner','President','VP','Head','Director']);
const depts = asArr(form['Target departments (tick to narrow; ALL = every department)'], ['ALL']);
const ccList = ($('Build SL Query').first().json._ccList) || [];
const perCo = parseInt(form['Contacts per company'], 10) || 5;
const filters = { seniority };
if (ccList.length) { filters.contact_countries = ccList; }
if (!(depts.length===0 || depts.map(d=>String(d).toUpperCase()).includes('ALL'))) { filters.function = depts; }
const chunks = [];
for (let i=0; i<domains.length; i+=1000) { chunks.push(domains.slice(i, i+1000)); }
if (!chunks.length) return [];
return chunks.map(c => ({ json: { companies: c.map(d=>({domain:d})), filters, per_company_limit: perCo, tier: 'full' } }));