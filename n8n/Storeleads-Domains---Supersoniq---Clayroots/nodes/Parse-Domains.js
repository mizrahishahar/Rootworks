const rows=$input.all().map(i=>i.json);
if(!rows.length){ throw new Error('CSV parse returned no rows.'); }
const headers=Object.keys(rows[0]||{});
const domKey=headers.find(h=>String(h).trim().toLowerCase()==='domain');
if(!domKey){ throw new Error('No Domain column found in CSV. Headers found: '+headers.join(', ')); }
const COLS=['Company','company_clean','Industry Groups','Business Model','MX Provider','Employees','City','State','Country','Description','Plan','Revenue Est Monthly','Store Age Years','Product Count','App Spend Mo','Key Apps','Tech Stack','Trustpilot Rating','Trustpilot Reviews','Migrated From','Social Followers','Growth 90d','Features'];
const have=new Set(COLS.filter(c=>headers.includes(c)));
const domains=[]; const cmap={}; const seen=new Set();
for(const r of rows){
  const d=String(r[domKey]==null?'':r[domKey]).trim().toLowerCase();
  if(!d||seen.has(d))continue;
  seen.add(d); domains.push(d);
  const co={};
  for(const c of COLS){ co[c]=have.has(c)?(r[c]==null?'':r[c]):''; }
  cmap[d]=co;
}
return [{ json: { _domains: domains, _cmap: cmap, _domain_count: domains.length, _row_count: rows.length } }];