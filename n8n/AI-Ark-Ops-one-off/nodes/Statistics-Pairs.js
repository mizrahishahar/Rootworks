// Pair each statistics answer with its trackId (same order as Split Track Ids) and decide whether
// the inquiries page is worth a read: only a DONE export with found > 0.
const ids=$('Split Track Ids').all().map(i=>i.json.trackId);
const parse=(b)=>{ if(typeof b!=='string') return b; try{ return JSON.parse(b); }catch(e){ return null; } };
const out=[];
$input.all().forEach((it,i)=>{
  const j=it.json||{}; const status=Number(j.statusCode)||0; const b=parse(j.body===undefined?j:j.body)||{};
  const state=String(b.state||'').toUpperCase(); const st=b.statistics||{};
  const total=Number(st.total)||0, found=Number(st.found)||0;
  out.push({ json:{ trackId:ids[i]||'', status:status, state:state, total:total, found:found, fetch:(status>=200&&status<300&&state==='DONE'&&found>0), raw:(status>=200&&status<300)?undefined:String(typeof j.body==='string'?j.body:JSON.stringify(j.body||{})).slice(0,200) } });
});
return out;
