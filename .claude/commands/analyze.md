# analyze

Read what a client's outreach is actually doing, and say what to change.

Loads `email-analyzer` for email, `linkedin-analyzer` for LinkedIn. They hold the bands and the judgment; this command runs them against live state.

## Read live, in this order

1. **Campaigns rows** for the client: sent, contacted, replies, positives, bounce, and `Last Sent` (Status can read ACTIVE while a campaign is stalled).
2. **Prospects** for the client: positive replies, meetings booked, what actually converted.
3. The sender itself when a number looks wrong. The Hub is synced, not live.

## The rule that outranks the rest

**Validate the denominator before you blame the copy.** Who was actually mailed? A campaign scoped "US 1-50" that mailed six other countries is not a copy problem, and diagnosing it as one rewrites good copy while the real defect keeps running. Count first, conclude second.

Related: an open rate is meaningless when open tracking was off; a reply rate is meaningless below roughly 500 sends. Say so instead of reporting a number that pretends to mean something.

## Done when

You have named: what is working, what is not, the single most likely cause with the count that supports it, and one recommended change. Where a metric cannot be trusted, say why rather than reporting it.
