const items=$input.all();
const leadEmail=($('Normalize').first().json.lead_email||'').toLowerCase();
const pool=[];
for(const it of items){ const r=(it&&it.json)||{}; const arr=r.data||r.emails||[]; if(Array.isArray(arr)) pool.push(...arr); }
const matched=pool.filter(m=>String(m.lead||'').toLowerCase()===leadEmail);
const use=matched.length?matched:pool;
const seen=new Set(); const uniq=[];
for(const m of use){ const k=m.message_id||m.id||JSON.stringify([m.sent_on,m.subject]); if(!seen.has(k)){ seen.add(k); uniq.push(m); } }
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
const isIn=(m)=>{if(m.current_step!==undefined)return false;const d=String(m.direction||'').toUpperCase();if(d==='IN')return true;if(d==='OUT')return false;return fromOf(m).toLowerCase().includes(leadEmail);};
const tsOf=(m)=>m.sent_on||m.timestamp_created||m.created_at||'';
const sorted=uniq.sort((a,b)=>new Date(tsOf(a))-new Date(tsOf(b)));
const blocks=[];
for(const m of sorted){
  const body=clean(rawBody(m));
  if(body.length<2) continue;
  const dir=isIn(m)?'THEM':'US';
  const t=tsOf(m);
  blocks.push('**['+fmtTs(t)+'] '+dir+':**\n'+body);
}
let thread_context=blocks.join('\n\n');
if(thread_context.length>50000)thread_context=thread_context.slice(-50000);
if(!thread_context)thread_context='No prior thread found.';
const inbound=sorted.filter(isIn);
const reply_text=inbound.length?clean(rawBody(inbound[inbound.length-1])).slice(0,2000):'';
const lastIn=inbound.length?inbound[inbound.length-1]:null;
let reply_at='';
if(lastIn){ const t=tsOf(lastIn); const d=new Date(t); if(t && !isNaN(d.getTime())) reply_at=d.toISOString(); }
const rawInbound=lastIn?String(rawBody(lastIn)||'').replace(/\r\n?/g,'\n'):'';
const SIGSTART=/^(?:--\s*|(?:thanks|thank you|thanks so much|many thanks|regards|best regards|kind regards|warm regards|best|cheers|sincerely|all the best|talk soon|speak soon)[,!.]*\s*)$/i;
const sigRegion=(raw)=>{ const L=String(raw||'').split('\n'); for(let i=0;i<L.length;i++){ if(SIGSTART.test(L[i].trim())) return L.slice(i).join('\n'); } return L.slice(Math.max(0,L.length-8)).join('\n'); };
const grabPhones=(txt)=>{ const out=[]; const re=/(?:\+?\d{1,3}[\t .\-]?)?(?:\(?\d{2,4}\)?[\t .\-]?){2,4}\d{2,4}/g; let mm; while((mm=re.exec(String(txt||'')))!==null){ const raw=mm[0].trim(); const dg=raw.replace(/\D/g,''); if(dg.length>=9&&dg.length<=15) out.push({raw:raw,dg:dg}); } return out; };
const isTollFree=(dg)=>{ let x=String(dg||''); if(x.length===11&&x.charAt(0)==='1') x=x.slice(1); return x.length===10&&/^(?:800|833|844|855|866|877|888)/.test(x); };
const toE164=(raw,dg)=>{ const t=String(raw).trim(); if(t.charAt(0)==='+') return '+'+dg; if(dg.length===11&&dg.charAt(0)==='1') return '+'+dg; if(dg.length===10&&dg.charAt(0)!=='0') return '+1'+dg; return t; };
const allCand=grabPhones(rawInbound);
const cands=(allCand.length===1)?allCand:grabPhones(sigRegion(rawInbound));
let signature_phone=''; let signature_phone_tollfree='';
for(const c of cands){ if(isTollFree(c.dg)){ if(!signature_phone_tollfree) signature_phone_tollfree=toE164(c.raw,c.dg); } else { if(!signature_phone) signature_phone=toE164(c.raw,c.dg); } }
const lastOut=[...sorted].reverse().find(m=>!isIn(m));
const last_two=(lastOut?'US: '+clean(rawBody(lastOut)).slice(0,1500)+'\n\n':'')+'THEM: '+reply_text;
const sentPre=sorted.filter(m=>!isIn(m)&&(!reply_at||!tsOf(m)||new Date(tsOf(m))<=new Date(reply_at)));
const sentBlocks=[];
for(const m of sentPre){ const body=clean(rawBody(m)); if(body.length<2) continue; const subj=String(m.subject||m.email_subject||'').trim(); sentBlocks.push('['+fmtTs(tsOf(m))+']'+(subj?' Subject: '+subj:'')+'\n'+body); }
let sent_emails_text=sentBlocks.join('\n\n');
if(sent_emails_text.length>8000)sent_emails_text=sent_emails_text.slice(0,8000);
return [{ json: { thread_context, reply_text, last_two, reply_at, sent_emails_text, signature_phone, signature_phone_tollfree } }];