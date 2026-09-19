// Plan Calls: the MCP calls this action needs, one item each. The MCP node runs them in order,
// paced, and Shape Answer reads them all back.
//   get_thread    four list_linkedin_messages calls, one per type, the same four the campaign sync
//                 rebuilds a thread from (campaign, received, manual, reply_agent).
//   get_prospect  get_prospect; the person read follows once its personId is known.
//   send_reply    one send_linkedin_message. One call per message, never a loop.
// The request is read off Alta Token Gate, not off $input: the node before this one is the token
// store, whose output is the data table row (it planned a send on a get_thread until 2026-09-19).
// A send is planned ONLY on an explicit send_reply; anything else falls through to the thread read,
// so a mistake here can never put a message on LinkedIn.
// campaignId and repId ride as null when the caller did not give them: the message tools accept
// nulls and answer workspace-wide for the prospect, which is what the Inbox has to hand.
// tag must be null, never an empty string: an empty tag silently answers nothing (paid for 2026-08-01).
const r = $('Alta Token Gate').first().json || {};
const nz = (v) => (v ? v : null);
const call = (id, name, args) => ({ json: { _id: id, callBody: { jsonrpc: '2.0', id, method: 'tools/call', params: { name, arguments: args } } } });

if (r.action === 'send_reply') {
  const args = { prospectId: r.prospectId, body: r.body };
  if (r.campaignId) args.campaignId = r.campaignId;
  if (r.repId) args.repId = r.repId;
  if (!args.prospectId || !args.body) throw new Error('send_reply reached Plan Calls without a prospectId and a body; nothing was sent');
  return [call(1, 'send_linkedin_message', args)];
}
if (r.action === 'get_prospect') return [call(1, 'get_prospect', { prospectId: r.prospectId })];
const out = [];
let i = 1;
for (const type of ['campaign', 'received', 'manual', 'reply_agent']) {
  out.push(call(i++, 'list_linkedin_messages', { prospectId: r.prospectId, campaignId: nz(r.campaignId), repId: nz(r.repId), type, tag: null, unread: false }));
}
return out;
