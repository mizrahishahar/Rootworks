// Format Thread: Bison's two reads into the one timeline the qualifier and the CRM expect, the same
// output keys as the PlusVibe intake (thread_context, reply_text, last_two, reply_at,
// sent_emails_text, signature_phone, signature_phone_tollfree). Sources, recognised by shape:
//   sent-emails       data[] of {email_subject, email_body, sent_at}            -> US
//   conversation      data.current_reply + older_messages[] + newer_messages[] -> by from address
//   replies list      data[] of reply objects                                  -> by from address
// The reply body quotes our original under "-----Original Message-----"; clean() cuts that off.
const items=$input.all();
const leadEmail=String(($('Normalize').first().json||{}).lead_email||'').toLowerCase();
const pool=[];
const seen=new Set();
const push=(m)=>{ if(!m||!m.id||seen.has(m.id)) return; seen.add(m.id); pool.push(m); };
const fromReply=(r)=>{ if(!r||typeof r!=='object') return null; const from=String(r.from_email_address||'').toLowerCase(); const dir=(from&&from.includes(leadEmail))?'THEM':'US'; return { id:'r'+(r.id||r.uuid||''), dir, ts:r.date_received||r.created_at||'', subject:r.subject||'', body:(typeof r.text_body==='string'&&r.text_body.trim())?r.text_body:(r.html_body||''), automated:!!r.automated_reply }; };
const fromSent=(s)=>{ if(!s||typeof s!=='object') return null; return { id:'s'+(s.id||''), dir:'US', ts:s.sent_at||s.scheduled_date||'', subject:s.email_subject||'', body:s.email_body||'', automated:false }; };
const isSent=(x)=>x&&typeof x==='object'&&('email_body' in x||'email_subject' in x)&&!('from_email_address' in x);
for(const it of items){
  const r=(it&&it.json)||{};
  const d=r.data!==undefined?r.data:r;
  if(d&&typeof d==='object'&&!Array.isArray(d)&&d.current_reply){
    push(fromReply(d.current_reply));
    for(const m of (d.older_messages||[])) push(isSent(m)?fromSent(m):fromReply(m));
    for(const m of (d.newer_messages||[])) push(isSent(m)?fromSent(m):fromReply(m));
  } else if(Array.isArray(d)){
    for(const m of d) push(isSent(m)?fromSent(m):fromReply(m));
  }
}
const fmtTs=(ts)=>{const d=new Date(ts);if(isNaN(d.getTime()))return '';return d.toLocaleString('sv-SE',{timeZone:'Asia/Jerusalem'}).slice(0,16)+' IL';};
const rawBody=(m)=>{ let h=String(m.body||''); if(/<[a-z][\s\S]*>/i.test(h)){ h=h.replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<br\s*\/?>/gi,'\n').replace(/<\/(?:p|div|tr|li|h[1-6])>/gi,'\n\n').replace(/<[^>]*>/g,' '); } return h; };
const clean=(t)=>{
if(!t)return '';
let s=String(t).replace(/\r\n?/g,'\n');
s=s.replace(/(?:\n|^)[ \t]*-{3,}\s*Original Message\s*-{3,}[\s\S]*$/i,'');
s=s.replace(/(?:\n|^)[ \t]*_{10,}[\s\S]*$/,'');
s=s.replace(/(?:\n|\s)On\s+\S[\s\S]{0,170}?wrote:[\s\S]*$/i,'');
s=s.replace(/\n\s*>[\s\S]*$/,'');
s=s.replace(/(?:\n|^)From:\s[\s\S]*$/i,'');
s=s.replace(/(?:\n|^)[ \t]*Sent from my [^\n]*[\s\S]*$/i,'');
s=s.replace(/\[You don't often get email from[^\]]*\]/gi,'');
s=s.replace(/⚠ EXTERNAL EMAIL:[^\n]*/gi,'');
s=s.replace(/[a-z]+\\?:\s*\{behavior:url\([^)]*\)[^}]*\}/gi,'');
s=s.replace(/[.#]?[a-z][\w-]*\s*\{[^}]*\}/gi,'');
s=s.replace(/&nbsp;/gi,' ').replace(/&[a-z#0-9]+;/gi,' ');
const SIGOFF=/^(?:thanks|thank you|thanks so much|many thanks|regards|best regards|kind regards|warm regards|best|cheers|sincerely|all the best|talk soon|speak soon|תודה|בברכה|בכבוד רב)[,!.]*$/i;
const TITLE=/\b(?:ceo|cto|coo|cfo|cmo|cro|cpo|vp|svp|evp|president|founder|co-?founder|director|manager|head of|partner|principal|engineer|consultant|advisor|owner|officer|chief)\b/i;
const URLISH=/(?:https?:\/\/|www\.|\b[a-z0-9-]+\.(?:com|net|org|io|ai|co|dev|app|il)\b)/i;
const lines=s.split('\n');
const looksSig=(i)=>{let score=0;let shorts=0;for(let j=i+1;j<Math.min(lines.length,i+7);j++){const L=lines[j].trim();if(!L)continue;const dg=L.replace(/\D/g,'').length;if(dg>=9&&dg<=15&&/[\d)]/.test(L))score+=2;if(URLISH.test(L))score+=2;if(TITLE.test(L))score+=2;if(L.length<=40)shorts++;}if(shorts>=2)score+=2;return score>=2;};
let cut=-1;
for(let i=0;i<lines.length;i++){const L=lines[i].trim();if(/^--\s*$/.test(L)){cut=i;break;}if(SIGOFF.test(L)&&looksSig(i)){cut=i;break;}}
if(cut>0)s=lines.slice(0,cut).join('\n');
s=s.split('\n').map(x=>x.replace(/[^\S\n]+/g,' ').trim()).join('\n');
s=s.replace(/\n{3,}/g,'\n\n');
return s.trim();
};
const tsOf=(m)=>m.ts||'';
const sorted=pool.sort((a,b)=>new Date(tsOf(a))-new Date(tsOf(b)));
const isIn=(m)=>m.dir==='THEM';
const blocks=[];
for(const m of sorted){
  const body=clean(rawBody(m));
  if(body.length<2) continue;
  blocks.push('**['+fmtTs(m.ts)+'] '+m.dir+':**\n'+body);
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
const SIGSTART=/^(?:--\s*|(?:thanks|thank you|thanks so much|many thanks|regards|best regards|kind regards|warm regards|best|cheers|sincerely|all the best|talk soon|speak soon|תודה|בברכה|בכבוד רב)[,!.]*\s*)$/i;
const sigRegion=(raw)=>{ const L=String(raw||'').split('\n'); for(let i=0;i<L.length;i++){ if(SIGSTART.test(L[i].trim())) return L.slice(i).join('\n'); } return L.slice(Math.max(0,L.length-8)).join('\n'); };
const grabPhones=(txt)=>{ const out=[]; const re=/(?:\+?\d{1,3}[\t .\-]?)?(?:\(?\d{2,4}\)?[\t .\-]?){2,4}\d{2,4}/g; let mm; while((mm=re.exec(String(txt||'')))!==null){ const raw=mm[0].trim(); const dg=raw.replace(/\D/g,''); if(dg.length>=9&&dg.length<=15) out.push({raw:raw,dg:dg}); } return out; };
const isTollFree=(dg)=>{ let x=String(dg||''); if(x.length===11&&x.charAt(0)==='1') x=x.slice(1); return x.length===10&&/^(?:800|833|844|855|866|877|888)/.test(x); };
const toE164=(raw,dg)=>{ const t=String(raw).trim(); if(t.charAt(0)==='+') return '+'+dg; if(dg.length===11&&dg.charAt(0)==='1') return '+'+dg; if(dg.length===12&&dg.slice(0,3)==='972') return '+'+dg; if(dg.length===10&&dg.charAt(0)==='0') return '+972'+dg.slice(1); if(dg.length===10&&dg.charAt(0)!=='0') return '+1'+dg; return t; };
const allCand=grabPhones(rawInbound);
const cands=(allCand.length===1)?allCand:grabPhones(sigRegion(rawInbound));
let signature_phone=''; let signature_phone_tollfree='';
for(const c of cands){ if(isTollFree(c.dg)){ if(!signature_phone_tollfree) signature_phone_tollfree=toE164(c.raw,c.dg); } else { if(!signature_phone) signature_phone=toE164(c.raw,c.dg); } }
const lastOut=[...sorted].reverse().find(m=>!isIn(m));
const last_two=(lastOut?'US: '+clean(rawBody(lastOut)).slice(0,1500)+'\n\n':'')+'THEM: '+reply_text;
const sentPre=sorted.filter(m=>!isIn(m)&&(!reply_at||!tsOf(m)||new Date(tsOf(m))<=new Date(reply_at)));
const sentBlocks=[];
for(const m of sentPre){ const body=clean(rawBody(m)); if(body.length<2) continue; const subj=String(m.subject||'').trim(); sentBlocks.push('['+fmtTs(tsOf(m))+']'+(subj?' Subject: '+subj:'')+'\n'+body); }
let sent_emails_text=sentBlocks.join('\n\n');
if(sent_emails_text.length>8000)sent_emails_text=sent_emails_text.slice(0,8000);
return [{ json: { thread_context, reply_text, last_two, reply_at, sent_emails_text, signature_phone, signature_phone_tollfree, messages: sorted.length } }];
