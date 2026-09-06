// The client's PlusVibe workspace comes from the Hub registry row, never from a hardcoded map.
const inp = $('Inputs').first().json;
let row = null;
try { const r = $input.first().json; if (r && r.id) row = r; } catch (e) {}
const f = (row && row.fields) || row || {};
const workspaceId = String(f['PlusVibe Workspace ID'] || '').trim();
const clientName = String(f['Client'] || inp.client || '');
let error = '';
if (!inp.client || !inp.tag) error = 'client and tag are both required';
else if (!row || !row.id) error = 'no Hub client named ' + inp.client;
else if (!workspaceId) error = clientName + ' has no PlusVibe Workspace ID on its Hub row';
return [{
  json: {
    ok: !error,
    error,
    client: clientName,
    tag: inp.tag,
    workspaceId,
    clientRecId: row && row.id ? String(row.id) : '',
  },
}];
