return $input.all()
  .filter(item => (item.json.messages || []).length > 0)
  .map(item => {
    const messages = item.json.messages;
    const parent = Object.assign({}, messages[0]);
    parent.replies = messages.slice(1);
    return { json: parent };
  });