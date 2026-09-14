// Check Campaign: the Hub Campaigns row for the target, the one place both doors agree the
// campaign is described. It carries the campaign's name (the receipt is named by it), the Hub
// row the receipt links to, and, on the Alta lane, the Pull-in URL: the audience webhook Alta
// hands out per campaign, which no API exposes, so it is operator-pasted state on the row.
// Alta refuses without it. PlusVibe only warns on a missing Hub row, exactly as before: its
// campaign is proven to exist by the workspace listing the door itself does before sending.
const sd = $getWorkflowStaticData('global'); const dk = 'deploy_' + $execution.id; const D = sd[dk];
if (!D.abort) {
  const rows = $input.all().map(i => i.json).filter(r => r && (r.id || r.fields));
  const hit = rows[0];
  if (!hit) {
    if (D.sender === 'Alta') { D.abort = 'campaign not in Hub'; D.errors.push('no Campaigns row with Campaign ID ' + D.target + '; sync or create it first'); }
    else { D.campName = D.target; D.warnings.push('no Hub Campaigns row for ' + D.target + '; receipt created without campaign link'); }
  } else {
    const f = hit.fields || hit;
    D.hubCampaignRid = hit.id || '';
    D.campName = String(f['Campaign'] || D.target);
    const seq = String((f['Sequencer'] && f['Sequencer'].name) || f['Sequencer'] || '');
    // The stage caps (standards/campaigns.md, Feeding). A campaign that carries a Stage is capped
    // here, on every run: the stage's daily cap on email (Test 1,000, Scale 500, Run 500), 150 on
    // any other channel, and never past the stage total minus the leads the campaign already holds
    // (Leads, synced). A launch row that names Max Rows can only lower the cap, never raise it. A
    // stage total already full sends nothing and says so. Killed is not fed. A row without a Stage
    // keeps the old meaning of blank Max Rows: unlimited.
    D.stage = String((f['Stage'] && f['Stage'].name) || f['Stage'] || '').trim();
    if (D.stage === 'Killed') { D.abort = 'campaign is Killed'; D.errors.push('campaign "' + D.campName + '" carries Stage Killed; a Killed campaign is not fed'); }
    else if (D.stage) {
      const STAGE_TOTAL = { Test: 1000, Scale: 3000, Run: null };
      const STAGE_DAILY = { Test: 1000, Scale: 500, Run: 500 };
      const channel = String((f['Channel'] && f['Channel'].name) || f['Channel'] || '').trim();
      const total = STAGE_TOTAL[D.stage];
      const held = Math.max(0, Math.floor(Number(f['Leads']) || 0));
      const daily = channel === 'Email' ? (STAGE_DAILY[D.stage] || 500) : 150;
      let cap;
      if (total === null || total === undefined) cap = daily;
      else if (held >= total) { cap = 0; D.capFull = true; D.warnings.push('stage ' + D.stage + ' total of ' + total + ' already held (' + held + ' leads in the campaign); nothing sent, the view keeps its rows'); }
      else cap = Math.min(daily, total - held);
      const asked = Math.max(0, Math.floor(Number(D.maxRows) || 0));
      D.maxRows = asked ? Math.min(asked, cap) : cap;
      D.capNote = D.capFull ? ('stage ' + D.stage + ' full') : ('stage ' + D.stage + ': cap ' + D.maxRows + ' (daily ' + daily + ', total ' + (total === null ? 'none' : total) + ', held ' + held + (asked ? ', asked ' + asked : '') + ')');
    }
    // Email Bison: like PlusVibe, the campaign's existence is proven by the door's own GET, so a
    // missing Hub row only warns; a Hub row sequenced by someone else is a wrong Target, refused.
    if (!D.abort && D.sender === 'Email Bison' && seq && seq !== 'Email Bison') { D.abort = 'not an Email Bison campaign'; D.errors.push('campaign "' + D.campName + '" is sequenced by ' + seq + ', not Email Bison'); }
    if (!D.abort && D.sender === 'Alta') {
      if (seq && seq !== 'Alta') { D.abort = 'not an Alta campaign'; D.errors.push('campaign "' + D.campName + '" is sequenced by ' + seq + ', not Alta'); }
      D.pullInUrl = String(f['Pull-in URL'] || '').trim();
      if (!D.abort && !/^https:\/\/api\.altahq\.com\/audience\/webhook\/[0-9a-f-]+\/pull-in-prospect$/i.test(D.pullInUrl)) {
        D.abort = 'no Pull-in URL'; D.errors.push('campaign "' + D.campName + '" has no valid Pull-in URL on its Campaigns row; paste the audience webhook from Alta');
      }
    }
  }
}
return [{ json: { abort: !!D.abort, crBase: D.crBase || '', target: D.target || '', metaUrl: 'https://api.airtable.com/v0/meta/bases/' + (D.crBase || 'missing') + '/tables' } }];
