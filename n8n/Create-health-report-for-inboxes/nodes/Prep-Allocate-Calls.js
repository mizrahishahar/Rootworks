// Tags describe the fleet; they never move a campaign's senders. So every re-derivation of the
// gateway pool ends by asking Allocate inboxes in PlusVibe by tags to rewrite the campaigns.
const sd = $getWorkflowStaticData('global');
const results = sd.results || [];
if (!results.length) return [{ json: { _none: true } }];
return results.map(r => ({ json: { client: r.client, body: { client: r.client, tag: 'gateway' } } }));
