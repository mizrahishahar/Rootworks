const sd=$getWorkflowStaticData('global');
const ctx=sd.ctx||{};
const rows=(sd.openRows||[]).slice().sort((a,b)=>b.opens-a.opens);
const now=$now.toISO();
if(!rows.length) return [];
return rows.map(r=>({ json: {
 'Email': r.email,
 'Opens': r.opens,
 'Company': r.company,
 'Campaign': r.campaignRecId?[r.campaignRecId]:[],
 'Client': ctx.clientRecId?[ctx.clientRecId]:[],
 'Replied': r.replied,
 'Status': r.status,
 'MX': r.mx,
 'PV Lead ID': r.leadId,
 'Last Synced': now
}}));