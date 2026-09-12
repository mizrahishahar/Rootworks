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
    // The stage caps (Campaigns Manager standard, 2026-09-12). A launch row that leaves Max Rows
    // blank on a campaign that carries a Stage gets its cap here: the sender's daily cap, or the
    // stage total minus the leads the campaign already holds (Leads, synced by the manager's lanes),
    // whichever is smaller. A stage total already full sends nothing and says so; a row without a
    // Stage keeps the old meaning of blank, unlimited. A row that names Max Rows keeps its number.
    D.stage = String((f['Stage'] && f['Stage'].name) || f['Stage'] || '').trim();
    if (!D.maxRows && D.stage) {
      const STAGE_TOTAL = { Test: 1000, Scale: 3000, Run: null };
      const DAILY_CAP = { 'PlusVibe': 1000, 'Email Bison': 1000, 'Alta': 150, 'HeyReach': 150 };
      const total = STAGE_TOTAL[D.stage];
      const held = Math.max(0, Math.floor(Number(f['Leads']) || 0));
      const daily = DAILY_CAP[D.sender] || 1000;
      if (total === null || total === undefined) D.maxRows = daily;
      else if (held >= total) { D.maxRows = 0; D.capFull = true; D.warnings.push('stage ' + D.stage + ' total of ' + total + ' already held (' + held + ' leads in the campaign); nothing sent, the view keeps its rows'); }
      else D.maxRows = Math.min(daily, total - held);
      D.capNote = D.capFull ? ('stage ' + D.stage + ' full') : ('stage ' + D.stage + ': cap ' + D.maxRows + ' (daily ' + daily + ', total ' + (total === null ? 'none' : total) + ', held ' + held + ')');
    }
    // Email Bison: like PlusVibe, the campaign's existence is proven by the door's own GET, so a
    // missing Hub row only warns; a Hub row sequenced by someone else is a wrong Target, refused.
    if (D.sender === 'Email Bison' && seq && seq !== 'Email Bison') { D.abort = 'not an Email Bison campaign'; D.errors.push('campaign "' + D.campName + '" is sequenced by ' + seq + ', not Email Bison'); }
    if (D.sender === 'Alta') {
      if (seq && seq !== 'Alta') { D.abort = 'not an Alta campaign'; D.errors.push('campaign "' + D.campName + '" is sequenced by ' + seq + ', not Alta'); }
      D.pullInUrl = String(f['Pull-in URL'] || '').trim();
      if (!D.abort && !/^https:\/\/api\.altahq\.com\/audience\/webhook\/[0-9a-f-]+\/pull-in-prospect$/i.test(D.pullInUrl)) {
        D.abort = 'no Pull-in URL'; D.errors.push('campaign "' + D.campName + '" has no valid Pull-in URL on its Campaigns row; paste the audience webhook from Alta');
      }
    }
  }
}
return [{ json: { abort: !!D.abort, crBase: D.crBase || '', target: D.target || '', metaUrl: 'https://api.airtable.com/v0/meta/bases/' + (D.crBase || 'missing') + '/tables' } }];
