// Ark Requests: one item per AI-Ark export, one per company still under its cap. Since 2026-09-02
// this pass is the run's only AI-Ark traffic (one lane, never one per batch), so the whole global
// ceiling belongs to it: Ark Export paces 250 ms apart, four per second against a documented five
// per second and 300 per minute. Ark Windows hands them over fifty at a time so Ark Window Check
// can stop the submission when AI-Ark starts refusing instead of burning every remaining company.
return ($('Ark Plan').first().json.arkRequests||[]).map((r,i)=>({ json: { i: i, domain: r.domain, gap: r.gap, body: r.body } }));
