const BAN=['Build Date','Run ID','company_clean','Score','Similarity','Valid','Start Date','Redirect Domain','Update Date','MV'];
return $input.all().map(i => { const j = { ...i.json };
  for(const k of BAN) delete j[k];
  return { json: j }; });