let row = {};
try { row = (($('Find Client Row').first().json || {}).fields) || {}; } catch(e) { row = {}; }
const channel = String(row['BDR Slack Channel ID'] || '').trim();
let n = {}; try { n = $('Normalize').first().json || {}; } catch(e) {}
let f = {}; try { f = $('Flatten').first().json || {}; } catch(e) {}
let phone = '', phoneSrc = '';
try { const rp = $('Resolve Phone').first().json || {}; phone = String(rp.phone || '').trim(); phoneSrc = String(rp.phone_source || '').trim(); } catch(e) {}
let prospectId = '', url = '';
try { const r = $('Resolve Prospect').first().json || {}; prospectId = r.prospect_id || ''; url = String(r.pipeline_url || ''); } catch(e) {}

const esc = (v) => String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const clean = (v) => { const s = String(v == null ? '' : v).trim(); return (!s || s.toUpperCase() === 'N/A') ? '' : esc(s); };
const company = clean(f.company_name) || clean(n.company_name) || 'Unknown';
const email = clean(n.lead_email);
const tzRaw = String(f.custom_timezone || '').trim();
const tz = clean(tzRaw);
const city = clean(n.city);
const zmap = {ET:'America/New_York',CT:'America/Chicago',MT:'America/Denver',PT:'America/Los_Angeles',AT:'America/Halifax',AKT:'America/Anchorage',HT:'Pacific/Honolulu',IL:'Asia/Jerusalem',GMT:'Europe/London',BST:'Europe/London','GMT/BST':'Europe/London',CET:'Europe/Berlin',CEST:'Europe/Berlin',AEST:'Australia/Sydney',IST:'Asia/Kolkata'};
let localTime = '';
try { localTime = $now.setZone(zmap[tzRaw] || 'UTC').toFormat('HH:mm'); } catch(e) { localTime = ''; }

const full = clean(((n.first_name || '') + ' ' + (n.last_name || '')).trim());
const title = clean(n.job_title);
const who = full ? (full + (title ? ',  ' + title : '')) : 'General inbox, confirm you have the owner';
const place = [city, tz, localTime ? localTime + ' their time' : ''].filter(Boolean).join('   ·   ');

let phoneLine = '_no number found_';
if (phone) {
  const p = esc(phone);
  if (phoneSrc === 'signature') phoneLine = '*' + p + '*   ✅ direct line';
  else if (phoneSrc === 'LeadMagic') phoneLine = '*' + p + '*   ✅ mobile';
  else if (phoneSrc === 'signature-tollfree' || phoneSrc === 'GPT-tollfree') phoneLine = '*' + p + '*   ⚠️ switchboard, you will get a receptionist';
  else phoneLine = '*' + p + '*   found online, unverified';
}

const briefRaw = String(f.custom_qualification_brief || '');
const fit = esc((briefRaw.split('\n')[0] || '').replace(/:?white_check_mark:?/gi, '').replace(/^[ |\-•]+/, '').trim().slice(0, 200)) || clean(f.custom_qualification_status);
const situation = clean(f.situation_summary) || esc(String(f.reply_text || '').replace(/\s+/g, ' ').trim().slice(0, 180)) || 'interested, see thread';

let persona = '';
try {
  const acct = String(n.email_account_id || n.sending_inbox || '').toLowerCase();
  const prefix = (acct.split('@')[0] || '').replace(/\.[a-z0-9]+$/, '');
  const pmap = {tomwilson:'Tom Wilson', sarahjohnson:'Sarah Johnson', mikecarter:'Mike Carter', jakemiller:'Jake Miller', chrisdavis:'Chris Davis'};
  persona = pmap[prefix] || '';
} catch(e) { persona = ''; }

const L = [];
L.push('📞   *NEW LEAD TO CALL*');
L.push('');
L.push('*' + company + '*');
L.push(who);
if (place) L.push(place);
L.push('');
L.push('📱   ' + phoneLine);
L.push('');
L.push('*Fit*');
L.push(fit);
L.push('');
L.push('*Where it stands*');
L.push(situation);
L.push('');
if (persona) { L.push('*We email them as*   ' + persona + ', so you are consistent if it comes up'); L.push(''); }
L.push('*Goal*   book the meeting');
L.push('');
if (email) { L.push('⚠️   Be very careful if you choose to email them directly, we are still working the thread as well.'); L.push(email); L.push(''); }
if (url) { L.push('🔗   *<' + url + '|Open in Pipeline>*   to see the full prospect details'); L.push(''); }
L.push('📬   *The full conversation so far is in the thread below.*');
L.push('');
L.push('_Reply in this thread as you work it (called / reached / no answer). Your notes sync onto their record._');

return [{ json: { bdr_channel: channel, bdr_text: L.join('\n').slice(0, 2900), prospect_id: prospectId } }];