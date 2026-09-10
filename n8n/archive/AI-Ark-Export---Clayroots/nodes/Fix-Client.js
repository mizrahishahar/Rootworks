const log = { ...$('Build Log').first().json };
const items = $input.all();
const rec = items.length ? (items[0].json || {}) : {};
const clientId = (typeof rec.id === 'string' && rec.id.startsWith('rec')) ? rec.id : '';
if (clientId) { log.Client = [clientId]; } else { delete log.Client; }
if (!log['Execution ID']) { throw new Error('Fix Client: Build Log payload has no Execution ID. Log row not written.'); }
return [{ json: log }];