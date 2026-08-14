const sd=$getWorkflowStaticData('global');
sd.runStartedAt=$now.toMillis();
const j=$input.first().json||{};
const q=j.query||{}; const b=j.body||{};
const pick=(k)=>{ const v=(b[k]!==undefined&&b[k]!=='')?b[k]:q[k]; return (v===undefined||v===null)?'':String(v).trim(); };
const list=(v,def)=>{ const s=String(v||'').trim(); return (s?s.split(','):def).map(x=>String(x).trim()).filter(Boolean); };
const cfg={
  client: pick('client'),
  table: pick('table'),
  campaign_url: pick('campaign'),
  sender: pick('sender')||'webhook',
  max_headcount: parseInt(pick('max_headcount')||pick('maxHeadcount'),10)||200,
  country: pick('country')||'US',
  sq_seniority: list(pick('sq_seniority')||pick('sqSeniority'),['C-Suite','VP','Founder','Owner','President','EVP / SVP','Head','Director']),
  sq_function: list(pick('sq_function')||pick('sqFunction'),['Executive','Engineering','R&D','Technology']),
  event_type: pick('event_type')||pick('eventType')||'became_hiring',
  per_company_limit: parseInt(pick('per_company_limit')||pick('perCompanyLimit'),10)||5,
  datasetId: (b.resource&&b.resource.defaultDatasetId)||''
};
const missing=[];
if(!cfg.client) missing.push('client');
if(!cfg.table) missing.push('table');
if(!cfg.campaign_url) missing.push('campaign');
else if(!/^https?:\/\//i.test(cfg.campaign_url)) missing.push('campaign (not a URL)');
cfg.config_ok=(missing.length===0);
cfg.missing=missing;
return [{ json: cfg }];