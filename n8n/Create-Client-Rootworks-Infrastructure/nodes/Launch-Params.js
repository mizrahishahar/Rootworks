// Launch Params: the launch row is the whole contract for standing up a new client's Rootworks
// infrastructure. Four fields are read from it and nothing else:
//   Build name         the client's name, exactly as the registry is to carry it. It is also the
//                      merge key of the registry upsert and the stem of the Drive folder, the
//                      Slack channel and the two mirror table names, so it is spelled once, here.
//   Clayroots Base ID  the base the Operator just made by duplicating CLAYROOTS SCHEMA
//                      (appMhfP6GeR5WeSiC). This machine no longer creates a base: Airtable
//                      cannot duplicate one by API, and duplicating in the interface is what
//                      carries all 17 views with their filters, sorts and field visibility.
//   Extras             the declared extras groups to add to Companies and People. The template
//                      deliberately carries none; extras are picked per client at onboarding.
//   Contact            the client's own contacts. Their email addresses get writer access to the
//                      Drive Shared folder. Empty is valid and lands as a named skip, not an error.
// Both are validated here, before a single Drive folder, Slack channel or Airtable column exists,
// so a typo on the row costs nothing but the row. Resets the run's state at the trigger.
const sd = $getWorkflowStaticData('global');
sd.scaffold = null;
sd.runStartedAt = Date.now();
const rec = $('Fetch Launch Record').first().json || {};
const f = rec.fields || {};
const arr = (v) => Array.isArray(v) ? v : (v == null || v === '' ? [] : [v]);
const idOf = (x) => String((x && typeof x === 'object') ? (x.id || x.name || '') : x).trim();

const clientName = String(f['Build name'] || '').trim();
const base = String(f['Clayroots Base ID'] || '').trim();
if (!clientName) {
  throw new Error('Launch record ' + rec.id + ' has no Build name. That field is the client\'s name; nothing was created.');
}
if (!/^app[A-Za-z0-9]{14}$/.test(base)) {
  throw new Error('Launch record ' + rec.id + ' has no valid Clayroots Base ID ("' + base + '"). Duplicate the CLAYROOTS SCHEMA template (appMhfP6GeR5WeSiC) first and paste the new base id onto the row; nothing was created.');
}

const extras = arr(f['Extras']).map(idOf).filter(Boolean);
const contactIds = arr(f['Contact']).map(idOf).filter(Boolean);
// The Contacts search runs whatever this says. FALSE() when the row names nobody, so the node
// still emits and the Drive share leg simply has no one to invite.
const formula = contactIds.length
  ? 'OR(' + contactIds.map((id) => "RECORD_ID()='" + id + "'").join(',') + ')'
  : 'FALSE()';

return [{ json: {
  clientName: clientName,
  base: base,
  extras: extras,
  contactIds: contactIds,
  formula: formula,
  _launchRecordId: rec.id || '',
  startedAt: new Date().toISOString(),
} }];
