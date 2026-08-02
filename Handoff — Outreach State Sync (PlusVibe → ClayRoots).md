---
Type: Handoff
status: open
origin: Dave.io email Analysis session, 2026-08-02
vertical: infrastructure
scope: machine-wide (every client running PlusVibe/Alta + ClayRoots)
---

# Handoff — Outreach State Sync (PlusVibe → ClayRoots)

A standing sync that writes each contact's real outreach history from the sender back onto their ClayRoots row, so the base can answer "who have we already touched, how many times, in which campaigns" as a fact instead of an inference. Scoped machine-wide; discovered on Dave.io.

---

## 1. Origin of the problem

Found during the 2026-08-02 Dave.io email Analysis. We decided to pull 2,307 never-contacted leads out of the dying `17.7.26 - Founder-CEO` campaign and route them to the new `2026-08-01 Decision Makers - Feedback` campaign. Doing that surfaced the structural gap:

- **PlusVibe knows who has been contacted. ClayRoots does not.** Nothing writes send-state back to the base.
- The `not-yet-contacted` views on the Dave build tables are manual assertions, true only as of the last hand-touch.
- "~4,200 emailable contacts never loaded into any campaign" was derived arithmetic (10,628 with Final Email minus 6,439 ever loaded into PV), not a fact the base can state.
- Every future list build guesses at overlap with past outreach. At 2, 3, 10 clients this compounds into re-emailing people and unmeasurable list exhaustion.

The one-off fix for Dave (export the 2,307, stamp them by hand) works exactly once. This handoff is the standing fix.

## 2. Why it matters

- **List building:** exclusion of prior contacts becomes a view filter, not a CSV reconciliation.
- **Analysis:** "have we exhausted the leads?" becomes answerable per table, live.
- **Safety:** prevents re-enrolling someone mid-sequence or re-opening on a person a sibling campaign burned last month.
- **Client trust:** "how many campaigns / messages has this person had" is a question the client will eventually ask; today we cannot answer it.

## 3. Ground truth established in the session (verified live, 2026-08-02)

