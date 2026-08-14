const sd=$getWorkflowStaticData('global');
sd.runStartedAt=$now.toMillis();
sd.openRows=[];
sd.campSummary=[];
const cl=$('Get Client').first().json||{};
const cf=cl.fields||cl;
const clientRecId=cl.id||'';
sd.ctx={clientRecId, clientName: cf['Client']||''};
const ws=String(cf['PlusVibe Workspace ID']||'').trim();
const toId=(c)=> typeof c==='string'?c:((c&&c.id)||'');
const out=[];
for(const it of $input.all()){
  const j=it.json||{}; const f=j.fields||j;
  if(!j.id) continue;
  const cl2=Array.isArray(f.Client)?f.Client.map(toId):[];
  if(!cl2.includes(clientRecId)) continue;
  out.push({ json: { campaignRecId: j.id, campaignId: String(f['Campaign ID']||'').trim(), campaignName: f['Campaign']||'', pvWorkspace: ws } });
}
return out.filter(o=>o.json.campaignId);