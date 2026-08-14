const g = $('Rank Rows').first().json;
const sd = $getWorkflowStaticData('global');
const st = sd.ricStats || {};
delete sd.ricStats;
delete sd.ricRows;
delete sd.ricWrites;
delete sd.ricPages;
let wf = 0;
try { wf = Number((($('Tally Writes').first().json) || {}).writeFailures) || 0; } catch (e) { wf = 0; }
let clientRec = [];
try { const rc = $('Resolve Client').first().json; if (rc && rc.id) { clientRec = [rc.id]; } } catch (e) {}
let dur = 0;
try { if (g.startedAt) { dur = Math.max(0, Math.round(($now.toMillis() - new Date(g.startedAt).getTime()) / 1000)); } } catch (e) {}
const written = Math.max(0, (st.ranksWritten || 0) - wf);
const fmt = v => Number(v || 0).toLocaleString('en-US');
const parts = [];
parts.push('**' + fmt(written) + ' ranks written across ' + fmt(st.companies || 0) + ' companies**');
parts.push('**Scope**\n- **Table:** ' + g.tableName + ' (' + g.tableId + ')\n- **Scope:** ' + (g.scope || 'whole table') + '\n- **Rows scanned:** ' + fmt(st.rowsScanned || 0) + '\n- **Companies found:** ' + fmt(st.companies || 0));
parts.push('**Ranks**\n- **Written:** ' + fmt(written) + '\n- **Already correct (unchanged):** ' + fmt(st.unchanged || 0) + '\n- **Skipped, no domain:** ' + fmt(st.skippedNoDomain || 0) + '\n- **Write failures:** ' + fmt(wf) + '\n- **Largest company in scope:** ' + (st.largestDomain || 'none') + ' (' + fmt(st.largestCount || 0) + ' contacts)');
parts.push('**Details**\n- **RankInCompany column:** ' + (g.rankFieldCreated ? 'created by this run' : 'already existed') + '\n- **Pages fetched:** ' + fmt(st.pages || 0) + '\n- Idempotent by design: re-running overwrites RankInCompany and only rewrites rows whose rank changed.');
parts.push('**Source:** Rank Contacts (' + (g.trigger === 'record' ? 'record' : 'form') + '-launched)');
const log = {
  'Automation': 'Add rank in company to table',
  'Status': wf ? 'Succeeded with errors' : 'Succeeded',
  'Trigger': 'form',
  'Run at': $now.toISO(),
  'Target': g.tableName + ' (' + g.tableId + ')' + (g.viewId ? (' [view ' + g.viewName + ']') : ''),
  'Records In': st.rowsScanned || 0,
  'Records Out': written,
  'Errors': wf,
  'Duration s': dur,
  'Description': parts.join('\n\n'),
  'Execution Link': 'https://n8n.flowroots.com/workflow/' + $workflow.id + '/executions/' + $execution.id,
  'Execution ID': String($execution.id)
};
if (clientRec.length) { log['Client'] = clientRec; } else { delete log['Client']; }
return [{ json: log }];