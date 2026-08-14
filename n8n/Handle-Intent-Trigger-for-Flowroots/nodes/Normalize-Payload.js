// CONFIG (Flowroots) — filled once the evergreen campaign + HeyReach credential are ready:
//   pv_workspace_id          = '6a27bb851bffeb09ca749fd9'  // Flowroots-own campaigns live here
//   pv_evergreen_campaign_id = 'TODO — author the standing intent-pitch campaign'
//   hr_dnc_list_id           = 'TODO — HeyReach "DNC for Flowroots" exclude list'
//   hr_evergreen_campaign_id = 'TODO'
//   slack_channel            = '#flowroots-intent'
const first = $input.first() ? $input.first().json : {};
const b = (first && first.body) ? first.body : first;
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