// Writer Response: the last node, what the lane receives: counts only, never rows. Written rows
// are counted from every 2xx answer's records[]; a request that was not 2xx counts every record it
// carried as a write error with the HTTP reason (never retried: a 429 locks Airtable for 30 s).
const n=(v)=>Number(v)||0;
let merge={}; try{ merge=($('Merge People').first().json||{})._stats||{}; }catch(e){}
const rowsOf=(name)=>{ try{ return $(name).all().filter(i=>i.json&&!i.json._empty&&i.json['Contact Key']).length; }catch(e){ return 0; } };
const dnc=Math.max(0, rowsOf('Clean Fields')-rowsOf('Apply DNC'));
const parse=(b)=>{ if(typeof b!=='string') return b; try{ return JSON.parse(b); }catch(e){ return null; } };
let written=0, updatedWritten=0, writeErrors=0; const reasons=[];
let chunks=[], resps=[];
try{ chunks=$('Chunk People').all().map(i=>i.json); resps=$('Write People').all(); }catch(e){}
resps.forEach((it,i)=>{
  const c=chunks[i]||{ size:0, updates:0 }; const j=it.json||{};
  if(j.error&&j.statusCode===undefined){ writeErrors+=n(c.size); if(reasons.length<5) reasons.push('People writer: '+String((j.error&&j.error.message)||j.error||'call failed').slice(0,160)); return; }
  const status=n(j.statusCode); const b=parse(j.body===undefined?null:j.body);
  if(status>=200&&status<300&&b&&Array.isArray(b.records)){ written+=b.records.length; updatedWritten+=n(c.updates); if(b.records.length<n(c.size)) writeErrors+=n(c.size)-b.records.length; return; }
  writeErrors+=n(c.size);
  const e=b&&b.error; const why=e?(typeof e==='object'?(e.message||e.type||JSON.stringify(e)):String(e)):(typeof j.body==='string'?j.body:'');
  if(reasons.length<5) reasons.push(('People writer HTTP '+status+' '+String(why||'')).replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim().slice(0,180)+(status===429?' (rate limited; never retried)':''));
});
return [{ json:{ returned:n(merge.returned), built:n(merge.built), updated:n(merge.updated), heldUnchanged:n(merge.heldUnchanged), dupes:n(merge.dupes), noKey:n(merge.noKey), fenced:n(merge.fenced), emailsAppended:n(merge.emailsAppended), singleSelectSource:!!merge.singleSelectSource, dnc, written, updatedWritten, writeErrors, writeRequests:resps.length, writeReasons:reasons, coveredDomains:Array.isArray(merge.coveredDomains)?merge.coveredDomains:[] } }];
