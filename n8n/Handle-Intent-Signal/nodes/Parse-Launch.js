// Parse Launch: the Apify run webhook. Body: { play: <KB Files record id>, resource: <Apify run> }.
// Nothing else is read from the payload; the play row carries the play. The resource object
// carries the run's dataset (the jobs) and key-value store (the run's INPUT, the search roles).
const sd=$getWorkflowStaticData('global');
sd.runStartedAt=$now.toMillis();
const j=$input.first().json||{};
const q=j.query||{}; const b=j.body||{};
const pick=(k)=>{ const v=(b[k]!==undefined&&b[k]!=='')?b[k]:q[k]; return (v===undefined||v===null)?'':String(v).trim(); };
const res=b.resource||{};
const cfg={
  play: pick('play'),
  datasetId: String(res.defaultDatasetId||''),
  kvStoreId: String(res.defaultKeyValueStoreId||''),
  sender: pick('sender')||'webhook'
};
const missing=[];
if(!/^rec[A-Za-z0-9]{14}$/.test(cfg.play)) missing.push('play (KB Files record id)');
if(!cfg.datasetId) missing.push('resource.defaultDatasetId');
if(!cfg.kvStoreId) missing.push('resource.defaultKeyValueStoreId');
cfg.config_ok=(missing.length===0);
cfg.missing=missing;
cfg.guard='launch';
return [{ json: cfg }];
