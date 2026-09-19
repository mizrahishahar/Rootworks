// Later Reply Guard: fires only when Lead in CRM? found the prospect already in the CRM on a live
// run — he wrote again after the first positive reply. Compares his latest message time (Format
// Thread (Later)'s reply_at) against the row's own Last Engaged; the same message can be delivered
// twice through two webhook events (lead_interested then lead_replied, or two lead_replied
// deliveries on retry), so anything not strictly newer is a duplicate and exits silently here: no
// items out, so Update Prospect Reply, the wake and Build Run Log never run.
const prospect = $('Find CRM Prospect').first().json || {};
const fields = prospect.fields || prospect;
const prospectId = prospect.id || '';
const lastEngaged = fields['Last Engaged'] || '';
const ft = $input.first().json || {};
const replyAt = ft.reply_at || '';
if (!prospectId || !replyAt) return [];
const prevTs = lastEngaged ? new Date(lastEngaged).getTime() : 0;
const newTs = new Date(replyAt).getTime();
if (isNaN(newTs) || (prevTs && !isNaN(prevTs) && newTs <= prevTs)) return [];
const out = {
  id: prospectId,
  'Conversation Thread': ft.thread_context || '',
  'Last Engaged': replyAt,
  'Follow-ups': 0,
  'NextTouchDate': null
};
const currentStatus = String(fields['OutreachStatus'] || '');
if (currentStatus === 'Lost') out['OutreachStatus'] = 'Positive Reply';
return [{ json: out }];
