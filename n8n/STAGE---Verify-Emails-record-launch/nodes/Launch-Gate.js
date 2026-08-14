const out=[];
for (const it of $input.all()) {
  const j = it.json || {};
  const f = j.fields || j;
  const status = ((f['Status'] || '') + '').trim();
  if (status) continue;
  const id = j.id || f.id;
  if (!id) continue;
  out.push({ json: {
    recordId: id,
    automation: ((f['Automation'] || 'Verify Emails (staging)') + ''),
    baseId: ((f['Clayroots Base ID'] || '') + '').trim(),
    tableId: ((f['Table ID'] || '') + '').trim(),
    maxRows: f['Max Rows'] || null,
    view: ((f['View'] || '') + '').trim(),
    startedAt: new Date().toISOString()
  }});
}
return out;