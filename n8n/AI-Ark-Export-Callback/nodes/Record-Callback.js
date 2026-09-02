// Record Callback: AI-Ark's completion call for one export -> one data table row keyed by track
// id (Store Callback upserts it: DONE can land before the submitter recorded anything, so never
// update-only). The payload is read leniently (trackId / track_id / id, state / status,
// statistics.found and .total when present, nested under data or not) and kept whole in payload,
// so the first live call shows the true shape; found and total are -1 when the payload carries no
// statistics, and the ark pass then reads them once from the statistics endpoint. run is the ?run=
// query the submitter put on the webhook URL (the parent execution id), a convenience for reading
// a run's rows by hand. A call without a track id is still stored, under noid-<time>, never dropped.
const j=$input.first().json||{};
const body=(j.body&&typeof j.body==='object')?j.body:{};
const q=(j.query&&typeof j.query==='object')?j.query:{};
const d=(body.data&&typeof body.data==='object')?body.data:body;
const trackId=String(d.trackId||d.track_id||d.id||body.trackId||'').trim();
const state=String(d.state||d.status||body.state||'').toUpperCase();
const stats=(d.statistics&&typeof d.statistics==='object')?d.statistics:((body.statistics&&typeof body.statistics==='object')?body.statistics:null);
const num=(v)=>(v===null||v===undefined||v===''||!isFinite(Number(v)))?-1:Number(v);
const receivedAt=new Date().toISOString();
return [{ json: {
  trackId: trackId||('noid-'+receivedAt),
  state: state,
  found: stats?num(stats.found):-1,
  total: stats?num(stats.total):-1,
  run: String(q.run||'').trim(),
  receivedAt: receivedAt,
  payload: JSON.stringify(body).slice(0,4000)
} }];
