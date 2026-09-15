// Plan Feed: the standard's Feeding rule (standards/campaigns.md), applied after today's Stage
// moves. Every campaign in play with a Live View ID gets one deploy row on the Hub Automations
// table, which fires that sender's deploy door exactly as a hand-launched row does. No Max Rows:
// the deploy caps the run from the Stage. A campaign killed today is not fed; a campaign that
// already has a deploy row dated today is not fed twice, so a rerun is safe. The rows are the
// launch rows themselves; the doors write the outcome onto them.
const PLAN = { 'PlusVibe': { automation: 'Deploy View to PlusVibe Campaign', dedupe: 'Active-only' }, 'Alta': { automation: 'Deploy View to Alta Campaign' }, 'Email Bison': { automation: 'Deploy View to Email Bison Campaign' } };
const sd = $getWorkflowStaticData('global');
const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jerusalem' });
const feeds = [];
if (sd.abort) { sd.feeds = []; return [{ json: { _none: true } }]; }
for (const R of sd.results || []) {
  const inPlay = [].concat(R.testProgress, R.scaleProgress, R.run, R.testReady.filter(c => c.verdict !== 'killed'));
  for (const c of inPlay) {
    if (!c.liveView) continue;
    const plan = PLAN[c.sender];
    if (!plan) { sd.failed.push(R.client + ': "' + c.name + '" is on ' + c.sender + ', which has no deploy door; not fed'); continue; }
    if (!c.campaignId) { sd.failed.push(R.client + ': "' + c.name + '" has no Campaign ID; not fed'); continue; }
    const fedOn = c.lastFed ? new Date(c.lastFed).toLocaleDateString('en-CA', { timeZone: 'Asia/Jerusalem' }) : '';
    if (fedOn === today) { c.tags.push('FED TODAY'); continue; }
    const row = { 'Automation': plan.automation, 'Table': c.table || 'People', 'View': c.liveView, 'Target': c.campaignId, 'Trigger': 'schedule' };
    if (plan.dedupe) row['Dedupe Mode'] = plan.dedupe;
    if (c.clientId) row['Client'] = [c.clientId];
    feeds.push({ rid: c.rid, client: R.client, name: c.name, row });
    R.fed.push(c);
  }
}
sd.feeds = feeds;
if (!feeds.length) return [{ json: { _none: true } }];
return feeds.map(f => ({ json: f.row }));
