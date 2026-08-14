const j = $json || {};
const folderId = j.folderId || j.id;
if (!folderId) { throw new Error('Could not resolve a Leads Overflow folder: ' + JSON.stringify(j).slice(0, 300)); }
return [{ json: { folderId: folderId, created: !!(j.id && !j.folderId), fallback: j.resolved === false, reason: j.reason || '' } }];