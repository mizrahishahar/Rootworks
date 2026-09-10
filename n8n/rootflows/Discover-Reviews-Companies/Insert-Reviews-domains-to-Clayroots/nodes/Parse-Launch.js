// Parse Launch: the Apify run webhook is this Insert's launch row (ruled 2026-09-10). An intent
// Insert is fired by the scraper, so the payload IS the launch contract, and it is the minimum:
//
//   { "play": "<Hub Signals record id>", "resource": {{resource}} }
//
//   play      the Signals row. It carries Client (which resolves the Clayroots base), Signal Type,
//             Country and ICP. Nothing about a client lives here.
//   resource  the Apify run object. Only defaultDatasetId is read: the reviews this run scraped.
//
// Nothing else is read. No Tag: on a signal Insert the signal is the Signals link on the row, never
// a Tag (Rootflows, 2026-09-10). Dropped 2026-09-10 as dead: resource.defaultKeyValueStoreId and
// `sender`, neither of which any node downstream ever read.
//
// REFUSALS. A bad payload is an expected outcome, not a crash: every guard RETURNS config_ok false
// with what is missing, Config OK? routes to Build Guard Fail Log, and the Hub row says why.
const sd=$getWorkflowStaticData('global');
sd.runStartedAt=$now.toMillis();
const j=$input.first().json||{};
const q=j.query||{}; const b=j.body||{};
const pick=(k)=>{ const v=(b[k]!==undefined&&b[k]!=='')?b[k]:q[k]; return (v===undefined||v===null)?'':String(v).trim(); };
const res=b.resource||{};
const cfg={
  play: pick('play'),
  datasetId: String(res.defaultDatasetId||'')
};
const missing=[];
if(!/^rec[A-Za-z0-9]{14}$/.test(cfg.play)) missing.push('play (Hub Signals record id)');
if(!cfg.datasetId) missing.push('resource.defaultDatasetId (the Apify run\'s dataset of reviews)');
cfg.config_ok=(missing.length===0);
cfg.missing=missing;
cfg.guard='launch';
return [{ json: cfg }];
