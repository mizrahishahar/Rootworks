const sd=$getWorkflowStaticData('global');
const cw=$('Loop Campaigns').first().json||{};
const pool=[];
for(const it of $input.all()){ const r=(it&&it.json)||{}; if(Array.isArray(r)){ pool.push(...r); } else if(Array.isArray(r.data)){ pool.push(...r.data); } else if(r.email!==undefined){ pool.push(r); } }
let opened=0, sent=0, notSent=0;
for(const l of pool){
  const st=String(l.status||'').toUpperCase();
  if(!((l.sent_step||0)>0 && st!=='SKIPPED')){ notSent++; continue; }
  sent++;
  const o=Number(l.opened_count||0);
  if(o>0){ opened++; sd.openRows.push({ leadId:String(l._id||l.id||''), email:String(l.email||''), company:String(l.company_name||''), opens:o, replied:Number(l.replied_count||0), status:st, mx:String(l.mx||''), campaignRecId:cw.campaignRecId||'' }); }
}
sd.campSummary.push({ campaign:cw.campaignName||'', leads:pool.length, sent, notSent, openers:opened });
return [{ json: { campaign: cw.campaignName||'', openers: opened } }];