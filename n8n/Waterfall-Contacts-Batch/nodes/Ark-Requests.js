// Ark Requests: one item per AI-Ark export, paced 1 per second by the HTTP node.
return ($('Ark Plan').first().json.arkRequests||[]).map(r=>({ json: { domain: r.domain, gap: r.gap, body: r.body } }));
