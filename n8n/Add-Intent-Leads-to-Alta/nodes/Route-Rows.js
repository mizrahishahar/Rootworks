const out=[];
for(const it of $input.all()){
  const p=it.json||{};
  if(!p.recordId) continue;
  const f=p.row||{};
  const email=String(f['Final Email']||'').trim();
  const linkedinUrl=String(f['LinkedIn URL']||'').trim();
  const url=String(f['LinkedIn Campaign']||'').trim();
  const otherDone=!String(f['Email Campaign']||'').trim()||!!String(f['Email Routed At']||'').trim();
  const name=String(f['Name']||email||linkedinUrl||'').trim();
  if(!/^https?:\/\//i.test(url)){
    out.push({ json: { action:'failed_precheck', reason:'LinkedIn Campaign is not a valid URL', recordId:p.recordId, baseId:p.baseId, tableId:p.tableId, clientRecId:p.clientRecId, clientName:p.clientName, name } });
    continue;
  }
  if(!email && !linkedinUrl){
    out.push({ json: { action:'no_email', recordId:p.recordId, baseId:p.baseId, tableId:p.tableId, clientRecId:p.clientRecId, clientName:p.clientName, name } });
    continue;
  }
  const dom=String(f['Domain']||'').trim();
  const companyWebsite=dom?(/^https?:\/\//i.test(dom)?dom:'https://'+dom):'';
  const body={
    firstName: f['first_name']||'',
    lastName: f['last_name']||'',
    company: f['Company']||'',
    extraInfoData: {
      'Source': 'Apify Intent Scrape',
      'Signal': f['Event Type']||'',
      'Signal Detail': f['Signal Detail']||'',
      'Sourced At': f['detected_at']||''
    }
  };
  if(companyWebsite) body.companyWebsite=companyWebsite;
  if(email) body.email=email;
  if(linkedinUrl) body.linkedinUrl=linkedinUrl;
  out.push({ json: { action:'enroll', otherDone, campaign_url:url, enroll_body:body, recordId:p.recordId, baseId:p.baseId, tableId:p.tableId, clientRecId:p.clientRecId, clientName:p.clientName, name } });
}
return out;