const cw=$('Loop Over Clients').first().json;
const accounts=$('Prep Account Stat Calls').all().map(i=>i&&i.json).filter(Boolean);
let stats=[];
try{ stats=$('Account Stats').all().map(i=>i&&i.json).filter(Boolean); }catch(e){ stats=[]; }
let tagItems=[];
try{ tagItems=$('List Tags').all().map(i=>i&&i.json).filter(Boolean); }catch(e){ tagItems=[]; }
const tagMap={};
for(const t of tagItems){ if(t&&t._id) tagMap[t._id]=t.name||t._id; }
const num=(v)=>{ if(typeof v==='number') return v; const n=parseFloat(v); return isNaN(n)?0:n; };
if(!accounts.length) return [{ json: { _keepAlive:true } }];
return accounts.map((a,i)=>{
  const raw=stats[i]||{};
  const failed=!raw.header || raw.status>=400 || !!raw.error_name;
  const s=raw.header||{};
  const domain=(a.email.split('@')[1]||a.email).toLowerCase();
  const tagNames=(a.tagIds||[]).map(id=>tagMap[id]||id).join(', ');
  return { json: {
    'Inbox': a.email,
    'Account ID': a.accountId,
    'Client': [cw.clientRecId],
    'Domain': domain,
    'Status': a.status,
    'Warmup Status': a.warmup,
    'Provider': a.provider,
    'Daily Limit': a.dailyLimit,
    'Tags': tagNames,
    'Sent (All-Time)': failed?0:num(s.total_sent_count),
    'Replies (All-Time)': failed?0:num(s.total_reply_count),
    'OOO Replies (All-Time)': failed?0:num(s.total_ooo_reply_count),
    'Positive (All-Time)': failed?0:num(s.total_pos_reply_count),
    'Bounced (All-Time)': failed?0:num(s.total_bounce_count),
    'Warmup Health (7d)': (a.warmupHealth==null)?null:a.warmupHealth,
    'Miss Warmup Rate': (a.missWarmupRate==null)?null:a.missWarmupRate,
    'Bounce Rate (3d)': (a.bounceRate3d==null)?null:a.bounceRate3d,
    'Reply Rate (7d)': (a.replyRate7d==null)?null:a.replyRate7d,
    'Last Synced': $now.toISO(),
    _failed: failed
  } };
});