// SQ Requests: one item per Supersoniq call (one per band group, up to 1,000 domains each).
return ($('Plan Batch').first().json.sqRequests||[]).map(r=>({ json: { body: r.body, domains: r.domains, cap: r.cap } }));
