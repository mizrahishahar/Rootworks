// Tier 0b: the stored Conversation Thread on the company Prospect row.
// The 12-hourly thread syncs keep signature blocks intact (proven live 2026-08-20:
// Zeron, MX Wholesale, What A Move all carry the lead's number in THEM messages),
// so a Hub contact fired by record id alone can still get the signature phone.
// A signature_phone passed in the payload (Handle New Lead, raw reply in hand) wins.
const prev = $('Person').first().json;
const j = Object.assign({}, prev);
const acc = j.acc;
if (acc.phone) return [{ json: j }];
let thread = '';
try { const r = $('Fetch Company').first().json || {}; const f = r.fields || {}; thread = String(f['Conversation Thread'] || f['Conversation Thread OLD'] || ''); } catch (e) { thread = ''; }
if (!thread) return [{ json: j }];
if (acc.tried.indexOf('signature') === -1) acc.tried.push('signature');
// Collect THEM blocks only: the lead's own messages, where their signature lives.
const blocks = [];
const re = /\*\*\[[^\]]*\]\s*(THEM|US):\*\*/g;
let m, marks = [];
while ((m = re.exec(thread)) !== null) marks.push({ dir: m[1], start: m.index, end: re.lastIndex });
for (let i = 0; i < marks.length; i++) {
  if (marks[i].dir !== 'THEM') continue;
  const bodyEnd = i + 1 < marks.length ? marks[i + 1].start : thread.length;
  blocks.push(thread.slice(marks[i].end, bodyEnd));
}
if (!blocks.length) blocks.push(thread);
// URLs, cid: refs, and bracketed asset tags carry long digit runs (upload timestamps,
// uuids) that pattern-match as phones — proven by a live false positive (a Dropbox
// filename's 20240212154056). Strip them, then accept only formatted numbers: a bare
// unbroken 11+ digit run without a leading + is never a real signature phone.
const scrub = (txt) => String(txt || '')
  .replace(/https?:\/\/\S+/gi, ' ')
  .replace(/\bwww\.\S+/gi, ' ')
  .replace(/\bcid:\S+/gi, ' ')
  .replace(/\[[^\]\n]*\]/g, ' ');
const grabPhones = (txt) => { const out = []; const pre = /(?:\+?\d{1,3}[\t .\-]?)?(?:\(?\d{2,4}\)?[\t .\-]?){2,4}\d{2,4}/g; let mm; while ((mm = pre.exec(scrub(txt))) !== null) { const raw = mm[0].trim(); const dg = raw.replace(/\D/g, ''); if (dg.length < 9 || dg.length > 15) continue; if (/^\d{11,}$/.test(raw)) continue; out.push({ raw, dg }); } return out; };
const isTollFree = (dg) => { let x = String(dg || ''); if (x.length === 11 && x.charAt(0) === '1') x = x.slice(1); return x.length === 10 && /^(?:800|833|844|855|866|877|888)/.test(x); };
// Latest reply first: the freshest signature is the most likely direct line.
let hit = '', tf = '';
for (let i = blocks.length - 1; i >= 0 && !hit; i--) {
  for (const c of grabPhones(blocks[i])) {
    if (isTollFree(c.dg)) { if (!tf) tf = c.raw; }
    else { hit = c.raw; break; }
  }
}
if (hit) { acc.phone = hit; acc.source = 'signature'; }
else if (tf && !acc.tf) { acc.tf = tf; acc.tf_source = 'signature-tollfree'; }
return [{ json: j }];
