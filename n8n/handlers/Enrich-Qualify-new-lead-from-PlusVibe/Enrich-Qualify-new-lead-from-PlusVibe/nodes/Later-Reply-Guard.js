// Later-reply branch guard. Runs when Lead in CRM? found an existing prospect on a live
// (non-manual) run: the reply could be a genuinely new message, or the same message delivered
// twice through two webhooks (LEAD_MARKED_AS_INTERESTED and ALL_EMAIL_REPLIES both firing this
// URL). Compares the latest inbound message's reply time (same reply_at Format Thread produces)
// against the row's existing Last Engaged. Not strictly newer -> exit silently, no row, no wake.
let replyAt = ''; let thread = '';
try {
  const ft = $('Format Thread (Later)').first().json || {};
  replyAt = ft.reply_at || '';
  thread = ft.thread_context || '';
} catch (e) {}

let prospectId = ''; let currentStatus = ''; let lastEngaged = '';
try {
  const p = $('Find CRM Prospect').first().json || {};
  prospectId = p.id || '';
  const f = p.fields || {};
  currentStatus = f['OutreachStatus'] || '';
  lastEngaged = f['Last Engaged'] || '';
} catch (e) {}

const rD = replyAt ? new Date(replyAt) : null;
const lD = lastEngaged ? new Date(lastEngaged) : null;
const isNewer = !!(rD && !isNaN(rD.getTime()) && (!lD || isNaN(lD.getTime()) || rD.getTime() > lD.getTime()));

if (!isNewer) return [];

const statusAfter = (currentStatus === 'Lost') ? 'Positive Reply' : (currentStatus || 'Positive Reply');

return [{ json: {
  prospect_id: prospectId,
  reply_at: replyAt,
  thread_context: thread,
  current_status: currentStatus,
  status_after: statusAfter,
  should_wake: currentStatus !== 'Disqualified'
} }];
