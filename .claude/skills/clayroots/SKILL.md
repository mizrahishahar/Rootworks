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

## How a view is previewed

Every view is previewed twice, every time: once as a table row a person reads, once as a prompt Airtable's AI view builder executes. The two must say the same thing.

**1. The table.** One row per view, a real markdown table, never inside a code fence:

| View | Who is in it | Airtable filters | Size | Notes |
|---|---|---|---|---|
| CTOs at funded SaaS | technical decision-makers at software companies that raised money, with a verified email, never contacted | Where ALL of the following are true: `relevance` = 1. `Status` is done. `Messages Sent` is empty OR `Messages Sent` = 0. `Employees` is any of 51-200, 201-500. And where ANY of the following are true: `Title` contains CTO. `Title` contains Chief Technology. `Title` contains VP Engineering | 412 | blanks in `Employees` are out; `Sequencers` excludes nobody yet, no campaign feeds it |

- **Who is in it** is one plain sentence, so the reader knows what the view means without reading the filter.
- **Airtable filters** is the tree as it is: "Where ALL of the following are true: A. B. And where ANY of the following are true: C. D." Subgroups in nesting order, exactly as the builder will hold them; never flattened into a comma list. Every row complete and standalone, never "same as above, plus".
- **Size** is exact and server-side: the filter through the records tool with `pageSize: 1`, reading the total. A nested tree is counted layer by layer; an OR-group that cannot be counted directly is counted by its complement, subtracted from the parent.
- A set that partitions a pool closes with its reconciliation line under the table: the sum of the views against the parent's exact count.

**2. The prompt.** Under the table, one block per view, paste-ready, the view's name as its heading. It names the table, the view, the filter tree in the same words as the cell, the sort, and the fields to show:

> Create a grid view on the People table named "CTOs at funded SaaS".
> Show only records where ALL of the following are true: relevance is 1; Status is "done"; Messages Sent is empty or Messages Sent is 0; Employees is any of "51-200", "201-500"; and where ANY of the following are true: Title contains "CTO"; Title contains "Chief Technology"; Title contains "VP Engineering".
> Sort by Build Date, newest first.
> Show these fields: Name, Title, Company, Employees, Final Email, LinkedIn URL, Tag, Campaigns, Messages Sent, Last Contacted.

The builder rewrites a whole filter roughly one time in three: after it applies, read the tree it produced against the table row before trusting the count.

## This folder

`views.md` composes and verifies one view. `cascade.md` turns a segment set into deploy views that catch every row once. `ai-fields.md` writes a prompt for a field that computes on every row.
