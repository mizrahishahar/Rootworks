// Every client with a sender workspace, the Flowroots pool last so its block closes the report.
const sd = $getWorkflowStaticData('global');
sd.results = [];
const launch = sd.launch || {};
const cf = String(launch.clientFilter || '');
const all = $('Get PV Clients').all().filter(it => it.json && it.json.id);
const picked = cf ? all.filter(it => it.json.id === cf) : all;
sd.scope = cf ? (picked.length ? 'one client (on demand)' : 'client filter matched no client with a sender workspace') : 'all clients';
// A loop node that receives nothing never runs, so an empty pick still has to reach the close.
if (!picked.length) return [{ json: { _empty: true } }];
const rows = picked.map(it => {
  const j = it.json; const f = j.fields || j;
  const name = String(f['Client'] || '');
  return {
    clientRecId: j.id,
    clientName: name,
    isPool: name.toLowerCase() === 'flowroots',
    pvWorkspace: String(f['PlusVibe Workspace ID'] || '').trim(),
    clientChannel: String(f['Slack Channel ID'] || '').trim(),
    clientReports: f['Infra Reports to Client'] === true,
  };
}).filter(r => r.pvWorkspace);
if (!rows.length) return [{ json: { _empty: true } }];
rows.sort((a, b) => (a.isPool === b.isPool ? a.clientName.localeCompare(b.clientName) : (a.isPool ? 1 : -1)));
return rows.map(r => ({ json: r }));
