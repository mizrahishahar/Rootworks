# Lead Archive — 2026-06-23 (pre-teardown freeze)

Frozen before deleting the two original Piper campaigns (BL `6a2ebfb65619a7a032047ca3`, Precon `6a2ebfb6bfcb0d66add2d94f`). Campaigns deleted clean (no archive, no PlusVibe list). 60 warmed inboxes untouched.

## The split (2,038 total)

- **contacted-771-EXCLUDE.csv** — got the broken/old copy 06-16 to 06-19. DO NOT re-mail soon; recycle in 4-6 weeks on fresh copy. Breakdown: 696 mid-sequence, 50 completed, 25 BOUNCED (dead addresses).
- **not-contacted-1267-CLEAN.csv** — never touched. Reusable immediately on the rebuild.
- **all-2038-raw.json** — full raw backup.

## How to distinguish corrupted (contacted) leads

`status != NOT_CONTACTED`  (identical to `last_sent_at != null`). Clean = `status == NOT_CONTACTED`.

## Why torn down

Launched 7 days early mid-warmup on un-synced OLD copy carrying the {{State}} merge-tag bug (tag named {{State}}, data lived in custom_state -> literal {{State}} shipped on all 1,080 sends, 194 in subject lines). Copy also judged weak. Infra never damaged (placement held ~98%). Full restart chosen.
