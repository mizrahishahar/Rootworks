const p=$input.first().json||{};
const f=p.fields||p;
const n=$('Alta Normalize').item.json||{};
const b=$('Capture Payload').first().json.body||{};
const prev=String(f['Conversation Thread']||'').trim();
const fmtTs=(ts)=>{const d=new Date(ts);if(isNaN(d.getTime()))return '';return d.toLocaleString('sv-SE',{timeZone:'Asia/Jerusalem'}).slice(0,16)+' IL';};
const line='**['+fmtTs(n.first_engagement)+'] THEM:**\n'+(n.reply_text||'');
let campaignRowId='';
try{ campaignRowId=$('Resolve Campaign').first().json.campaignRowId||''; }catch(e){}
const existing=Array.isArray(f.Campaigns)?f.Campaigns:[];
const campaigns=existing.length?existing:(campaignRowId?[campaignRowId]:[]);
return [{ json: { prospectId:p.id, thread:(prev?prev+'\n\n':'')+line, campaigns, lastEngaged:n.first_engagement||new Date().toISOString(), altaProspectId:n.alta_prospect_id||f['Alta Prospect ID']||'', altaMsgId:(b.reply&&b.reply.messageId)||f['Alta Msg ID']||'' } }];