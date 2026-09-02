// Ark Wait Start: the writer loop ended (drained, or stopped after a batch whose paid tiers all
// died) and the AI-Ark lane has been fired, or was not needed. One item, the clock the wait for
// the lane's row runs on: Ark Rows Check gives it up to 60 minutes to land "<this execution>-ark"
// (raised from 25 on 2026-09-02). Running past that is allowed and is not a failure.
return [{ json: { waitStartedAt: Date.now() } }];
