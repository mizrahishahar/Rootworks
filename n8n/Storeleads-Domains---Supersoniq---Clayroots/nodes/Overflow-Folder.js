const sd = $getWorkflowStaticData('global');
const pick = (name) => { try { return $(name).first().json || {}; } catch (e) { return null; } };

let folderId = '';
let err = '';

const created = pick('Create Overflow Folder');
if (created && created.id) folderId = String(created.id);

const resolved = pick('Resolve Overflow Folder') || {};
if (!folderId && resolved._overflowFolderId) folderId = String(resolved._overflowFolderId);

if (!folderId) {
  err = resolved._reportsId
    ? 'Leads Overflow report not written: could not resolve or create the Leads Overflow folder under Reports.'
    : 'Leads Overflow report not written: could not resolve the Reports folder in the client Drive (check driveMainFolderID on the client record).';
}

sd.overflowFolderId = folderId;
sd.overflowError = err;
return [{ json: { _overflowFolderId: folderId, _overflowFolderError: err } }];