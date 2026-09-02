// Build Client Vars: the strings the Drive and Slack legs are built from, all derived from the
// one client name on the launch row, plus the contact emails the Shared folder is shared with.
// Kept as its own node because every Drive and Slack parameter downstream reads it by name.
const p = $('Launch Params').first().json || {};
const clientName = p.clientName || 'Unknown Client';
const slug = clientName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const channelName = slug + '-private';
// The Contacts search: one item per contact, or one empty placeholder item when the launch row
// named nobody. An address only counts once.
const emails = [];
for (const item of $input.all()) {
  const j = item.json || {};
  const e = j.email || (j.fields && j.fields.email) || '';
  if (e && emails.indexOf(e) < 0) emails.push(e);
}
const sections = ['Offer & info source', 'Infrastructure', 'List building', 'Outreach', 'Sequencer', 'Copy', 'Scheduler', 'Inbox management', 'Automations', 'Communication'];
const overrides = '# Overrides - ' + clientName + '\n\n' + sections.map((s) => '## ' + s).join('\n\n') + '\n';
return [{ json: { clientName, slug, channelName, emails, overrides, extras: p.extras || [], base: p.base || '' } }];
