Teaches: turning an approved segment set into the final deploy views a build sends from: the prioritized cascade that catches every lead, the aggregate view above it, naming, and the reconciliation that proves it.

# Deploy views

The deploy views are the end of the line: each one feeds exactly one campaign, and together they are how a segmentation actually presents itself in the base. The segment decisions (who splits, on what axis, why) arrive from the list craft; this file is how those decisions become views that send.

## The cascade: prioritized, so nobody is missed

Segments are defined by their filters, but leads do not respect boundaries: one lead can match two segments, and a lead matching none of them still has to go somewhere. So the deploy set is built as a **prioritized cascade**, not as independent slices:

- **The views are ordered.** Priority is a judgment call made with the segment set: which campaign deserves a lead that qualifies for two. Decided with the Operator, not defaulted.
- **View 1** carries its segment's filter, whole.
- **Every later view carries its own filter AND the explicit negation of every view above it.** A lead matching views 1 and 3 lands only in 1. The exclusions are spelled out as conditions, never implied by the order alone, because Airtable views do not know about each other.
- **The last view is the catch-all**: everyone in the parent pool the cascade above did not catch. Not an enumerated bucket (`2-3, 4+`), a true remainder (NOT the conditions above), so a value nobody anticipated, or a blank, still deploys somewhere.

The cascade is what guarantees the two properties a deploy set must have: no lead in two campaigns, and no lead in zero.

## The aggregate view

Above the cascade sits **one aggregate view**: the whole deployable pool of this build in a single view, the exact parent the cascade partitions. It exists so the arithmetic is visible in the base itself: the cascade's views sum to the aggregate, exactly, and anyone can see it without running a query. Build it first; it is also the count every reconciliation reads against.

## Naming

- Aggregate: `{YYYY-MM-DD} ALL - {build descriptor}`.
- Cascade views: `{YYYY-MM-DD} {A|B|C} - {segment descriptor}`, the letters in priority order, the descriptor matching the campaign it feeds.
- A gateway slice suffixes ` - Gateway`, always last, after everything else.

Every deploy view carries the build date; an undated view reads as standing infrastructure when it is one build's deploy unit.

## Reconciliation, and where the gaps hide

The set is finished when every cascade view's exact count sums to the aggregate's exact count precisely. Counting method and its traps live in `views.md`; the craft rules that make the sum close by construction:

- **The same field list in both directions.** A cascade view's negations use exactly the fields and conditions of the views above it, verbatim. Two lists that are merely similar produce orphans: rows that pass the aggregate on a token the cascade does not recognise, land nowhere, and are never sent. Three hid in a 662-row feed until the sum was checked.
- **Blanks are stated, never assumed.** A `doesNotContain` negation matches blank rows too; every view says what happens to blanks in the fields it gates on.
- When the sum does not close, the gap is nearly always one of three things: a view gated on a field the aggregate does not gate on, a bucket that excluded blanks, or two views that were supposed to be one.

## How to show it

The SKILL.md view format, rows in cascade order with the aggregate as the first row, every filter cell carrying its full tree including the spelled-out negations, and the reconciliation line under the table: the sum of the cascade against the aggregate, both exact.

## Worked example

One build, two segments (Fashion prioritized over General), gateway fence per segment. Note every later row re-states its negations in full, and the gateway condition is always `MX Provider` contains one of the verified gateway providers, with sendable defined as NOT-gateway, never as an allow-list:

| View | Airtable filters | Size | Notes |
|---|---|---|---|
| 2026-08-19 ALL - IL DTC | Where ALL of the following are true: `relevance` is checked OR `manually_approved` is checked. `Status` is done. `Messages Sent` is empty OR `Messages Sent` = 0 | 1,204 | the aggregate, built first |
| 2026-08-19 A - Fashion | Where ALL of the following are true: the aggregate's conditions, spelled out. And ANY of the following are true: `Industry Groups` contains Fashion. `Industry Groups` contains Footwear. And ALL of the following are true: `MX Provider` does not contain proofpoint, barracuda, mimecast, sophos, mailroute, spamhero, appriver, spamexperts (each as its own does-not-contain condition) | 402 | sendable only |
| 2026-08-19 A - Fashion - Gateway | Same base and Fashion conditions spelled out in full. And ANY of the following are true: `MX Provider` contains proofpoint. contains barracuda. contains mimecast. contains sophos. contains mailroute. contains spamhero. contains appriver. contains spamexperts | 31 | same copy as A, fenced for bounce isolation |
| 2026-08-19 B - General | Where ALL of the following are true: the aggregate's conditions, spelled out. `Industry Groups` does not contain Fashion. `Industry Groups` does not contain Footwear (the negation of A, including its blank behavior: blanks land here). And the same NOT-gateway conditions as A | 738 | the catch-all: everything not caught above |
| 2026-08-19 B - General - Gateway | The B conditions spelled out in full, with the gateway ANY-group instead of the NOT-gateway group | 33 | |

**Reconciliation:** 402 + 31 + 738 + 33 = 1,204 = the aggregate, exactly.

(In a real hand-over, "the aggregate's conditions, spelled out" is never written; the actual conditions are repeated in full in every row. Shortened here only to keep the example readable.)
