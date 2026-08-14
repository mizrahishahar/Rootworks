const F = $('Flatten').first().json;
const N = $('Normalize').first().json;
const company = F.company_name || 'Unknown';
const tz = F.custom_timezone || '';
const zmap = {IL:'Asia/Jerusalem',ET:'America/New_York',CT:'America/Chicago',MT:'America/Denver',PT:'America/Los_Angeles',GMT:'Europe/London',BST:'Europe/London'};
const zone = zmap[tz] || 'Asia/Jerusalem';
const localTime = $now.setZone(zone).toFormat('cccc h:mma');
const first = (N.first_name || '').trim();
const who = first ? first : 'General inbox, confirm who owns support';
const city = (N.city || '').trim();
const where = (city ? city + ', ' : '') + tz + ' · now ' + localTime;
const brief = (F.custom_qualification_brief || '');
const fit = (brief.split('\n')[0] || '').replace(/:?white_check_mark:?/gi, '').replace(/^[ |-]+/, '').trim().slice(0, 180) || F.custom_qualification_status || '';
const reply = (F.reply_text || '').replace(/\s+/g, ' ').trim().slice(0, 220);
const situation = reply ? ('reply: ' + reply) : 'interested, see thread';
const text = '🔥 New interested lead, ' + company + '\nWho: ' + who + '\nWhere: ' + where + '\nFit: ' + fit + '\nTheir reply: ' + situation + '\nGoal: book the workflow-mapping call with Tamir.';

return [{ json: { blocksJson: JSON.stringify({ blocks: [{ type: 'section', text: { type: 'mrkdwn', text: text.slice(0, 2900) } }] }) } }];