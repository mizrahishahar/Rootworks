const sd=$getWorkflowStaticData('global');
sd.runStartedAt=$now.toMillis();
const r=$input.first().json||{};
const f=r.fields||r;
const clientName=f['Name']||'Unknown Client';
const raw=f['Contacts']||[];
const ids=raw.map(c=>typeof c==='string'?c:(c&&c.id)||'').filter(Boolean);
const formula=ids.length?('OR('+ids.map(id=>"RECORD_ID()='"+id+"'").join(',')+')'):'FALSE()';
return [{ json: { clientName, formula, prospectId: r.id||'' } }];