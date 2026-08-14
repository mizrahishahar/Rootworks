const F = $('Flatten').first().json;
const N = $('Normalize').first().json;
let C = {};
try { C = $('Extract Contact').first().json || {}; } catch (e) {}

const company = F.company_name || 'Unknown';
const tz = F.custom_timezone || '';
const zmap = {ET:'America/New_York',CT:'America/Chicago',MT:'America/Denver',PT:'America/Los_Angeles',AKT:'America/Anchorage',HT:'Pacific/Honolulu'};
const zone = zmap[tz] || 'America/New_York';
const localTime = $now.setZone(zone).toFormat('cccc h:mma');
const name = ((N.first_name || '') + ' ' + (N.last_name || '')).trim();
const title = (C.contact_title || N.job_title || '').trim();
const whoParts = [];
if (name) whoParts.push(name);
if (title) whoParts.push(title);
if (N.lead_email) whoParts.push(N.lead_email);
const who = name ? whoParts.join(' · ') : ('General inbox (' + (N.lead_email || '') + '), confirm the decision-maker');
const city = (N.city || '').trim();
const where = (city ? city + ', ' : '') + tz + ' · now ' + localTime;
const reply = (F.reply_text || '').replace(/\s+/g, ' ').trim().slice(0, 600) || 'interested, see thread';
const head = '🔥 New interested lead, ' + company + '\nWho: ' + who + '\nWhere: ' + where + '\nTheir reply: ' + reply;
const brief = (F.custom_qualification_brief || '').slice(0, 2900);

const blocks = [{ type: 'section', text: { type: 'mrkdwn', text: head.slice(0, 2900) } }];
if (brief) {
  blocks.push({ type: 'divider' });
  blocks.push({ type: 'section', text: { type: 'mrkdwn', text: brief } });
}

return [{ json: { blocksJson: JSON.stringify({ blocks }) } }];