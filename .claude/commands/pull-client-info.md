# pull-client-info

Load one client and play back where they stand. Read-only, nothing else.

$ARGUMENTS names the client.

## Pull, in this order

1. **Registry row** - the address book: bases, workspace, channels, scheduler, routines.
2. **KB Files** for the client - the `overrides` row in full; the rest by name and type, opened only if the session's job needs them.
3. **Campaigns** rows - status, contacted, replies, positives, bounce, `Last Sent` (the real is-it-alive signal).
4. **Latest actions** - the client's most recent Automations runs: what ran, when, succeeded or failed, counts.
5. **Meetings** - the client-typed rows, newest first: date, title, summary headline.
6. **Pipeline pulse** - their Prospects: how many in play, newest positive replies, anything with a booked call ahead.

## Play it back

One tight brief: who they are and how they differ (overrides), what is live, what just happened, what is booked, and anything that looks off. Numbers over adjectives. Flag stale (nothing sent in days, a failed run, an unworked positive reply) without being asked.
