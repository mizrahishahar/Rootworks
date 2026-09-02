// Ark Requests: one item per AI-Ark export, paced 4 per second by the HTTP node (AI-Ark allows
// 5 per second, 300 per minute).
return ($('Ark Plan').first().json.arkRequests||[]).map(r=>({ json: { domain: r.domain, gap: r.gap, body: r.body } }));
