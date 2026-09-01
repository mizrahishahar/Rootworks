// CG Requests: one item per ContaGen call (one per band group per 250 domains).
return ($('Plan Batch').first().json.cgRequests||[]).map(r=>({ json: { body: r.body, domains: r.domains, cap: r.cap } }));
