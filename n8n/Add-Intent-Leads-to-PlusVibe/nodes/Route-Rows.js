const out=[];
for(const it of $input.all()){
  const p=it.json||{};
  if(!p.recordId) continue;
  const f=p.row||{};
  const email=String(f['Final Email']||'').trim();
  const campaignId=String(f['Email Campaign']||'').trim();
  const otherDone=!String(f['LinkedIn Campaign']||'').trim()||!!String(f['LinkedIn Routed At']||'').trim();
  const name=String(f['Name']||email||'').trim();
  if(!campaignId || /^https?:\/\//i.test(campaignId)){
    out.push({ json: { action:'failed_precheck', reason:'Email Campaign is not a PlusVibe campaign id', recordId:p.recordId, baseId:p.baseId, tableId:p.tableId, clientRecId:p.clientRecId, clientName:p.clientName, name } });
    continue;
  }
  if(!p.pvWorkspace){
    out.push({ json: { action:'failed_precheck', reason:'Client row has no PlusVibe Workspace ID', recordId:p.recordId, baseId:p.baseId, tableId:p.tableId, clientRecId:p.clientRecId, clientName:p.clientName, name } });
    continue;
  }
  if(!email){
    out.push({ json: { action:'no_email', recordId:p.recordId, baseId:p.baseId, tableId:p.tableId, clientRecId:p.clientRecId, clientName:p.clientName, name } });
    continue;
  }
  const pv_body={
    workspace_id: p.pvWorkspace,
    campaign_id: campaignId,
    skip_if_in_workspace: false,
    is_overwrite: true,
    leads: [ {
      email: email,
      first_name: f['first_name']||'',
      last_name: f['last_name']||'',
      company_name: f['Company']||'',
      custom_variables: {
        event_type: f['Event Type']||'',
        signal_detail: f['Signal Detail']||''
      }
    } ]
  };
  out.push({ json: { action:'enroll', otherDone, pv_body, recordId:p.recordId, baseId:p.baseId, tableId:p.tableId, clientRecId:p.clientRecId, clientName:p.clientName, name } });
}
return out;