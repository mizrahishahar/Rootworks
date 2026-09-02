// Check Client: the registry row into the run's state. The ClayRoots base is the address of
// the table the view lives on; nothing about a client is hardcoded anywhere in this machine.
const sd=$getWorkflowStaticData('global'); const dk='deploy_'+$execution.id; const D=sd[dk];
if(!D.abort){
  const r=($input.first()||{}).json||{};
  const f=r.fields||r;
  D.clientName=String(f['Client']||'').trim();
  D.crBase=String(f['Clayroots Base ID']||'').trim();
  // The registry carries the client's table ids (ClayrootsPeopleTableID / ClayrootsCompaniesTableID);
  // Resolve Table reads the launch's table by that id first, by name on the base schema when absent.
  const tl=String(D.table||'').trim().toLowerCase();
  D.regTableId=String((tl==='companies'?f['ClayrootsCompaniesTableID']:(tl==='people'?f['ClayrootsPeopleTableID']:''))||'').trim();
  if(!/^app[A-Za-z0-9]{14}$/.test(D.crBase)){ D.abort='no ClayRoots base'; D.errors.push('client "'+(D.clientName||D.clientId)+'" has no valid Clayroots Base ID'); }
}
return [{json:{abort:!!D.abort, target:D.target||''}}];
