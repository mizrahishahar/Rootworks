const inp = $('Resolver Input').first().json || {};
let main = String(inp.driveMainFolderID || '').trim();
if (!main) {
  try { const r = $('Reg Lookup').first().json || {}; const f = r.fields || r; main = String(f.driveMainFolderID || '').trim(); } catch (e) {}
}
if (!main) return [{ json: { resolved: false, folderId: '1Y7t1fmXJme2JGtty0U12e1SfkgBLoc1O', reason: 'no driveMainFolderID for this client; using shared Leads folder' } }];
return [{ json: { resolved: true, mainFolderId: main } }];