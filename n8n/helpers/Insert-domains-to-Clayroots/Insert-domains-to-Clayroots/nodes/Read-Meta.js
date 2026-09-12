// Read Meta: the helper's contract in one place. Items are Companies rows in the register's
// shape; the first item also carries _meta {base, clientRecId, tag, domainSource, allowNew,
// keys}. keys is optional: the column names a caller will write later in the run, so a
// rows-less call checks (and, with allowNew, creates) the columns before a paid pull (the
// Storeleads preflight). Every key that starts with "_" is a carrier (_meta, _stats), never a
// column. Domains are normalised (scheme, www, path off, lower case); rows without one and
// duplicate domains within the call are counted and dropped, never errors. One item out: the
// meta, the key union, the counts, the rows.
const items=$input.all();
if(!items.length){ throw new Error('Insert domains to Clayroots was called with no items. Pass the Companies rows with _meta on the first item. Nothing was written.'); }
const meta=(items[0].json||{})._meta;
if(!meta||typeof meta!=='object'){ throw new Error('Insert domains to Clayroots: the first item carries no _meta {base, clientRecId, tag, domainSource, allowNew}. Nothing was written.'); }
const base=String(meta.base||'').trim();
if(!/^app[A-Za-z0-9]{14}$/.test(base)){ throw new Error('Insert domains to Clayroots: _meta.base "'+base+'" is not an Airtable base id. Nothing was written.'); }
const domainSource=String(meta.domainSource||'').trim();
if(!domainSource){ throw new Error('Insert domains to Clayroots: _meta.domainSource is empty; it names the Domain Source new rows get. Nothing was written.'); }
const norm=(d)=>String(d==null?'':d).trim().toLowerCase().replace(/^https?:\/\//,'').replace(/^www\./,'').replace(/\/.*$/,'');
const keys=new Set((Array.isArray(meta.keys)?meta.keys:[]).map(k=>String(k)).filter(Boolean));
const rows=[]; const seen=new Set(); let inCount=0, noDomain=0, duplicate=0;
for(const it of items){
  const j=it.json||{}; const r={}; let any=false;
  for(const k of Object.keys(j)){ if(k.charAt(0)==='_') continue; r[k]=j[k]; keys.add(k); any=true; }
  if(!any) continue;
  inCount++;
  const d=norm(r.Domain); if(!d){ noDomain++; continue; }
  if(seen.has(d)){ duplicate++; continue; }
  seen.add(d); r.Domain=d; rows.push(r);
}
return [{ json: { base: base, clientRecId: String(meta.clientRecId||'').trim(), tag: String(meta.tag||'').trim(), domainSource: domainSource, allowNew: meta.allowNew===true, keys: Array.from(keys), in: inCount, noDomain: noDomain, duplicate: duplicate, rows: rows } }];
