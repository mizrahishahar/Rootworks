// Parse Launch: the whole contract of Discover Hiring Companies (ruled 2026-09-10). This Insert is
// fired by a scraper payload, not by a launch row, so the payload IS the launch row and the same
// laws hold: the minimum, nothing dead, and a bad payload refused with a Hub row that says why.
//
// The payload, from the Apify run webhook:
//   { "signal": "recXXXXXXXXXXXXXX", "tag": "<optional>", "resource": {{resource}} }
//
//   signal    the Hub Signals record id. It resolves the Client (its link), and with it the
//             Clayroots base, plus Roles, Country, Max Employees and ICP. `play` is accepted as
//             the same key, so the task that already posts {play, resource} keeps firing.
//   resource  the Apify run object; its defaultDatasetId is the jobs, the source this Insert runs
//             on. `datasetId` is accepted directly for a hand-fire.
//   tag       optional, stamped on every company landed and passed to Enrich Contacts. A signal is
//             the Signals link, never a Tag, so this is free to be empty.
//
// Nothing else is read. Dropped as dead 2026-09-10: kvStoreId (never read), sender (the Trigger is
// always the scraper webhook).
const sd=$getWorkflowStaticData('global');
sd.runStartedAt=$now.toMillis();
const j=$input.first().json||{};
const q=j.query||{}; const b=j.body||{};
const pick=(k)=>{ const v=(b[k]!==undefined&&b[k]!=='')?b[k]:q[k]; return (v===undefined||v===null)?'':String(v).trim(); };
const res=b.resource||{};
const cfg={
  signal: pick('signal')||pick('play'),
  datasetId: String(res.defaultDatasetId||'')||pick('datasetId'),
  tag: pick('tag')
};
cfg.play=cfg.signal; // the key the rest of the run has always read
const missing=[];
if(!/^rec[A-Za-z0-9]{14}$/.test(cfg.signal)) missing.push('signal (the Hub Signals record id, "rec..."; sent as {signal} or {play})');
if(!cfg.datasetId) missing.push('resource.defaultDatasetId (the Apify run\'s dataset of jobs)');
cfg.config_ok=(missing.length===0);
cfg.missing=missing;
cfg.guard='launch';
return [{ json: cfg }];
