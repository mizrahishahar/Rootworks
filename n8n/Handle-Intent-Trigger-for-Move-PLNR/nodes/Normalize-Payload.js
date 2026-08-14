const wh = $('Intent Webhook').first().json;
const b = (wh && wh.body) ? wh.body : wh;
const leads = Array.isArray(b.leads) ? b.leads : [b];
const nowIso = new Date().toISOString();
return leads.map((l) => {
  const email = String(l.email || '').trim();
  const name = l.name || [l.first_name, l.last_name].filter(Boolean).join(' ');
  return { json: {
    'Name': name,
    'first_name': l.first_name || '',
    'last_name': l.last_name || '',
    'LinkedIn URL': l.linkedin_url || '',
    'Domain': l.domain || '',
    'Company': l.company || '',
    'Email': email,
    'Event Type': l.event_type || '',
    'Target Campaign': l.target_campaign || '',
    'Signal Detail': l.signal_detail || '',
    'Channel': email ? 'Email' : 'LinkedIn',
    'Intent Status': 'NEW',
    'detected_at': nowIso
  } };
});