// Prep Thread URLs: the two reads that make the conversation. Live: the reply's conversation
// thread (current reply plus older and newer messages). Manual: the lead's replies list, since no
// reply id came in. Both: the lead's sent emails, which is our side of the exchange. One item per
// URL; Bison Get Thread runs once per item and Format Thread merges whatever came back.
const n=$('Normalize').first().json||{};
const B='https://send.nochileads.com/api';
const out=[];
if(n.reply_id) out.push({ json:{ bisonUrl:B+'/replies/'+n.reply_id+'/conversation-thread', kind:'thread' } });
else if(n.lead_id) out.push({ json:{ bisonUrl:B+'/leads/'+n.lead_id+'/replies', kind:'replies' } });
if(n.lead_id) out.push({ json:{ bisonUrl:B+'/leads/'+n.lead_id+'/sent-emails', kind:'sent' } });
if(!out.length) out.push({ json:{ bisonUrl:B+'/leads?search='+encodeURIComponent(n.lead_email||''), kind:'none' } });
return out;
