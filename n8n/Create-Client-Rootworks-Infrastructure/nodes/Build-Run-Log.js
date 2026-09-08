// Build Run Log: one row per onboarding, upserted on Execution ID back onto the launch row that
// started it, to the logging standard. Status is computed from failed[] (a scaffold create that
// failed, a clash, an unresolved table id, a registry write that did not come back with a record);
// skips (what the template already carried, what waits for a mirror, a launch row that named no
// contacts) are separate lines and never errors.
//
// The Description is deliberately two halves. The first says what the machine did. The second is
// the Operator's checklist: the four acts no API can perform, each with the exact thing to do and
// why it cannot be automated. It is written to be worked from, top to bottom, without leaving the
// row.
const sd = $getWorkflowStaticData('global');
const p = $('Launch Params').first().json || {};
const name = p.clientName || '(unknown)';
let v = {}; try { v = $('Build Client Vars').first().json || {}; } catch (e) {}
let folderId = ''; try { folderId = $('Create Client Folder').first().json.id || ''; } catch (e) {}
let channelId = ''; try { channelId = $('Create Slack Channel').first().json.id || ''; } catch (e) {}
let channelFound = false; if (!channelId) { try { channelId = $('Resolve Channel').first().json.channelId || ''; channelFound = !!channelId; } catch (e) {} }   // a rerun: the channel pre-existed, Resolve Channel found it by name
let inviteError = ''; try { inviteError = String(($('Invite Owner to Channel').first().json || {}).error || ''); } catch (e) {}
let reg = {}; try { reg = $('Build Registry Row').first().json || {}; } catch (e) {}

// The registry upsert's own answer. Airtable returns records[] on both the create and the update
// leg; no id back means the row is not there, whatever the status code said.
const up = $input.first().json || {};
const upBody = (up.body !== undefined) ? up.body : up;
const recs = (upBody && Array.isArray(upBody.records)) ? upBody.records : [];
const regRec = (recs[0] && recs[0].id) || '';
const created = ((upBody && Array.isArray(upBody.createdRecords)) ? upBody.createdRecords : []).length > 0;

const failed = [];
if (!folderId) failed.push('Drive: no client folder id came back; the anatomy may be incomplete');
if (!channelId) failed.push('Slack: no channel id came back for ' + (v.channelName || '(unnamed)'));
if (inviteError) failed.push('Slack: the Operator invite to ' + (v.channelName || '(unnamed)') + ' failed: ' + inviteError);
for (const m of (reg.missing || [])) failed.push('Registry: ' + m);
if (!regRec) {
  const e = (upBody && upBody.error) || (up && up.error) || '';
  failed.push('Registry: the Clients upsert returned no record' + (e ? ': ' + (typeof e === 'object' ? (e.message || JSON.stringify(e)) : String(e)).slice(0, 200) : ''));
}
const S = sd.scaffold || null;
if (!S) failed.push('scaffold state missing: Scaffold Init never ran');
for (const f of (S && S.failed) || []) failed.push(f);

const emails = v.emails || [];
const skips = [];
if (!(p.contactIds || []).length) skips.push('Drive share: the launch row named no Contact, so the Shared folder was shared with nobody');
else if (!emails.length) skips.push('Drive share: the ' + p.contactIds.length + ' contact(s) on the launch row carry no email address');
if (!reg.sharedCompanies) skips.push('Registry: ClayrootsCompaniesSharedView left empty, the Companies table description carries no share link');
if (!reg.sharedPeople) skips.push('Registry: ClayrootsPeopleSharedView left empty, the People table description carries no share link');

