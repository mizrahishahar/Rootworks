// Ark Wait Start: the writer loop ended (drained, or stopped after a batch whose paid tiers all
// died). One item, the clock the wait for the ark rows runs on: Ark Rows Check gives the ark
// passes already in flight up to 25 minutes to land their rows.
return [{ json: { waitStartedAt: Date.now() } }];
