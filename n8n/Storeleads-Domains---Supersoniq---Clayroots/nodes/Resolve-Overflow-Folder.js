const want = (name, target) => String(name || '').trim().toLowerCase() === target;
const all = (n) => { try { return $(n).all(); } catch (e) { return []; } };

const reports = all('Find Reports Folder').map(i => i.json).filter(j => j && j.id && want(j.name, 'reports'));
const overflow = all('Find Overflow Folder').map(i => i.json).filter(j => j && j.id && want(j.name, 'leads overflow'));

const reportsId = reports.length ? String(reports[0].id) : '';
const overflowId = overflow.length ? String(overflow[0].id) : '';

return [{ json: { _reportsId: reportsId, _overflowFolderId: overflowId, _needCreate: (!overflowId && !!reportsId) } }];