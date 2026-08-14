const f = $('Re-read Record').item.json.fields || {};
const email = (f['Final Email'] || f['Email'] || '').trim();
const pv = $('PV Lookup').item.json || {};
const pvStatus = String((pv.lead && pv.lead.status) || (pv.lead_data && pv.lead_data.status) || pv.status || '').toLowerCase();
const DNC = ['unsubscribed','blocklisted','bounced','do_not_contact','optout','opted_out'];
const ACTIVE = ['replied','interested','meeting','booked','responded','positive'];
const isDnc = DNC.some((s) => pvStatus.includes(s));
const isActive = ACTIVE.some((s) => pvStatus.includes(s));
const decision = isDnc ? 'DNC' : (isActive ? 'HELD' : 'ROUTE');
return [{ json: {
  recordId: $('Insert to Intent Table').item.json.id,
  decision,
  channel: email ? 'Email' : 'LinkedIn',
  email,
  name: f['Name'] || '',
  first_name: f['first_name'] || '',
  last_name: f['last_name'] || '',
  company: f['Company'] || '',
  domain: f['Domain'] || '',
  linkedin_url: f['LinkedIn URL'] || '',
  event_type: f['Event Type'] || '',
  signal_detail: f['Signal Detail'] || ''
} }];