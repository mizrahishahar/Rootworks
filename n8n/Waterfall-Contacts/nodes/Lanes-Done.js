// Lanes Done: one item, whichever way the loop ended (the batch items drained, or Stop? ended it
// after a batch whose paid tiers all died). Exactly one of those two paths fires per run, so the
// close runs exactly once.
return [{ json: { done: true } }];
