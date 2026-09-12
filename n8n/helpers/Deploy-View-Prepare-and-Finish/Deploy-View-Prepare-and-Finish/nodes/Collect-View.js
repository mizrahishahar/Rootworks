// Collect View: the paginated view read into the run state, and the one question the DNC branch
// asks. Rows land on the state so the DNC read can sit between the view and Build Rows without
// breaking the row flow.
const sd = $getWorkflowStaticData('global'); const dk = 'deploy_' + $execution.id; const D = sd[dk];
const rows = [];
for (const it of $input.all()) {
  const j = it.json || {};
  if (Array.isArray(j.records)) rows.push(...j.records);
  else if (j.id && j.fields) rows.push(j);
  else if (j.error) D.errors.push('view read: ' + JSON.stringify(j.error).slice(0, 200));
}
D.viewRows = rows;
return [{ json: { hasDnc: !!D.dncTableId } }];
