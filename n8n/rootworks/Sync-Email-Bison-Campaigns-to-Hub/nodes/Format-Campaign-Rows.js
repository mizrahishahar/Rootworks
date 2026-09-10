// Format Campaign Rows: every page of GET /api/campaigns into Hub Campaigns rows, upserted on
// Campaign ID. Bison's list already carries the client-facing numbers. Field by field:
//   Leads = total_leads · Contacted = total_leads_contacted · Messages Sent = emails_sent
//   Replies = unique_replies · Positive Replies (PV) = interested (the sequencer's own count)
//   Bounced = bounced · Opens/Unique Opens = opened/unique_opens · Open Tracking = open_tracking
//   Completed = total_leads x completion_percentage (Bison has no finished-leads count)
//   Last Sent is not on Bison's list and stays blank.
const clientRecId=$('Parse Client').first().json.clientRecId||'';
const STATUS={ active:'ACTIVE', paused:'PAUSED', completed:'COMPLETED', draft:'DRAFT', archived:'STOPPED', stopped:'STOPPED' };
const raw=[];
for(const it of $input.all()){
  const j=it.json||{};
  const arr=Array.isArray(j)?j:(Array.isArray(j.data)?j.data:[]);
  for(const c of arr){ if(c&&c.id) raw.push(c); }
}
if(!raw.length) return [{ json: { _keepAlive:true } }];
const num=(v)=>{ const n=Number(v); return Number.isFinite(n)?n:0; };
return raw.map(c=>({ json: {
  'Campaign': c.name||String(c.id),
  'Campaign ID': String(c.id),
  'Client': clientRecId?[clientRecId]:[],
  'Sequencer':'Email Bison',
  'Channel':'Email',
  'Status': STATUS[String(c.status||'').toLowerCase()]||'',
  'Leads': num(c.total_leads),
  'Contacted': num(c.total_leads_contacted),
  'Completed': Math.round(num(c.total_leads)*num(c.completion_percentage)/100),
  'Messages Sent': num(c.emails_sent),
  'Replies': num(c.unique_replies),
  'Positive Replies (PV)': num(c.interested),
  'Bounced': num(c.bounced),
  'Opens': num(c.opened),
  'Unique Opens': num(c.unique_opens),
  'Open Tracking': !!c.open_tracking,
  'Last Sent': '',
  'Created': c.created_at||'',
  'Last Synced': $now.toISO()
}}));
