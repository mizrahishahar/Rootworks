const parse=(raw)=>{ try{ let s=raw; if(typeof s==='object'&&s.data)s=s.data; if(typeof s!=='string')s=JSON.stringify(s); const m=s.match(/data:\s*(\{[\s\S]*\})/); const rpc=JSON.parse(m?m[1]:s); const txt=rpc.result&&rpc.result.content&&rpc.result.content[0]&&rpc.result.content[0].text; return txt?(txt.startsWith('{')?JSON.parse(txt):txt):null; }catch(e){ return null; } };
const msgs=[];
for(const it of $input.all()){
  const r=parse(it.json);
  if(!r||typeof r!=='object') continue;
  const arr=r.linkedinMessages||r.emailMessages||[];
  for(const m of arr){ if(m&&m.id) msgs.push(m); }
}
const pr=$('Alta Loop').first().json; const prf=pr.fields||pr;
const seen=new Set(); const uniq=[];
for(const m of msgs){ if(!seen.has(m.id)){ seen.add(m.id); uniq.push(m); } }
uniq.sort((a,b)=>new Date(a.happenedAt||a.createdAt||0)-new Date(b.happenedAt||b.createdAt||0));
const lines=uniq.map(m=>{ const dt=String(m.happenedAt||m.createdAt||'').slice(0,10); const dir=(m.type==='received')?'THEM':'US'; const txt=String(m.text||m.body||'').replace(/\s+/g,' ').trim().slice(0,260); return '['+dt+'] '+dir+': '+txt; }).filter(l=>l.replace(/\[.*?\] (THEM|US): /,'').length>1);
let thread=lines.join('\n\n');
if(thread.length>6000)thread=thread.slice(-6000);
const current=String(prf['Conversation Thread']||'').trim();
if(!thread||thread===current) return [{ json: { _skip:true } }];
const sd=$getWorkflowStaticData('global');
sd.altaThreads.updated++;
return [{ json: { prospectId: pr.id, 'Conversation Thread': thread } }];