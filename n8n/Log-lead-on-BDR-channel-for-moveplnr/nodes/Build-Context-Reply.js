const P=$('Payload').first().json||{};
const conv=(s)=>String(s||'').replace(/\*\*/g,'*');
let text=conv(P.thread_text||'').trim();
if(!text){ const sent=conv(P.sent_emails_text||'').trim(); const reply=conv(P.reply_text||'').trim(); text=[sent,reply].filter(Boolean).join('\n\n'); }
if(text.length>3900){ const head='…(earlier messages trimmed)\n'; text=head+text.slice(-(3900-head.length)); }
let ts='';
try{ const s=$('Slack BDR').first().json||{}; ts=s.ts||s.message_timestamp||((s.message||{}).ts)||''; }catch(e){}
return [{ json: { context_text: text, has_context: !!(text&&ts), card_ts: ts } }];