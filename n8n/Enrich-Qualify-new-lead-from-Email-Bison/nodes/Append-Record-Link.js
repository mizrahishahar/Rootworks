const src = $input.first().json || {};
let payload = null;
try { payload = JSON.parse(src.blocksJson || 'null'); } catch(e) { payload = null; }
if (!payload || !Array.isArray(payload.blocks)) return [{ json: src }];
let url = '';
try { url = String($('Resolve Prospect').first().json.pipeline_url || ''); } catch(e) { url = ''; }
if (!url) return [{ json: src }];
try {
  payload.blocks.push({ type: 'context', elements: [{ type: 'mrkdwn', text: '<' + url + '|Open in Pipeline>' }] });
  return [{ json: Object.assign({}, src, { blocksJson: JSON.stringify(payload) }) }];
} catch(e) { return [{ json: src }]; }