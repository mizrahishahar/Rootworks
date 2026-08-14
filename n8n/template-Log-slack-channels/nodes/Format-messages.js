const names = {};
$input.all().forEach(item => {
  const m = item.json;
  names[m.id] = m.real_name || (m.profile && m.profile.display_name) || m.name || m.id;
});
const messages = $('Attach replies to parent').all().reverse();
const date = new Date().toISOString().split('T')[0];
const resolve = (t) => String(t || '').replace(/<@([A-Z0-9]+)>/g, (_, id) => '@' + (names[id] || id));
const lines = messages.map(m => {
  const name = names[m.json.user] || m.json.user || 'Unknown';
  const text = resolve(m.json.text);
  let block = '**' + name + '**: ' + text;
  const replies = m.json.replies || [];
  if (replies.length > 0) {
    const replyLines = replies.map(r => {
      const rName = names[r.user] || r.user || 'Unknown';
      const rText = resolve(r.text);
      return '  > **' + rName + '**: ' + rText;
    });
    block += '\n' + replyLines.join('\n');
  }
  return block;
}).join('\n\n');
const content = '# ' + date + ' — Slack\n\n' + lines;
return [{ json: { content, filename: date + ' - Slack.md' } }];