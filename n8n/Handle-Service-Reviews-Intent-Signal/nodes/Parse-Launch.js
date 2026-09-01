// Parse Launch: the Apify run webhook. Body: { play: <Signals record id>, resource: <Apify run> }.
// Nothing else is read from the payload; the Signals row carries the config. The resource object
// carries the run's dataset (the reviews). Reused verbatim from Handle Hiring Intent Signal.
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
if(!/^rec[A-Za-z0-9]{14}$/.test(cfg.play)) missing.push('play (Signals record id)');
if(!cfg.datasetId) missing.push('resource.defaultDatasetId');
cfg.config_ok=(missing.length===0);
cfg.missing=missing;
cfg.guard='launch';
return [{ json: cfg }];
