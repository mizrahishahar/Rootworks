// Attach the resolved Client record link to the Build Log payload, then hand it to Log Run.
// The upsert payload is ALWAYS the Build Log fields; Resolve Client only contributes the link.
// When no client resolves, the Client key is DELETED (never emitted empty) so the upsert
// leaves the launch row's existing Client link untouched.
const log = { ...$('Build Log').first().json };
const items = $input.all();
const rec = items.length ? (items[0].json || {}) : {};
const clientId = (typeof rec.id === 'string' && rec.id.startsWith('rec')) ? rec.id : '';
if (clientId) { log.Client = [clientId]; } else { delete log.Client; }
if (!log['Execution ID']) { throw new Error('Fix Client: Build Log payload has no Execution ID. Log row not written.'); }
return [{ json: log }];