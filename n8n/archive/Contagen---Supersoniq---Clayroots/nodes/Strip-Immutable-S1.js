// Write-boundary standard, Operator ruling 2026-08-12. Removes everything retired from the contract
// so the payload can never resurrect a banned column or 422 on a fresh table that lacks it:
// Build Date (computed), Run ID (retired), company_clean (cleaning lives on Company itself),
// Score / Similarity / Valid / Start Date / Redirect Domain / Update Date (CSV noise, banned),
// State Full folds into State (full name wins), Source maps to Contact Source (provenance).
const BAN=['Build Date','Run ID','company_clean','Score','Similarity','Valid','Start Date','Redirect Domain','Update Date','MV'];
return $input.all().map(i => { const j = { ...i.json };
  if(j['State Full']!==undefined){ if(String(j['State Full']||'').trim()) j['State']=j['State Full']; delete j['State Full']; }
  if(Object.prototype.hasOwnProperty.call(j,'Source')){ if(j['Contact Source']===undefined) j['Contact Source']=j.Source; delete j.Source; }
  for(const k of BAN) delete j[k];
  return { json: j }; });