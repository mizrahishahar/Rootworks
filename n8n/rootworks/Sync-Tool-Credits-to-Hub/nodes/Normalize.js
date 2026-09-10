// One row per tool. The balance is read from the provider's actual body by a per-tool rule;
// a body the rule cannot read lands in Last Error verbatim (truncated) and the row keeps its old balance.
const sd=$getWorkflowStaticData('global');
const prevMap=sd.prevCredits||{};
const now=$now;
const body=(name)=>{ try{ const r=$(name).first().json||{}; return { status:r.statusCode||0, body:(r.body!==undefined?r.body:r) }; }catch(e){ return { status:0, body:{ error:String(e&&e.message||e) } }; } };
const num=(v)=>{ const n=Number(v); return (v===undefined||v===null||v===''||!Number.isFinite(n))?null:n; };
const snip=(b)=>{ try{ return (typeof b==='string'?b:JSON.stringify(b)).slice(0,400); }catch(e){ return String(b).slice(0,400); } };
const RULES={
  'MillionVerifier':{ node:'Read MillionVerifier', endpoint:'GET api.millionverifier.com/api/v3/credits', unit:'verifications', read:(b)=>({ credits:num(b.credits) }) },
  'LeadMagic':{ node:'Read LeadMagic', endpoint:'GET api.leadmagic.io/v1/credits', unit:'credits', read:(b)=>({ credits:num(b.credits) }) },
  'Prospeo':{ node:'Read Prospeo', endpoint:'GET api.prospeo.io/account-information', unit:'credits', read:(b0)=>{ const b=(b0&&b0.response&&typeof b0.response==='object')?b0.response:b0; return { credits:num(b.remaining_credits), plan:b.current_plan||'', renews:b.next_quota_renewal_date?String(b.next_quota_renewal_date).slice(0,10):'' }; } },
  'BounceBan':{ node:'Read BounceBan', endpoint:'GET api.bounceban.com/v1/account', unit:'verifications', read:(b)=>({ credits:num(b.available_credits), note:(num(b.available_credits)===-1?'-1 = unlimited plan':'') }) },
  'Trykitt':{ node:'Read Trykitt', endpoint:'GET api.trykitt.ai/credit', unit:'credits', read:(b)=>{ const c=num(b.credits??b.credit??b.balance??b.remaining??b.remaining_credits); return { credits:c }; } },
  'Supersoniq':{ node:'Read Supersoniq', endpoint:'GET api.supersoniq.app/partner/v1/key-info', unit:'credits (1 = one full contact)', read:(b)=>({ credits:num(b.credit_balance), note:(b.daily_contacts_remaining!==undefined?('daily contacts remaining: '+b.daily_contacts_remaining):'') }) },
  'DiscoLike':{ node:'Read DiscoLike', endpoint:'GET api.discolike.com/v1/usage', unit:'USD available', read:(b)=>{ const u=b.usage||b; const avail=num(u.total_available_spend); const mtd=num(u.month_to_date_spend); return { credits:avail, plan:b.plan||'', note:(mtd!==null?('month-to-date spend: $'+mtd+(num(u.max_spend)!==null?' of $'+u.max_spend:'')):'')+(avail===null?' | API body carries no available-spend figure':'') }; } },
  'AI-Ark':{ node:'Read AI-Ark', endpoint:'GET api.ai-ark.com/api/developer-portal/v1/payments/credits', unit:'credits', read:(b)=>({ credits:num(b.total) }) },
  'Apify':{ node:'Read Apify', endpoint:'GET api.apify.com/v2/users/me/limits', unit:'USD left this cycle', read:(b)=>{ const d=b.data||b; const used=num(d.current&&d.current.monthlyUsageUsd); const max=num(d.limits&&d.limits.maxMonthlyUsageUsd); return { credits:(used!==null&&max!==null)?Math.round((max-used)*100)/100:null, note:(used!==null?('used $'+used+' of $'+max+' this cycle'):'') }; } },
};
const NO_API={ 'OpenAI':'no balance endpoint in the public API; read the usage page', 'Clay':'no balance endpoint; credits visible in the Clay app only' };
const out=[]; const failed=[]; const skipped=[];
for(const tool of Object.keys(RULES)){
  const r=RULES[tool]; const res=body(r.node); const b=(res.body&&typeof res.body==='object')?res.body:{};
  let got={}; try{ got=r.read(b)||{}; }catch(e){ got={}; }
  const prev=prevMap[tool]||{};
  const row={ 'Tool':tool, 'Unit':r.unit, 'Endpoint':r.endpoint };
  if(got.plan) row['Plan']=got.plan;
  if(got.renews) row['Renews']=got.renews;
  if(got.note) row['Note']=got.note;
  if(got.credits===null||got.credits===undefined||res.status>=400||res.status===0){
    failed.push(tool+': HTTP '+res.status+' '+snip(res.body));
    row['Last Error']='HTTP '+res.status+' at '+now.toISO()+': '+snip(res.body);
  } else {
    row['Credits']=got.credits;
    row['Checked At']=now.toISO();
    row['Last Error']='';
    if(prev.credits!==null&&prev.credits!==undefined&&prev.checkedAt){
      const hours=Math.max(1,(now.toMillis()-Date.parse(prev.checkedAt))/3600000);
      row['Previous Credits']=prev.credits;
      row['Daily Burn']=Math.round(((prev.credits-got.credits)/hours)*24*100)/100;
    }
  }
  out.push({ json: row });
}
for(const tool of Object.keys(NO_API)){ skipped.push(tool+': '+NO_API[tool]); out.push({ json:{ 'Tool':tool, 'Note':NO_API[tool], 'Endpoint':'' } }); }
sd.creditsRun={ attempted:Object.keys(RULES).length, failed, skipped };
return out;