const lines = [
  '**' + name + ': Rootworks infrastructure ' + (failed.length ? 'stood up with ' + failed.length + ' error' + (failed.length === 1 ? '' : 's') : 'stood up') + '**',
  '',
  '**Scope:** one client, ' + name + ', on the duplicated template base ' + p.base,
  '',
  '**Built**',
  '- **Drive:** client folder ' + (folderId || '(none)') + ', full anatomy plus the Overrides stub; Shared shared with ' + (emails.length ? emails.length + ' contact(s): ' + emails.join(', ') : 'nobody'),
  '- **Slack:** ' + (v.channelName || '') + (channelFound ? ' already existed (' : ' created (') + (channelId || 'none') + ')' + (inviteError ? ', Operator NOT invited' : ', Operator invited'),
  '- **Registry:** Clients row ' + (regRec || '(none)') + ' ' + (regRec ? (created ? 'created' : 'filled in place') : 'NOT written') + ', fields set: ' + ((reg.written || []).join(', ') || 'none'),
  '- **Table ids resolved from the base:** Companies ' + (reg.companiesTableId || '(none)') + ', People ' + (reg.peopleTableId || '(none)'),
];
if (S) {
  const c = S.created || [];
  const nFields = c.filter(x => x.name !== '(table)').length;
  const nTables = c.filter(x => x.name === '(table)').length;
  lines.push('', '**Scaffold** (base ' + S.base + ', ' + S.pass + ' schema pass' + (S.pass === 1 ? '' : 'es') + ', ' + nFields + ' field' + (nFields === 1 ? '' : 's') + ' and ' + nTables + ' table' + (nTables === 1 ? '' : 's') + ' created)');
  lines.push('**Extras picked:** ' + ((S.extras || []).length ? S.extras.join(', ') : 'none, the register core only, which the template already carries'));
  for (const T of ['Companies', 'People', 'DNC']) {
    const tbl = c.find(x => x.table === T && x.name === '(table)');
    const withTable = c.filter(x => x.table === T && x.name !== '(table)' && (x.how === 'base' || x.how === 'withTable')).map(x => x.name);
    const added = c.filter(x => x.table === T && x.name !== '(table)' && x.how === 'field').map(x => x.name);
    let how = tbl ? 'created (the base did not carry it)' : (S.seen[T + '.(table)'] === 'existed' ? 'came with the template' : 'not created');
    if (withTable.length) how += ', ' + withTable.length + ' fields (' + withTable.join(', ') + ')';
    if (added.length) how += '; fields added (' + added.length + '): ' + added.join(', ');
    if (!withTable.length && !added.length) how += '; nothing added';
    lines.push('- **' + T + ':** ' + how);
  }
  lines.push('', 'Skipped (' + S.existed.length + ', already on the base, left alone): ' + (S.existed.length ? S.existed.length + ' register columns' : 'nothing pre-existed'));
  if (S.skipped.length) { lines.push('', 'Skipped (' + S.skipped.length + ', not creatable yet):'); for (const s of S.skipped) lines.push('- ' + s); }
}
if (skips.length) { lines.push('', 'Skipped (' + skips.length + '):'); for (const s of skips) lines.push('- ' + s); }
if (failed.length) { lines.push('', '**Failed (' + failed.length + ')**'); for (const f of failed) lines.push('- ' + f); }

lines.push(
  '',
  '**Operator, the three hand acts.** Everything above is done. None of these can be: Airtable has no API for them. The mirrors and their six link columns already came with the template (ruled 2026-09-06: CLAYROOTS SCHEMA carries `Client Campaigns` and `Client Signals` synced to the Hub TEMPLATE rows, so every duplicate carries the links).',
  '',
  '1. **The relevance rule, on Companies and People.** Both ship from the template with a placeholder formula (Companies `IF(OR({manually_approved}, {public_emails_clean} != ""), 1, 0)`, People `IF(OR({manually_approved}, FALSE()), 1, 0)`). Replace each with ' + name + '\'s buyer rule. Every view that feeds a campaign reads relevance, so until this is done the People side cuts everyone. The meta API can rename a field, never re-express a formula.',
  '',
  '2. **Point the two mirrors at ' + name + '.** Now that the Clients row exists: in the Hub, add a Campaigns view and a Signals view filtered to Client = ' + name + '. In base ' + p.base + ', open the sync settings of "' + name + ' Campaigns" and "' + name + ' Signals" and switch each source view from the TEMPLATE view to the new one. The link columns stay as they are.',
  '',
  '3. **The two share links.** Share the Companies table and the People table, then either paste each link into that table\'s description in the base and rerun this machine, or paste them straight into this client\'s Clients row, ClayrootsCompaniesSharedView and ClayrootsPeopleSharedView. That is the surface we hand the client. No API creates a share.',
);

const started = Date.parse(p.startedAt || '') || sd.runStartedAt || Date.now();
const row = {
  'Execution ID': String($execution.id),
  'Automation': 'Create Client Rootworks Infrastructure',
  'Status': failed.length ? 'Succeeded with errors' : 'Succeeded',
  'Run at': p.startedAt || new Date().toISOString(),
  'Records In': 1,
  'Records Out': 1,
  'Errors': failed.length,
  'Target': p.base || '',
  'Trigger': 'form',
  'Execution Link': 'https://n8n.flowroots.com/workflow/' + $workflow.id + '/executions/' + $execution.id,
  'Duration s': Math.round((Date.now() - started) / 1000),
  'Description': lines.join('\n'),
};
// Client is attached only when the registry row is actually in hand; an empty link array has
// wiped correct attachments on pre-created rows before.
if (regRec) row['Client'] = [regRec];
return [{ json: row }];
