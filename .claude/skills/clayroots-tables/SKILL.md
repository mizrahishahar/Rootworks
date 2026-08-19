---
name: clayroots-tables
type: skill
vertical: [list-building]
description: The material world of ClayRoots list tables. Fields and the field standard, formulas, views and filters, AI columns, table setup to standard, deploy views and their prioritization, exact counts, company-name hygiene. Use for any work on a client's list base, composing or verifying views, encoding rules as formulas, creating fields, or cleaning data.
---

# ClayRoots tables

**ClayRoots is the list workshop.** Every client has one ClayRoots base, and it is where their lists live as tables: the builders land pulled companies and contacts into it, the waterfall finds and verifies emails on it, relevance gets stamped on it, segments get cut from it as views, and campaigns deploy from those views. Between the pull and the send, everything that happens to a list happens here.

This skill is the craft of that base: fields, formulas, views, filters, AI columns. Judgments about people arrive as decisions already made; this skill turns them into base reality that stays correct as rows keep landing, and proves every change by reading it back.

## The laws

- **Tables are sacred, one owner per field.** Every field has exactly one writer; two writers on one field always diverge. A field outside the standard gets flagged, never quietly adopted.
- **Verify by cell values, never by a success response.** Every write is read back from the base before it is called done.
- **Exact counts are free; never guess one.** And a quoted number always names the scope it was computed under.
- **A clean count is not a right filter.** The right number of the wrong rows is a real failure mode; spot-check real rows on both sides of anything new.
- **Prefer rules over stamps.** A formula or a native-field filter reclassifies every future row for free; a hand-stamped judgment field freezes at the moment of stamping. The one exception is the rescue lane, which only ever widens.
- **Nothing lands in the base unannounced.** Fields and formulas are proposed with their exact definition and expected effect, approved, then written, then read back.

## Ground yourself

Resolve the client's base from their registry row. Read the table's real schema before touching it, never a remembered shape; sample real rows before drafting any condition; check what a column actually holds (a text field holding `2-3` and `4+` makes `> 1` match nothing, silently).

## Presenting views

This format is load-bearing, and here is why: **the filter text gets handed, word for word, to Airtable's view AI builder, which builds the view from exactly what is written.** So every view is presented in words a builder can execute with zero interpretation: every condition spelled out in full, every AND/OR group AND subgroup stated explicitly, nothing abbreviated, nothing implied. Detailed as needed, not more, not less, in clear words, every time.

One format everywhere a view is shown, one row per view, always a real markdown table, never inside a code fence:

| View | Airtable filters | Size | Notes |
|---|---|---|---|
| the name | the full condition tree in words | exact count | what it deliberately excludes, cautions |

The filter cell is written as the tree it is: "Where ALL of the following are true: A. B. And where ANY of the following are true: C. D." Groups and subgroups named in those words, in nesting order, exactly as Airtable's builder will hold them. A subgroup never gets flattened into a comma list, because a builder cannot guess where the parentheses were.

- **Every row is complete and standalone.** Never "same as above, plus". If ten rows share nine conditions, all ten carry all their conditions, every time.
- **The count is exact, server-side, and mistake-proof by method:** run the filter itself through `list_records_for_table` with `pageSize: 1` and read `metadata.totalRecordCount`. The query tool runs one flat AND/OR level, so a nested tree is verified layer by layer, and an OR-group that cannot be counted directly is counted by its complement (a flat AND of every condition negated) subtracted from the parent. Never quote a count produced any other way, and never read a count "off the view", which is not a read that exists.
- A set of views that partitions a pool closes with its reconciliation line: the sum of the views against the parent's exact count, stated explicitly.

## This folder

Every file here opens with a line saying what it teaches. List the folder, read what the job needs; on anything that writes to a base, read all of it first. A wrong filter silently drops the wrong rows, and a wrong field poisons every row after it.
