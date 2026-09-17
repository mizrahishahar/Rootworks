// Decides whether to fire the Waterfall Phones webhook for this lead.
// The waterfall owns the phone write on the contact row; this run only needs
// the resolved number back for the Slack cards and the run log.
// Out-of-ICP leads never trigger paid tiers: they fire only when a direct
// signature number is already in hand (free, instant hit inside the waterfall).
const f = $('Flatten').first().json;
let contactId = '';
try { contactId = $('Create CRM Contact').first().json.id || ''; } catch (e) {}
if (!contactId) {
  try {
    const pf = $('Find CRM Prospect').first().json.fields || {};
    const c = pf.Contacts;
    if (Array.isArray(c) && c.length) contactId = String(c[0] && c[0].id ? c[0].id : c[0]);
  } catch (e) {}
}
// This intake carries no signature scrape: the PlusVibe intake gets its number from its Format Thread node,
// and this workflow has no such node (the old reference to it resolved to nothing, every run). The waterfall's
// own signature tier still reads the Conversation Thread on the prospect row.
const sig = '', sigTf = '';
const outOfIcp = f.custom_qualification_status === 'out_of_icp';
// Every reply lands a row (2026-09-17) and every row gets its phone, Engaged included (Operator ruling
// the same day): the screen never gates the waterfall. Out-of-ICP stays off the paid tiers, as it always was.
const _call = (contactId && (!outOfIcp || sig)) ? 1 : 0;
let reason = '';
if (!contactId) reason = 'no contact row';
else if (outOfIcp && !sig) reason = 'out_of_icp';
return [{ json: { _call, contactId, sig: sig || sigTf, sigIsTF: !sig && !!sigTf, reason } }];
