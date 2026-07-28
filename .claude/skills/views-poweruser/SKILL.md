---
name: views-poweruser
description: The Airtable views mechanic - exactly what it does and doesn't do to a ClayRoots base, tool by tool, so a view built from its work is correct the first time. Use whenever a skill needs a filter turned into a real, verified Airtable view.
type: skill
vertical: [list-building]
---

# Views power user

You operate a ClayRoots base through the Airtable MCP so a view comes out correct the first time - every filter verified before it's handed over, in the exact shape Airtable expects. Getting this wrong is expensive: a filter that's subtly off silently drops the wrong rows, or zeroes a segment outright with a clean-looking count. You work through [[clayroots]], through the Airtable MCP actions named below - nothing else touches the base.

## What you do

- **Read a table's real schema** (`get_table_schema`) before any select-field filter, to get the field's actual choice IDs.
- **Sample real rows** (`list_records_for_table`, a small `pageSize`, scoped `fieldIds`) before drafting any text-field condition.
- **Get an exact count for any filter** (`list_records_for_table` with `pageSize: 1`, reading `metadata.totalRecordCount`) - real, server-side, cheap.
- **List what views already exist by name** (`list_views_for_table`) before proposing a new one, so nothing gets rebuilt that's already been cut.
- **Compose the filter as its true nested shape** - `Where All of the following are true` wrapping `Any of`, exactly as Airtable's own filter builder groups conditions - and decompose it into the flat layers the query tool can actually run to verify each one.
- **Spot-check real rows on both sides** of a finished filter before calling it done.
- **Reconcile a segment set's counts** against its parent view's count before presenting it as final.

## What you don't do

- **You don't create, edit, or delete a view.** There is no `create_view`, `update_view`, or `delete_view` action - every view is a filter you hand to the Operator to build in the Airtable UI by hand. Saying "I'll build the view" is always wrong; the correct sentence is "here's the filter to build."
- **You don't delete a field.** There is no `delete_field` action. If a field shouldn't exist, say so and name it - the Operator removes it.
- **You don't build a field to hold a filter's logic**, ever, under any pressure to move faster. A live formula field is an unrequested write to the base, not a filter - and there's no way to undo it yourself once it's there.
- **You don't read a view's actual filter or row count directly.** `list_views_for_table` returns a name, an ID, and a type - nothing about what the view filters on, nothing about how many rows are in it. "How many rows are in the Relevant view" is never a lookup; it's the same filter, run fresh, through `list_records_for_table`.

## How you do it, in order

1. `get_table_schema` - once per table, for every select field the filter will touch, to pull real choice IDs.
2. `list_records_for_table`, small `pageSize`, real fields only - sample actual Title/Description text before writing a single condition. A keyword list drafted from what titles "usually look like" is exactly how industry noise (a law society, a university, a forklift-parts supplier) gets through a title-only filter untouched.
3. Draft the filter as its real nested shape.
4. Decompose it: the filter tool holds exactly one level of AND/OR across a flat list of conditions - it cannot run a nested `(A OR B) AND (C OR D)` in one call, even though Airtable's own UI can hold that shape once built. Run each flat layer through `list_records_for_table` + `pageSize: 1`, check every layer's count makes sense before trusting the whole.
5. `list_records_for_table` again, unfiltered by count this time - pull 5-10 rows the filter would keep and 5-10 it would drop, read them for real.
6. If this is a segment, sum every segment's exact count and check it equals the parent view's exact count precisely.
7. Hand over the finished nested filter, in the format below, with its verified count stated alongside it.

## How you don't do it

- **Never match a select-field condition on typed text.** The real stored value, pulled from `get_table_schema`, is what gets matched - exactly as it's written, whatever it contains. Typing what a label "should" say instead of what's actually stored is how a filter silently returns zero rows with no error.
- **Never treat a clean count as proof the filter is right.** A count can be exactly wrong - the right number of the wrong rows. That's what the spot-check is for.
- **Never guess at a flattened approximation of a nested ask.** Decompose it and check every layer, or say plainly that this shape can't be verified in one pass and here's the decomposition you're running instead.
- **Never sweep blank rows in by accident.** A `doesNotContain` condition matches blank rows too - state what happens to them, don't let it happen silently.

## When you search the base

Before drafting anything (sample), before finalizing anything (verify every layer's count), before calling anything done (spot-check real rows), and before proposing a segment set (reconcile the sum). Four real reads, every time, not memory of what a previous table looked like.

## When you don't

Once a layer's count is verified, it isn't re-queried out of habit - reuse it. And you never query hoping to read a view's filter or count directly off the view itself; that read doesn't exist, so it's never attempted - the fresh filter is always the source of truth.

## What you hand over

One format, used everywhere a view needs presenting - a single Relevant view (one row) and a full segment set (many rows) both use it:

```
| View | Airtable filters | Size | Notes |
|------|-------------------|------|-------|
| {name} | {field = value, AND/OR ...} | {exact count} | personalisation available, cautions |
```

Ready to paste into Airtable's own filter builder, exactly as grouped above it.
