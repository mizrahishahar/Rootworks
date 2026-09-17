// FE Parse: FullEnrich's answer folded onto the lead. The carrier arrives on the input: from the poll
// loop when it settled (or hit the 90-second cap, where one forced read keeps whatever was found),
// from Submit Check when the submission was refused. A number found is the lead's phone; no
// credential or no credits is a named skip; anything else that kept FullEnrich from answering is a
// named failure. The lead flows on either way.
const j = Object.assign({}, $('FE Prep').first().json || {});
delete j.body;
const acc = j.acc;
const c = $input.first().json || {};
const x = (c.found || [])[0] || null;
if (x && x.number) {
  acc.phone = x.number;
  acc.source = 'FullEnrich';
  acc.line_type = String(x.lineType || '').toLowerCase() || 'unknown';
} else if (c.submitErr) {
  if (/no credential|out of credits/.test(c.submitErr)) acc.skipped.push(c.submitErr); else acc.failed.push(c.submitErr);
} else if (c.status === 'CREDITS_INSUFFICIENT') {
  acc.skipped.push('FullEnrich: out of credits');
} else if (c.status === 'UNREADABLE' || c.status === 'CANCELED') {
  acc.failed.push('FullEnrich: enrichment ' + (c.enrichmentId || '?') + ' ' + c.status.toLowerCase() + ' ' + (c.pollErr || ''));
} else if (c.timedOut) {
  acc.failed.push('FullEnrich: no answer inside 90 seconds (enrichment ' + (c.enrichmentId || '?') + ' may still finish and charge on their side)');
}
return [{ json: j }];
