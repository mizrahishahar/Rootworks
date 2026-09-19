// Strips Later Reply Guard's helper fields down to exactly the keys Update Prospect Reply
// writes. autoMapInputData sends every key on this item as an Airtable field, so a key that
// should not be touched (OutreachStatus, when current status isn't 'Lost') must be absent here,
// never present with an empty value, or the write would clear it.
const g = $input.first().json || {};
const out = {
  id: g.prospect_id || '',
  'Conversation Thread': g.thread_context || '',
  'Last Engaged': g.reply_at || '',
  'Follow-ups': 0,
  'NextTouchDate': null
};
if (g.current_status === 'Lost') out['OutreachStatus'] = 'Positive Reply';
return [{ json: out }];
