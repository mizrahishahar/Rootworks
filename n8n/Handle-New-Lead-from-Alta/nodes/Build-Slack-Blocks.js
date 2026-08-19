const F = $('Flatten').first().json;
const N = $('Alta Normalize').first().json;
let phoneVal = '', phoneSrc = '';
try { const rp = $('Resolve Phone').first().json || {}; phoneVal = String(rp.phone || '').trim(); phoneSrc = String(rp.phone_source || '').trim(); } catch (e) {}
let B = {};
try { B = $('DiscoLike BizData').first().json || {}; } catch (e) { B = {}; }
let C = {};
try { C = $('Resolve Campaign').first().json || {}; } catch (e) { C = {}; }
let dash = '';
try { dash = String(((($('Get Client Row').first().json || {}).fields) || {})['Dashboard Page ID'] || '').trim(); } catch (e) { dash = ''; }
const esc = (v) => String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const clean = (v) => { const s = String(v == null ? '' : v).trim(); return (!s || s.toUpperCase() === 'N/A') ? '' : esc(s); };
const isUuid = (s) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(s || ''));

const companyRaw = F.company_name || N.company_name || 'Unknown';
const tzRaw = String(F.custom_timezone || '').trim();
const tz = clean(tzRaw);
const zmap = {ET:'America/New_York',CT:'America/Chicago',MT:'America/Denver',PT:'America/Los_Angeles',AT:'America/Halifax',AKT:'America/Anchorage',HT:'Pacific/Honolulu',IL:'Asia/Jerusalem',GMT:'Europe/London',BST:'Europe/London','GMT/BST':'Europe/London',CET:'Europe/Berlin',CEST:'Europe/Berlin',AEST:'Australia/Sydney',IST:'Asia/Kolkata'};
let localTime = '';
try { localTime = $now.setZone(zmap[tzRaw] || 'UTC').toFormat('HH:mm'); } catch (e) { localTime = ''; }

const name = clean(N.full_name);
const title = clean(N.job_title);
const contact = clean(N.lead_email) || clean(N.linkedin_url);

let phoneLine = '_no number found_';
if (phoneVal) {
  const p = esc(phoneVal);
  if (phoneSrc === 'signature') phoneLine = p + '   ✅ _direct line, from their signature_';
  else if (['supersoniq', 'ai-ark', 'leadmagic', 'prospeo', 'LeadMagic'].includes(phoneSrc)) phoneLine = p + '   ✅ _mobile_';
  else if (phoneSrc.endsWith('-tollfree')) phoneLine = p + '   ⚠️ _switchboard, you will get a receptionist_';
  else phoneLine = p;
}

const who = [];
who.push(name ? ('*' + name + '*' + (title ? '   ' + title : '')) : '*General inbox*   confirm the decision maker');
if (contact) who.push(contact);
who.push(phoneLine);
who.push('');
who.push('via Alta · ' + (clean(F.source_channel) || clean(F.reply_channel) || 'reply'));
const place = [clean(N.city), tz, localTime ? localTime + ' their time' : ''].filter(Boolean).join('   ·   ');
if (place) who.push(place);
const firmo = [clean(B.employees) || clean(N.company_size) ? (clean(B.employees) || clean(N.company_size)) + ' staff' : '', clean(B.revenue_range) || clean(N.company_revenue), clean(N.domain)].filter(Boolean).join('   ·   ');
if (firmo) who.push(firmo);

const reply = esc(String(F.reply_text || '').replace(/\s+/g, ' ').trim().slice(0, 900));
const quoted = reply ? '> ' + reply : '> _interested, see thread_';
const brief = esc(String(F.custom_qualification_brief || '').trim());

const blocks = [{ type: 'header', text: { type: 'plain_text', text: ('🔥 new interested qualified lead · ' + companyRaw).slice(0, 150), emoji: true } }];
blocks.push({ type: 'section', text: { type: 'mrkdwn', text: who.join('\n').slice(0, 2900) } });
blocks.push({ type: 'divider' });
blocks.push({ type: 'section', text: { type: 'mrkdwn', text: ('*THEY SAID*\n\n' + quoted).slice(0, 2900) } });
if (brief) {
  blocks.push({ type: 'divider' });
  blocks.push({ type: 'section', text: { type: 'mrkdwn', text: ('*WHY THEY QUALIFY*\n\n' + brief).slice(0, 2900) } });
}

let campName = clean(C.campaignName) || clean(N.campaign_name);
if (!campName) { const cid = String(N.alta_campaign_id || '').trim(); if (cid && !isUuid(cid)) campName = clean(cid); }
if (campName) {
  const statBits = [];
  if (C.contacted) statBits.push(esc(C.contacted) + ' contacted');
  if (C.replies !== '' && C.replies != null) statBits.push(esc(C.replies) + ' replies' + (C.replyRate ? ' (' + esc(C.replyRate) + ')' : ''));
  if (C.positives !== '' && C.positives != null) statBits.push(esc(C.positives) + ' positive' + (C.positiveRate ? ' (' + esc(C.positiveRate) + ')' : ''));
  if (C.status) statBits.push(esc(C.status));
  const campLines = ['*WHERE THEY CAME FROM*', '', campName];
  if (statBits.length) campLines.push(statBits.join('   ·   '));
  if (dash && C.campaignRowId) {
    try {
      const blob = JSON.stringify({ pageId: 'pagnDARjFPzq5HclC', rowId: C.campaignRowId });
      const b64 = Buffer.from(blob, 'utf8').toString('base64').replace(/=+$/, '');
      campLines.push('');
      campLines.push('🔗  *<https://airtable.com/appQG6dK0FIOhTxOl/' + dash + '?detail=' + b64 + '|View the campaign>*  copy and live stats');
    } catch (e) {}
  }
  blocks.push({ type: 'divider' });
  blocks.push({ type: 'section', text: { type: 'mrkdwn', text: campLines.join('\n').slice(0, 2900) } });
}

return [{ json: { blocksJson: JSON.stringify({ blocks }) } }];