- **A PlusVibe lead is a (campaign × email) pair, not a person.** Lead records carry per-campaign state: `campaign_id`, `camp_name`, `status`, `current_step`, `sent_step`, `total_steps`, `is_completed`, `replied_count`, `opened_count`, `last_sent_at`, `next_email_time`, `email_acc_name`, `bounce_msg`, `modified_at`. Same person in 3 campaigns = 3 lead records. (Inferred from payload + tool signatures; see validation gate V1.)
- `sent_step` = sequence steps actually fired to that lead in that campaign. A step is one email; variations (1A/1B…) are alternatives, not extras. Campaign-level sanity check against numbers pulled this session: CTO 967 leads × 3 steps ceiling = 2,901 vs sent_count 2,849 (gap = reply/bounce stops) ✔; VP 945 vs 923 ✔.
- `modified_at` bumps on send (verified on a live lead: modified_at == last_sent_at).
- Dave workspace: `6a4a3ab6d70a593c3e3b75e5`. 60 inboxes / 30 domains (20 domains / 40 inboxes attached to campaigns, 10 domains idle-warmed). 6,439 leads ever loaded, all-time.
- Airtable **cannot link records across bases** (hard product limit). **Airtable Sync** (Business+ plan) can mirror the Hub Campaigns table into a client base as a read-only synced table, which CAN then be referenced by native linked-record fields inside that base.
- Hub Campaigns table (`tblbVPakE4n16ob7Y` in `appQG6dK0FIOhTxOl`) already holds one row per campaign instance with `Campaign ID` as "THE upsert key for all writers", written nightly by Sync PlusVibe Campaigns + Sync Alta Campaigns. This is the hinge — nothing new invented.
- DiscoLike/DiscoGen is NOT part of this sync (explored and set aside: personas need persona_id resolution we don't have; personalization goes through Airtable AI fields per Operator decision 2026-08-02).

## 4. The design

### Fields written on every contact row (added to the waterfall's standard template so new build tables inherit them)

| Field | Type | Computed as |
|---|---|---|
| Campaigns | linked → "Campaigns [Synced]" (fallback: text of Campaign IDs) | all campaigns this email appears in |
| Campaigns Count | number | count(lead records) |
| Messages Sent | number | Σ sent_step across lead records |
| Last Contacted | date | max(last_sent_at) |
| Last Campaign | text | camp_name of that max |
| Outreach Status | single select | precedence: UNSUBSCRIBED > BOUNCED > REPLIED > IN_SEQUENCE > COMPLETED > NEVER_CONTACTED |
| Replied | checkbox | any record with replied_count > 0 |
| Bounce Reason | text | latest non-empty bounce_msg |
| Synced At | date | run timestamp |

Deliberately NOT stored: current_step, next_email_time, per-inbox detail — hourly-changing state lives in the sender (CLAUDE.md: state lives in the tools).

Operator decisions locked: **fields on contact rows, no new ledger table** (accepted trade-offs: duplicate history when a person appears in two build tables; history dies with an archived table). **Airtable AI fields accepted for contact-level personalization** (separate concern, not this sync).

### Architecture

```
Hub Campaigns (source of truth, nightly-upserted already)
      │ Airtable Sync mirror (Business+; read-only synced table per client base)
      ▼
ClayRoots base ── "Campaigns [Synced]" ◄── linked field on contact tables
      ▲
n8n nightly "Sync PV Leads" (sibling of Sync PlusVibe Campaigns):
  1. Registry (Hub Clients) → workspace_id + Clayroots Base ID per client
  2. Per campaign: pull changed leads (modified_at > watermark − 24h overlap)
  3. Group by lower(trim(email)) in memory → NOMINATE emails
  4. For each nominated email: re-pull its ENTIRE lead history (all campaigns) → recompute all aggregates from zero
  5. Upsert by lower(trim({Final Email})) into every table in the base that has a Final Email field (10 records/request)
  6. Reconcile + log to Hub AUTOMATIONS (Records In/Out/Errors)
```

### The core correctness ideas (the "why believe it" section)

1. **Nomination vs computation are different sets.** The watermark only decides WHO to refresh; the computation always uses the email's FULL lead history. Every number ever written is a full-history number — no partial writes exist in the design. Untouched rows are complete because their truth didn't change (sends bump modified_at → nomination).
2. **Full recompute, never increments.** `Messages Sent += 1` corrupts forever on a double-fire; recompute-and-overwrite is idempotent. Any run can be repeated after any failure.
3. **Watermark + 24h overlap.** Missed night → next run catches up automatically. Over-processing is free (idempotent), under-processing impossible.
4. **One writer.** These fields are written by this workflow only. Manual stamps (e.g., the Dave 2,307) must write the same fields once, then hands off.
5. **Standing invariant, checked every run:** Σ sent_step per campaign == campaign.sent_count (PlusVibe's own counter). Divergence → run flags itself Failed with both numbers. The design is not unbreakable — it is *incapable of being silently wrong*.
6. **Quarterly no-watermark pass:** full recompute of every lead (6,439 today, ~650 write requests), heals anything ever missed.
7. **Graceful degradation:** scalars first, links second. If plan tier blocks Airtable Sync, the linked field degrades to a Campaign ID text field; everything else survives unchanged.

### Scale math (why row count is not the constraint)

Cost is O(touched set), never O(table size). Airtable: 5 req/s per base, reads 100/page, writes 10/request, upsert-by-field needs no read-first. Nightly delta ≈ 400–900 leads ≈ ≤100 requests regardless of whether the base holds 5k or 50k rows. Identifying a 2,307-email set in a base: chunked OR() filters at 100 emails/request = 72 reads — identical at 3×5k and 3×50k rows.

**The real scale wall is the Airtable base record cap** (50k Team / 125k Business per base). Dave base is already at ~39,085 records (~78% of a Team cap). This bites before any throughput does. Needs: plan-tier check + retention/archive policy for dead build tables (and note: archiving a table kills its rows' outreach history — the accepted trade-off of no-ledger; the quarterly pass cannot resurrect it).

## 5. Validation gates — MUST be proven before building (first hour, read-only calls)

- **V1 — lead-by-email query shape.** `list_all_leads` filtered by email alone FAILED twice in the origin session (with campaign_id it works). Determine the reliable shape. Fallback (probably the real implementation): pull each campaign's changed leads wholesale and group in memory — no per-email queries at all. 4 campaigns today, rarely >10 live per client.
- **V2 — modified_at bump coverage.** Verified for sends. Verify for replies, bounces, unsubscribes, manual status changes. Anything that changes an aggregate must bump it, or the nightly needs a secondary nomination source.
- **V3 — sent_step vs bounces.** Does a bounced step increment sent_step? The invariant check reveals it day one either way; spec the intended semantics after observing.
- **V4 — plan tier.** Business+ on both Hub and client bases? Decides linked-records vs text fallback, and the 50k vs 125k record cap.
- **V5 — uniqueness assumption.** Confirm one lead per (campaign × email) — i.e., PV dedupes within a campaign.

## 6. Worries raised and where they landed

| Worry (Operator) | Resolution |
|---|---|
| "20k rows per ClayRoots, 30–50k coming" | Cost is O(touched), not O(table); real wall is the base record cap → V4 + retention policy |
| "Sounds fucking complex" | One n8n workflow, ~10–12 nodes, same species as Sync PlusVibe Campaigns / Sync Alta Campaigns (same registry, auth, upsert, Hub logging). The risk is concentrated in V1–V3, all testable read-only in an hour |
| "How do you discover all tables / campaigns?" | Campaigns: enumerated via list_campaigns(workspace_id), registry-driven. Tables: by schema — every table in the client base with a Final Email field. No hardcoded lists |
| "Incomplete info if you only read since last run" | Nomination/computation split (§4.1) — every write is full-history |
| "Don't call it bulletproof" | Correct. The claim is: self-announcing on failure, never silently wrong |
| "No new table" (ledger rejected) | Fields on contact rows via waterfall template; trade-offs named and accepted |
| Alta/LinkedIn sends | OPEN: should the same fields aggregate Alta sends ("have we touched this person" shouldn't depend on channel)? Recommend yes, phase 2 — Alta MCP is unreliable (Dave Overrides), so PV-only first |

## 7. Needs

- n8n access (existing creds — same as Sync PlusVibe Campaigns) + Hub Clients registry (workspace IDs, base IDs already there)
- Airtable plan-tier answer (V4) → sync-mirror or text fallback decision
- One waterfall-template edit (standard field set gains the 9 fields)
- Backfill run: all 6,439 Dave leads, one execution; then per-client backfill at each client's onboarding
- Onboarding SOP touch: new clients get the Airtable Sync mirror + inclusion in the nightly fan-out (mirror the Slack Sync checkbox pattern on the Clients registry)

## 8. Relationship to in-flight Dave work (do not collide)

The Dave session is executing, separately: export + delete of the 2,307 NOT_CONTACTED from Founder-CEO, manual stamp on ClayRoots, placement test, Feedback campaign load. The manual stamp must write the SAME fields this sync owns (one-writer rule: stamp once, then the sync takes over). If the sync ships first, the stamp becomes unnecessary — the backfill covers it.
