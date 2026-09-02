// Ark Requests: one item per AI-Ark export, paced 1 per second by the HTTP node: AI-Ark's ceiling
// (5 per second, 300 per minute) is global, and up to four of this batch's sibling ark passes run
// at once, one per closed writer batch.
return ($('Ark Plan').first().json.arkRequests||[]).map(r=>({ json: { domain: r.domain, gap: r.gap, body: r.body } }));
