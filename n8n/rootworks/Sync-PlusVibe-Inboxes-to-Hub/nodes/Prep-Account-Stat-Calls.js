const cw=$('Loop Over Clients').first().json;
const pages=$('List Email Accounts').all().map(i=>i&&i.json).filter(j=>j&&typeof j==='object');
const accounts=[];
for(const p of pages){ if(Array.isArray(p.accounts)) accounts.push(...p.accounts); }
return accounts.map(a=>{
  const payload=a.payload||{};
  const hs=(payload.analytics&&payload.analytics.health_scores)||{};
  const rr=(payload.analytics&&payload.analytics.reply_rates)||{};
  const created=String(a.timestamp_created||'').slice(0,10) || '2020-01-01';
  return { json: {
    email:a.email||'', accountId:a.id||'', status:a.status||'', warmup:a.warmup_status||'', provider:a.provider||'',
    dailyLimit:payload.daily_limit||0, warmupHealth:hs['7d_overall_warmup_health'], missWarmupRate:hs['1d_miss_warmup_rate'], bounceRate3d:hs['3d_bounce_rate'], replyRate7d:rr['7d_replyrate'],
    tagIds: Array.isArray(payload.tags)?payload.tags:[],
    url:'https://api.plusvibe.ai/api/v1/account/email-stats?workspace_id='+cw.pvWorkspace+'&email_acc_id='+a.id+'&start_date='+created+'&end_date='+cw.today
  } };
});