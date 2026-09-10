// One shape from either door: the Marvin MCP tool call, or POST /webhook/allocate-inboxes-by-tag.
const j = $input.first().json || {};
const body = j.body || {};
const client = String(j.client || body.client || '').trim();
const tag = String(j.tag || body.tag || '').trim();
// Matches the Hub row whether the caller wrote "Dave.io", "dave io" or the record id.
const clientSlug = client.replace(/[\s.]/g, '').toLowerCase();
return [{ json: { client, tag, clientSlug } }];
