// The door's answer: every export's statistics, plus the inquiries content for the ones fetched.
// Reads both branches by name, never $input (the IF's false branch and the inquiries answers both
// land here and their order is not the trackId order).
const stats=$('Statistics Pairs').all().map(i=>i.json);
const parse=(b)=>{ if(typeof b!=='string') return b; try{ return JSON.parse(b); }catch(e){ return null; } };
const content={};
try{ for(const it of $('Ark Inquiries').all()){ const j=it.json||{}; const b=parse(j.body===undefined?j:j.body)||{}; const t=String(b.trackId||''); if(t) content[t]=Array.isArray(b.content)?b.content:[]; } }catch(e){}
const results=stats.map(s=>Object.assign({}, s, { content: content[s.trackId]||[] }));
return [{ json:{ results:results, count:results.length, fetched:Object.keys(content).length } }];
