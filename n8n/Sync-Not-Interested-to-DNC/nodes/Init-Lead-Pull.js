// Init Lead Pull: two paged reads of the workspace's leads, the ones labeled NOT_INTERESTED and the
// ones whose status is UNSUBSCRIBED (GET /api/v1/lead/workspace-leads has no date filter; the
// watermark is applied on modified_at in Compute Domains). 1000 per page (the endpoint allows up to
// 10000), pages from 1, until a short page. Emits the first request; Collect Leads drives the rest.
const sd=$getWorkflowStaticData('global');
const c=sd.clients[sd.currentClient];
const LIMIT=1000;
sd.pull={ queue:[{ key:'label', value:'NOT_INTERESTED' },{ key:'status', value:'UNSUBSCRIBED' }], idx:0, page:1, attempts:0, limit:LIMIT, leads:[], started:Date.now() };
const q=sd.pull.queue[0];
const pvUrl='https://api.plusvibe.ai/api/v1/lead/workspace-leads?workspace_id='+encodeURIComponent(c.ws)+'&'+q.key+'='+q.value+'&limit='+LIMIT+'&page=1';
return [{ json:{ pvUrl, wait:0 } }];
