const parse=(raw)=>{ try{ let s=raw; if(typeof s==='object'&&s.data)s=s.data; if(typeof s!=='string')s=JSON.stringify(s); const m=s.match(/data:\s*(\{[\s\S]*\})/); const rpc=JSON.parse(m?m[1]:s); const txt=rpc.result&&rpc.result.content&&rpc.result.content[0]&&rpc.result.content[0].text; return txt?(txt.startsWith('{')?JSON.parse(txt):txt):null; }catch(e){ return null; } };
const msgs=[];
for(const it of $input.all()){
  const r=parse(it.json);
  if(!r||typeof r!=='object') continue;
  const arr=r.linkedinMessages||r.emailMessages||[];
  for(const m of arr){ if(m&&m.id) msgs.push(m); }
}
const pr=$('Alta Thread Loop').first().json; const prf=pr.fields||pr;
const seen=new Set(); const uniq=[];
for(const m of msgs){ if(!seen.has(m.id)){ seen.add(m.id); uniq.push(m); } }
uniq.sort((a,b)=>new Date(a.happenedAt||a.createdAt||0)-new Date(b.happenedAt||b.createdAt||0));
const fmtTs=(ts)=>{const d=new Date(ts);if(isNaN(d.getTime()))return '';return d.toLocaleString('sv-SE',{timeZone:'Asia/Jerusalem'}).slice(0,16);};
const blocks=[]; const themTs=[]; const usTs=[];
for(const m of uniq){
  const txt=String(m.text||m.body||'').replace(/\s+/g,' ').trim().slice(0,400);
  if(txt.length<2) continue;
  const dir=(m.type==='received')?'THEM':'US';
  const t=m.happenedAt||m.createdAt||'';
  if(dir==='THEM'&&t)themTs.push(t); if(dir==='US'&&t)usTs.push(t);
  blocks.push('**['+fmtTs(t)+'] '+dir+':**\n'+txt);
}
let thread=blocks.join('\n\n');
if(thread.length>9000)thread=thread.slice(-9000);
const iso=(t)=>{const d=new Date(t);return isNaN(d.getTime())?'':d.toISOString();};
const firstThem=themTs.length?iso(themTs[0]):(prf['First Engagement']||'');
const lastThem=themTs.length?iso(themTs[themTs.length-1]):(prf['Last Engaged']||'');
const lastUs=usTs.length?iso(usTs[usTs.length-1]):(prf['Last Touch']||'');
const current=String(prf['Conversation Thread']||'').trim();
if(!thread||(thread.trim()===current && (!lastThem||prf['Last Engaged']) && (!lastUs||prf['Last Touch']))) return [{ json: { _skip:true } }];
const sd=$getWorkflowStaticData('global');
sd.altaThreads.updated++;
return [{ json: { prospectId: pr.id, 'Conversation Thread': thread, 'First Engagement': firstThem, 'Last Engaged': lastThem, 'Last Touch': lastUs } }];