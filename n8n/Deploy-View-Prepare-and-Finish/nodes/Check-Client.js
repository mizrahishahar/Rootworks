// Check Client: the registry row into the run's state. The ClayRoots base is the address of the
// table the view lives on; nothing about a client is hardcoded anywhere in this machine. The
// PlusVibe lane also needs the workspace the campaign lives in; the Alta lane does not, its
// address is the campaign's own Pull-in URL.
const sd = $getWorkflowStaticData('global'); const dk = 'deploy_' + $execution.id; const D = sd[dk];
if (!D.abort) {
  const r = ($input.first() || {}).json || {};
  const f = r.fields || r;
  D.clientName = String(f['Client name'] || f['Client'] || '').trim();
  D.ws = String(f['PlusVibe Workspace ID'] || '').trim();
  D.crBase = String(f['Clayroots Base ID'] || '').trim();
  // The registry carries the client's table ids (ClayrootsPeopleTableID / ClayrootsCompaniesTableID);
  // Plan Base reads the launch's table by that id first, by name on the base schema when absent.
  const tl = String(D.table || '').trim().toLowerCase();
  D.regTableId = String((tl === 'companies' ? f['ClayrootsCompaniesTableID'] : (tl === 'people' ? f['ClayrootsPeopleTableID'] : '')) || '').trim();
  // Shared-base link, used to build a deep link to the exact deployed view on the receipt.
  D.share = String(f['Clayroots shareable link'] || f['Clayroots Shareable Link'] || '').trim().replace(/\/+$/, '');
  if (D.sender === 'PlusVibe') {
    if (!D.ws || !/^app[A-Za-z0-9]{14}$/.test(D.crBase)) { D.abort = 'client not deployable'; D.errors.push('client missing PlusVibe Workspace ID or Clayroots Base ID'); }
  } else if (!/^app[A-Za-z0-9]{14}$/.test(D.crBase)) {
    D.abort = 'no ClayRoots base'; D.errors.push('client "' + (D.clientName || D.clientId) + '" has no valid Clayroots Base ID');
  }
}
return [{ json: { abort: !!D.abort, target: D.target || '' } }];
