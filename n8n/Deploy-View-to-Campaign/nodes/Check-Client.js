const sd=$getWorkflowStaticData('global'); const dk='deploy_'+$execution.id; const D=sd[dk];
const r=($input.first()||{}).json||{};
const f=r.fields||r;
D.clientName=String(f['Client name']||f['Client']||'').trim();
D.ws=String(f['PlusVibe Workspace ID']||'').trim();
D.crBase=String(f['Clayroots Base ID']||'').trim();
// The registry carries the client's table ids (ClayrootsPeopleTableID / ClayrootsCompaniesTableID);
// Resolve Table reads the launch's table by that id first, by name on the base schema when absent.
const tl=String(D.table||'').trim().toLowerCase();
D.regTableId=String((tl==='companies'?f['ClayrootsCompaniesTableID']:(tl==='people'?f['ClayrootsPeopleTableID']:''))||'').trim();
// Shared-base link, used to build a deep link to the exact deployed view on the receipt.
D.share=String(f['Clayroots shareable link']||f['Clayroots Shareable Link']||'').trim().replace(/\/+$/,'');
if(!D.abort&&(!D.ws||!D.crBase)){ D.abort='client not deployable'; D.errors.push('client missing PlusVibe Workspace ID or Clayroots Base ID'); }
return [{json:{ws:D.ws||'none'}}];
