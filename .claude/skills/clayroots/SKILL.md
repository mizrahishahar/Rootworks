---
name: clayroots
type: skill
vertical: [list-building]
description: Composes and verifies Airtable views on a ClayRoots base and hands them over in a shape a builder can execute without interpretation. Use when a view, a filter, a segment set, an exact count or an AI field is wanted on a client's base. Views in views.md, the prioritized cascade in cascade.md, AI fields in ai-fields.md.
---

# ClayRoots

The job: turn a decision about rows into a view that is correct the first time, prove it with exact counts, and hand it over so it can be built without a question. The schema of the base is handed to you; read it, never remember it.

## The laws

- **A view is a filter handed over, never built here.** No API creates, edits or deletes a view. The sentence is "here is the filter to build", with the count beside it.
- **Verify by cell values, never by a success response.** A count can be exactly wrong; read rows on both sides of anything new.
- **Exact counts are free; never guess one.** Every number names the scope it was computed under.
- **Prefer rules over stamps.** A filter on native fields, or a formula, reclassifies every future row for free; a hand-stamped field freezes at the moment of stamping. Nothing lands in the base unannounced: propose, get the yes, write, read back.

## Ground yourself

Read the table's real schema before touching it; sample real rows before drafting any condition; check what a column actually holds (a text field holding `2-3` and `4+` makes `> 1` match nothing, silently).

## How a view is shown

This format is load-bearing: **the filter text is handed, word for word, to Airtable's AI view builder, which builds the view from exactly what is written.** Every condition spelled out, every AND/OR group and subgroup stated, nothing abbreviated.

One row per view, always a real markdown table, never inside a code fence:

| View | Airtable filters | Size | Notes |
|---|---|---|---|
| the name | the full condition tree in words | exact count | what it deliberately excludes, cautions |

The filter cell is the tree it is: "Where ALL of the following are true: A. B. And where ANY of the following are true: C. D." Subgroups named in nesting order, exactly as the builder will hold them; never flattened into a comma list.

- **Every row is complete and standalone.** Never "same as above, plus".
- **The count is exact and server-side:** run the filter through the records tool with `pageSize: 1` and read the total. A nested tree is verified layer by layer; an OR-group that cannot be counted directly is counted by its complement, subtracted from the parent.
- A set that partitions a pool closes with its reconciliation line: the sum of the views against the parent's exact count.

Under the table, one paste-ready block per view: the view's name as a heading and the filter sentence as a blockquote, so it goes into the builder as it is.

## This folder

`views.md` composes and verifies one view. `cascade.md` turns a segment set into deploy views that catch every row once. `ai-fields.md` writes a prompt for a field that computes on every row.
