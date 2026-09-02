// Build Receipt: the Lead Lists row, one per view into one campaign, refreshed by every run of the
// door (a daily feed hits the same row forever, zero new rows). List URL is the client-safe share
// link parsed from the table description; View Link is the internal deep link to the exact
// selector view that deployed, our debugging trail. Deployed is the confirmed member count.
// The stamp writes are collected here too, so a failed PATCH lands in the run's error list.
const sd = $getWorkflowStaticData('global'); const dk = 'deploy_' + $execution.id; const D = sd[dk];
try { if ($('Patch Rows').isExecuted) { for (const it of $('Patch Rows').all()) { const j = it.json || {}; if (j.error) D.errors.push('stamp write: ' + JSON.stringify(j.error).slice(0, 200)); } } } catch (e) {}
if (D.abort) { return [{ json: { _none: true, Name: '', Campaign: [], ViewLink: '', InternalLink: '', Deployed: 0 } }]; }
// The receipt is named by the CAMPAIGN on the PlusVibe lane, because that name is what clients
// filter the shared Campaigns view by; the Alta lane names it by the view it drank from. Both
// names are load-bearing for an existing row: the upsert matches on Name plus List URL.
D.receiptName = (D.sender === 'PlusVibe')
  ? (D.campName || D.target || ((D.tableName || D.tableId || 'table') + ' - ' + (D.view || 'view')))
  : ((D.tableName || D.tableId || 'table') + ' - ' + (D.view || 'view'));
D.viewLink = D.shareViewLink || '';
if (!D.viewLink) D.warnings.push('share link unresolved; receipt written without a client link');
let internalLink = '';
const stem = D.share || D.shareViewLink || '';
if (stem && D.tableId && D.viewId) internalLink = stem + '/' + D.tableId + '/' + D.viewId;
const deployed = (D.sender === 'PlusVibe') ? Number(D.deployed || 0) : Number(D.landed || 0);
return [{ json: { Name: D.receiptName, Campaign: D.hubCampaignRid ? [D.hubCampaignRid] : [], ViewLink: D.viewLink, InternalLink: internalLink, Deployed: deployed } }];
