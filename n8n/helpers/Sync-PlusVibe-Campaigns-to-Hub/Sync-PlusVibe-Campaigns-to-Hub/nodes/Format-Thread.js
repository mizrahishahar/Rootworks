const items=$input.all();
const pl=$('Prep Lookup').first().json;
const leadEmail=(pl.lead_email||'').toLowerCase();
const sd=$getWorkflowStaticData('global');
sd.threadStats.checked++;
const prf=($('Loop Prospects').first().json.fields||{});
if(!leadEmail){ sd.threadStats.problems.push((pl.prospectName||pl.prospectId)+': contact fetch returned no email'); return [{ json: { prospectId: pl.prospectId, _skip:true } }]; }
if(!pl.pvWorkspace){ sd.threadStats.problems.push((pl.prospectName||pl.prospectId)+': client has no PV workspace'); return [{ json: { prospectId: pl.prospectId, _skip:true } }]; }
let rateLimited=false;
const pool=[];
for(const it of items){ const r=(it&&it.json)||{}; const arr=r.data||r.emails; if(Array.isArray(arr)){ pool.push(...arr); } else { const s=JSON.stringify(r).slice(0,600); if(s.includes('1015')||s.toLowerCase().includes('rate limit')) rateLimited=true; } }
if(rateLimited){ sd.threadStats.problems.push((pl.prospectName||pl.prospectId)+': PV rate limited, retries next run'); }
const emails=pool.filter(m=>String(m.lead||'').toLowerCase()===leadEmail);
const seen=new Set(); const uniq=[];
for(const m of emails){ const k=m.message_id||m.id||JSON.stringify([m.sent_on,m.subject]); if(!seen.has(k)){ seen.add(k); uniq.push(m); } }
if(!uniq.length) return [{ json: { prospectId: pl.prospectId, _skip:true } }];
const fmtTs=(ts)=>{const d=new Date(ts);if(isNaN(d.getTime()))return '';return d.toLocaleString('sv-SE',{timeZone:'Asia/Jerusalem'}).slice(0,16)+' IL';};
const rawBody=(m)=>{if(typeof m.text_body==='string'&&m.text_body.trim())return m.text_body;let h='';if(m.body&&typeof m.body==='object')h=(typeof m.body.text==='string'&&m.body.text.trim())?m.body.text:(m.body.html||'');else if(typeof m.body==='string')h=m.body;else h=m.snippet||'';h=h.replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<br\s*\/?>/gi,'\n').replace(/<\/(?:p|div|tr|li|h[1-6])>/gi,'\n\n').replace(/<[^>]*>/g,' ');return h;};
const clean=(t)=>{
if(!t)return '';
let s=String(t).replace(/\r\n?/g,'\n');
s=s.replace(/(?:\n|^)[ \t]*-{3,}\s*Original Message\s*-{3,}[\s\S]*$/i,'');
s=s.replace(/(?:\n|^)[ \t]*_{10,}[\s\S]*$/,'');
s=s.replace(/(?:\n|\s)On\s+\S[\s\S]{0,170}?wrote:[\s\S]*$/i,'');
s=s.replace(/\n\s*>[\s\S]*$/,'');
s=s.replace(/(?:\n|^)From:\s[\s\S]*$/i,'');
s=s.replace(/(?:\n|^)[ \t]*Sent from my [^\n]*[\s\S]*$/i,'');
s=s.replace(/[a-z]+\\?:\s*\{behavior:url\([^)]*\)[^}]*\}/gi,'');
s=s.replace(/[.#]?[a-z][\w-]*\s*\{[^}]*\}/gi,'');
s=s.replace(/&nbsp;/gi,' ').replace(/&[a-z#0-9]+;/gi,' ');
const SIGOFF=/^(?:thanks|thank you|thanks so much|many thanks|regards|best regards|kind regards|warm regards|best|cheers|sincerely|all the best|talk soon|speak soon)[,!.]*$/i;
const TITLE=/\b(?:ceo|cto|coo|cfo|cmo|cro|cpo|vp|svp|evp|president|founder|co-?founder|director|manager|head of|partner|principal|engineer|consultant|advisor|owner|officer|chief)\b/i;
const URLISH=/(?:https?:\/\/|www\.|\b[a-z0-9-]+\.(?:com|net|org|io|ai|co|dev|app)\b)/i;
const lines=s.split('\n');
const looksSig=(i)=>{let score=0;let shorts=0;for(let j=i+1;j<Math.min(lines.length,i+7);j++){const L=lines[j].trim();if(!L)continue;const dg=L.replace(/\D/g,'').length;if(dg>=9&&dg<=15&&/[\d)]/.test(L))score+=2;if(URLISH.test(L))score+=2;if(TITLE.test(L))score+=2;if(L.length<=40)shorts++;}if(shorts>=2)score+=2;return score>=2;};
let cut=-1;
for(let i=0;i<lines.length;i++){const L=lines[i].trim();if(/^--\s*$/.test(L)){cut=i;break;}if(SIGOFF.test(L)&&looksSig(i)){cut=i;break;}}
if(cut>0)s=lines.slice(0,cut).join('\n');
s=s.split('\n').map(x=>x.replace(/[^\S\n]+/g,' ').trim()).join('\n');
s=s.replace(/\n{3,}/g,'\n\n');
return s.trim();
};
const fromOf=(m)=>{if(typeof m.from==='string')return m.from;if(Array.isArray(m.from_address_json)&&m.from_address_json[0])return m.from_address_json[0].address||'';return m.from_address_email||m.from_email||'';};
const isIn=(m)=>{if(m.current_step!=null)return false;const d=String(m.direction||'').toUpperCase();if(d==='IN')return true;if(d==='OUT')return false;return fromOf(m).toLowerCase().includes(leadEmail);};
const tsOf=(m)=>m.sent_on||m.timestamp_created||m.created_at||'';
const sorted=uniq.sort((a,b)=>new Date(tsOf(a))-new Date(tsOf(b)));
const blocks=[]; const themTs=[]; const usTs=[];
for(const m of sorted){
  const body=clean(rawBody(m));
  if(body.length<2) continue;
  const dir=isIn(m)?'THEM':'US';
  const t=tsOf(m);
  if(dir==='THEM'&&t)themTs.push(t); if(dir==='US'&&t)usTs.push(t);
  blocks.push('**['+fmtTs(t)+'] '+dir+':**\n'+body);
}
let thread_context=blocks.join('\n\n');
if(thread_context.length>50000)thread_context=thread_context.slice(-50000);
if(!thread_context) return [{ json: { prospectId: pl.prospectId, _skip:true } }];
const iso=(t)=>{const d=new Date(t);return isNaN(d.getTime())?'':d.toISOString();};
const firstThem=themTs.length?iso(themTs[0]):(prf['First Engagement']||'');
const lastThem=themTs.length?iso(themTs[themTs.length-1]):(prf['Last Engaged']||'');
const lastUs=usTs.length?iso(usTs[usTs.length-1]):(prf['Last Touch']||'');
const current=''+(prf['Conversation Thread']||'');
if(thread_context.trim()===current.trim() && (!lastThem||prf['Last Engaged']) && (!lastUs||prf['Last Touch'])) return [{ json: { prospectId: pl.prospectId, _skip:true } }];
sd.threadStats.updated++;
return [{ json: { prospectId: pl.prospectId, 'Conversation Thread': thread_context, 'First Engagement': firstThem, 'Last Engaged': lastThem, 'Last Touch': lastUs } }];