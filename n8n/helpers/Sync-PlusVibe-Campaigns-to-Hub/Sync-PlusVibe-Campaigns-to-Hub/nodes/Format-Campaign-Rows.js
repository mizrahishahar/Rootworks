const clientRecId=$('Parse Client').first().json.clientRecId||'';
const raw=[];
for(const it of $input.all()){
  const j=it.json||{};
  const arr=Array.isArray(j)?j:(Array.isArray(j.campaigns)?j.campaigns:(Array.isArray(j.data)?j.data:[j]));
  for(const c of arr){ if(c&&(c.id||c._id)) raw.push(c); }
}
if(!raw.length) return [{ json: { _keepAlive:true } }];
return raw.map(c=>({ json: {
  'Campaign': c.camp_name||c.id||c._id||'',
  'Campaign ID': c.id||c._id||'',
  'Client': clientRecId?[clientRecId]:[],
  'Sequencer':'PlusVibe',
  'Channel':'Email',
  'Status': c.status||'',
  'Leads': c.lead_count||0,
  'Contacted': c.lead_contacted_count||0,
  'Completed': c.completed_lead_count||0,
  'Messages Sent': c.sent_count||0,
  'Replies': c.replied_count||0,
  'Positive Replies (PV)': c.positive_reply_count||0,
  'Bounced': c.bounced_count||0,
  'Opens': c.opened_count||0,
  'Unique Opens': c.unique_opened_count||0,
  'Open Tracking': !!c.is_emailopened_tracking,
  'Last Sent': c.last_lead_sent||'',
  'Created': c.created_at||'',
  'Last Synced': $now.toISO()
}}));