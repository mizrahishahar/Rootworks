// One row for the whole run. Rewritten 2026-08-24 for the batch loop: every count
// comes from the loop tally (sd.cbState) instead of the retired single-pass nodes
// (SQ Guard / SQ Enrich / Format Supersoniq), which no longer exist.
const form = $('Contacts Launch').first().json;
const started = form.submittedAt || $('Config').first().json.startedAt;
const pd = $('Parse Domains').first().json;
const domainsIn = pd._domain_count || 0;
const sd = $getWorkflowStaticData('global');
const st = sd.cbState || { totals: {}, withContacts: {} };
const t = st.totals || {};
const delivered = Number(t.delivered) || 0;
const written = Number(t.written) || 0;
const skipped = Number(t.skipped) || 0;
const credits = Number(t.credits) || 0;
const companiesMatched = Number(t.companiesMatched) || 0;
const failedChunks = Number(t.failedChunks) || 0;
let batchCount = 0; try { batchCount = Number($('Init Contact Batches').first().json.batchCount) || 0; } catch (e) {}
const zeroDomains = Math.max(0, domainsIn - Object.keys(st.withContacts || {}).length);
const overflowCount = Number(sd.overflowCount) || 0;
const overflowUrl = sd.overflowUrl || '';
const overflowError = sd.overflowError || '';
let clientRec = []; try { const rc = $('Resolve Client').first().json; if (rc && rc.id) clientRec = [rc.id]; } catch (e) {}
const g = $('Contacts Table Guard').first().json || {};
const tableName = g.tableName || '';
const tableId = g.tableId || '';
const modeTxt = (g.mode === 'append') ? 'appended to an existing table' : 'created a new table';
const fc = (g.fieldsCreated && g.fieldsCreated.length) ? g.fieldsCreated.join(', ') : 'none';
const tag = ((form['Tag'] || '') + '').trim();
let dur = 0; try { if (started) dur = Math.max(0, Math.round((Date.now() - new Date(started).getTime()) / 1000)); } catch (e) {}
const trig = form._launchRecordId ? ('record-launched by ' + form._launchRecordId) : 'form-launched';
const errors = (g.createdFieldError ? 1 : 0) + failedChunks + (overflowError ? 1 : 0);
const fmt = v => Number(v || 0).toLocaleString('en-US');
const parts = [];
parts.push('**' + fmt(domainsIn) + ' domains in, ' + fmt(delivered) + ' contacts delivered**');
parts.push('**Tag:** ' + (tag || 'none'));
parts.push('**Supersoniq**\n- **Batches:** ' + fmt(batchCount) + '\n- **Companies matched:** ' + fmt(companiesMatched) + '\n- **Contacts delivered:** ' + fmt(delivered) + '\n- **Contacts written:** ' + fmt(written) + '\n- **Credits used:** ' + fmt(credits) + '\n- **Domains with zero contacts:** ' + fmt(zeroDomains) + '\n- **Rows skipped (empty Contact Key):** ' + fmt(skipped));
parts.push('**Table:** ' + modeTxt + ', ' + tableName + ' (' + tableId + ')\n**Fields created:** ' + fc);
if (overflowUrl) { parts.push('**Leads Overflow report:** ' + fmt(overflowCount) + ' domains without contacts\n' + overflowUrl); }
else if (overflowCount > 0 && !overflowError) { parts.push('**Leads Overflow report:** ' + fmt(overflowCount) + ' domains without contacts, not uploaded.'); }
const warns = [];
if (failedChunks) { warns.push('- ' + failedChunks + ' Supersoniq request(s) failed inside otherwise-successful batches and were dropped.'); }
if (g.createdFieldError) { warns.push('- ' + g.createdFieldError); }
if (g.buildNameIgnored) { warns.push('- Build name ignored: an Existing Table ID was supplied.'); }
if (overflowError) { warns.push('- ' + overflowError); }
if (warns.length) { parts.push('**Warnings (' + warns.length + ')**\n' + warns.join('\n')); }
parts.push('**Source:** Storeleads CSV (' + trig + ')');
const log = {
  'Automation': 'Storeleads Domains -> Supersoniq -> Clayroots',
  'Status': errors ? 'Succeeded with errors' : 'Succeeded',
  'Trigger': 'form',
  'Errors': errors,
  'Run at': new Date().toISOString(),
  'Target': tableName + ' (' + tableId + ')',
  'Records In': domainsIn,
  'Records Out': delivered,
  'Duration s': dur,
  'Description': parts.join('\n\n'),
  'Execution Link': 'https://n8n.flowroots.com/workflow/' + $workflow.id + '/executions/' + $execution.id,
  'Execution ID': String($execution.id)
};
if (clientRec.length) { log['Client'] = clientRec; }
return [{ json: log }];
