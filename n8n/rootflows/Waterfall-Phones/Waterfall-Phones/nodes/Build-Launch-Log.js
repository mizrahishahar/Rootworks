// The launch row's verdict, read straight from this execution's Finalize (the
// launch leg runs the waterfall inline, no second execution). Per the logging
// standard this UPDATES the pre-created launch row rather than creating one.
const P = $('Launch Params').first().json;
const failed = [];
let r = null;
if (P._invalid) {
  failed.push('invalid launch row: ' + (P._error || 'unknown'));
} else {
  try { r = ($('Finalize').first().json || {}).result || null; } catch (e) { r = null; }
  if (!r) failed.push('run ended before a verdict');
  else for (const x of (r.failed || [])) failed.push(x);
}
const start = P.startedAt || new Date().toISOString();
const ms = Date.parse(start);
const dur = ms ? Math.round((Date.now() - ms) / 1000) : null;
const found = !!(r && r.phone);
const lines = [
  '**' + (found ? r.phone + ' (' + r.phone_source + ')' : 'no phone found') + '**',
  '',
  '- **Contact:** ' + (P.contactId || 'not set'),
  '- **Tiers tried:** ' + ((r && (r.tried || []).join(', ')) || 'none'),
  '- **Result:** ' + (found ? r.phone + ' via ' + r.phone_source + ', written to the contact row' : 'nothing found on any tier'),
];
const skipped = (r && r.skipped) || [];
if (skipped.length) lines.push('', '**Tiers skipped**', ...skipped.map((x) => '- ' + x));
if (failed.length) lines.push('', '**FAILED (' + failed.length + ')**', ...failed.map((x) => '- ' + x));
lines.push('', '**Duration:** ' + (dur != null ? dur + 's' : 'n/a'));
return [{ json: {
  id: P._launchRecordId,
  'Status': failed.length ? 'Succeeded with errors' : 'Succeeded',
  'Errors': failed.length,
  'Records In': 1,
  'Records Out': found ? 1 : 0,
  'Target': P.contactId || '',
  'Trigger': 'form',
  'Run at': start,
  'Duration s': dur,
  'Description': lines.join('\n'),
} }];
