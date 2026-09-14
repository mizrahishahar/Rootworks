Teaches: turning an approved segment set into the views that feed campaigns: the prioritized cascade that catches every row exactly once, the aggregate above it, and the reconciliation that proves it.

# The cascade

Segments are defined by their filters, but rows do not respect boundaries: one row can match two segments, and a row matching none still has to go somewhere. So a segment set is built as a **prioritized cascade**, never as independent slices.

- **The views are ordered.** Which campaign deserves a row that qualifies for two is a judgment made with the segment set, never defaulted.
- **View 1** carries its segment's filter, whole.
- **Every later view carries its own filter AND the explicit negation of every view above it.** Airtable views do not know about each other, so the exclusions are spelled out as conditions, never implied by the order.
- **The last view is the catch-all**: everyone in the parent pool the cascade did not catch. A true remainder (NOT the conditions above), never an enumerated bucket, so a value nobody anticipated, or a blank, still lands somewhere.

That is what guarantees the two properties a set must have: no row in two campaigns, no row in zero.

## The aggregate

Above the cascade, one view: the whole pool the cascade partitions. Build it first; it is the parent every reconciliation reads against, and it makes the arithmetic visible in the base itself.

## Reconciliation, and where the gaps hide

The set is finished when the cascade's exact counts sum to the aggregate's, precisely. The craft rules that make the sum close by construction:

- **The same field list in both directions.** A later view's negations use exactly the fields and conditions of the views above it, verbatim. Two lists that are merely similar produce orphans: rows that pass the aggregate on a token the cascade does not recognise and land nowhere. Three hid in a 662-row feed until the sum was checked.
- **Blanks are stated, never assumed.** A `doesNotContain` negation matches blank rows too; every view says what happens to blanks in the fields it gates on.
- When the sum does not close, the gap is one of three things: a view gated on a field the aggregate does not gate on, a bucket that excluded blanks, or two views that should have been one.

## Fences

A deliverability fence (people behind a secure email gateway) is drawn per segment, not once for the pool: every segment gets the fence and its exact complement, same copy on both sides. Sendable is defined as NOT-fenced, never as an allow-list of known-good values; an allow-list silently drops every value it has not heard of. Which providers count as a gateway is a standard, handed to you, never remembered.

## How to show it

The SKILL.md table, rows in cascade order with the aggregate first, every filter cell carrying its full tree including the spelled-out negations, and the reconciliation line under the table. In a real hand-over "the aggregate's conditions" is never written; the actual conditions are repeated in full in every row.
