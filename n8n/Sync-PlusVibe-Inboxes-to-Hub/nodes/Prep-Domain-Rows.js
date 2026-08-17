const cw=$('Loop Over Clients').first().json;
const rows=$('Build Inbox Rows').all().map(i=>i&&i.json).filter(Boolean);
const domains=[...new Set(rows.filter(r=>r.Domain).map(r=>r.Domain))];
if(!domains.length) return [{ json: { _keepAlive:true } }];
return domains.map(d=>({ json: { 'Domain': d, 'Client': [cw.clientRecId], 'Last Synced': $now.toISO() } }));