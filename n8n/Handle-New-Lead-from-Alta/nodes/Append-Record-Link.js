const out = [];
let url = '';
try { url = String($('Resolve Prospect').first().json.pipeline_url || ''); } catch(e) { url = ''; }
for (const it of $input.all()) {
  const j = (it && it.json) || {};
  try {
    if (!url) { out.push({ json: j }); continue; }
    const raw = j.blocksJson;
    if (typeof raw !== 'string' || !raw.trim()) { out.push({ json: j }); continue; }
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.blocks)) { out.push({ json: j }); continue; }
    parsed.blocks.push({ type: 'divider' });
    parsed.blocks.push({ type: 'section', text: { type: 'mrkdwn', text: '🔗  *<' + url + '|Open in Pipeline>*  to see the full prospect details' } });
    out.push({ json: Object.assign({}, j, { blocksJson: JSON.stringify(parsed) }) });
  } catch(e) { out.push({ json: j }); }
}
return out;