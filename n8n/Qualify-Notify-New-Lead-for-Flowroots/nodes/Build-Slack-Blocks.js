const N = $('Normalize').first().json;
const recId = ($('Create CRM Prospect').first().json && $('Create CRM Prospect').first().json.id) || '';
const url = 'https://airtable.com/appQG6dK0FIOhTxOl/tblEPFCO0kJn2tMyK/' + recId;
const reply = ($('Format Thread').first().json.reply_text || '(none captured)');
const who = ((N.first_name || '') + ' ' + (N.last_name || '')).trim() || N.lead_email;
const sub = (N.job_title ? N.job_title + ' · ' : '') + (N.company_name || '');

const blocks = [
  { type: 'header', text: { type: 'plain_text', text: ('🎯 New lead in CRM: ' + (N.company_name || 'Unknown')).slice(0, 150) } },
  { type: 'section', text: { type: 'mrkdwn', text: ('*' + who + '*' + (sub ? ' — ' + sub : '') + '\n' + N.lead_email).slice(0, 2900) } },
  { type: 'section', text: { type: 'mrkdwn', text: ('*Their reply:*\n> ' + reply.replace(/\n/g, '\n> ')).slice(0, 2800) } },
  { type: 'section', text: { type: 'mrkdwn', text: '<' + url + '|Open prospect in CRM>  ·  Pipeline: *Positive Reply*' } }
];

return [{ json: { blocksJson: JSON.stringify({ blocks }) } }];