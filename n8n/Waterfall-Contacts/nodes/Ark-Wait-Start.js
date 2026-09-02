// Ark Wait Start: the writer loop ended (drained, or stopped after a batch whose paid tiers all
// died) and the AI-Ark lane has been fired, or was not needed. One item, the clock the wait for
// the lane's row runs on: Ark Rows Check gives it up to 25 minutes to land "<this execution>-ark".
return [{ json: { waitStartedAt: Date.now() } }];
