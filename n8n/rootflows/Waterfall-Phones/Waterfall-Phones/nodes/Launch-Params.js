// One-off on-demand launch: the webhook carries only the Automations row id,
// and the row carries the Contact to look up. Nothing else is read.
const rec = $('Fetch Launch Record').first().json;
const f = rec.fields || {};
const linkId = (v) => { if (Array.isArray(v) && v.length) return String(v[0] && v[0].id ? v[0].id : v[0]); return ''; };
const contactId = linkId(f.Contact);
// Client is required: it is what attaches the run to a client in the run log, and
// a phone lookup always belongs to someone's pipeline.
const clientId = linkId(f.Client);
const missing = [];
if (!contactId) missing.push('Contact');
if (!clientId) missing.push('Client');
return [{ json: {
  contactId,
  clientId,
  _launchRecordId: rec.id,
  startedAt: new Date().toISOString(),
  _invalid: missing.length > 0,
  _error: missing.length ? ('launch row is missing ' + missing.join(' and ')) : '',
} }];
