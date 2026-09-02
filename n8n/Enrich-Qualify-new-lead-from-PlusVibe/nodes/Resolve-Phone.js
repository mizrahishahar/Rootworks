// Parses the Waterfall Phones response back into the shape every downstream
// reader expects ({phone, phone_source}). The waterfall (HTNr5G6vBVkbxsqF) owns
// the tier logic AND the phone write on the contact row; this node only carries
// the verdict forward for the Slack cards, the run log, and the addon payload.
const prep = $('Waterfall Prep').first().json;
const out = { phone: '', phone_source: 'none' };
if (prep._call) {
  const r = $input.first().json;
  let b = r && r.body !== undefined ? r.body : r;
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch (e) { b = null; } }
  if (b && b.phone !== undefined) {
    out.phone = String(b.phone || '');
    out.phone_source = String(b.phone_source || 'none');
  } else {
    // Waterfall unreachable (inactive, timeout, non-JSON): the lead still flows,
    // the phone just stays unresolved. Surfaced in the run log as 'error'.
    out.phone_source = 'error';
  }
} else if (prep.sig) {
  out.phone = prep.sig;
  out.phone_source = prep.sigIsTF ? 'signature-tollfree' : 'signature';
} else if (prep.reason === 'out_of_icp') {
  out.phone_source = 'skipped';
}
return [{ json: out }];
