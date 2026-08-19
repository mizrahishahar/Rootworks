---
name: clayroots-tables
type: skill
vertical: [list-building]
description: The material world of ClayRoots list tables. Fields and the field standard, formulas, views and filters, AI columns, table setup to standard, exact counts, company-name hygiene. Use for any work on a client's list base, composing or verifying views, encoding rules as formulas, creating fields, or cleaning data.
---

# ClayRoots tables

The craft of the client list bases: fields, formulas, views, filters, AI columns. Judgments about people arrive here as decisions already made; this skill turns them into base reality that stays correct as rows keep landing, and proves every change by reading it back.

## The laws

- **Tables are sacred, one owner per field.** Every field has exactly one writer; two writers on one field always diverge. A field outside the standard gets flagged for deletion, never quietly adopted.
- **Verify by cell values, never by a success response.** Platforms return success while dropping what was sent. Every write is read back from the base before it is called done.
- **Exact counts are free; never guess one.** A server-side count costs one call. A quoted number always names the scope it was computed under, because the same slice measured against three scopes gives three correct answers.
- **A clean count is not a right filter.** The right number of the wrong rows is a real failure mode; spot-check real rows on both sides of anything new.
- **Prefer rules over stamps.** A formula or a native-field filter reclassifies every future row for free; a hand-stamped judgment field freezes at the moment of stamping and silently orphans every new row. The one exception is the rescue lane, which only ever widens.
- **Nothing lands in the base unannounced.** Fields and formulas are proposed with their exact definition and expected effect, approved, then written, then read back.

## Ground yourself

Resolve the client's base from their registry row. Read the table's real schema before touching it, never a remembered shape; sample real rows before drafting any condition; check what a column actually holds (a text field holding `2-3` and `4+` makes `> 1` match nothing, silently).

## Presenting views

One format everywhere a view or a segment set is shown, one row per view, always a real markdown table, never inside a code fence:

| View | Airtable filters | Size | Notes |
|---|---|---|---|
| the name | every condition spelled out in full, with its AND/OR grouping | exact count | what it deliberately excludes, cautions |

- **Every row is complete and standalone.** Every condition written out in full, exactly what gets pasted into that view's own filter builder. Never "same as above, plus": if ten rows share nine conditions, all ten carry all their conditions, every time.
- **The count is exact and server-side**, computed fresh for the filter as written, its scope named.
- A segment set's rows are followed by the reconciliation line: the sum of the segments against the parent's count, stated explicitly.

## This folder

Every file here opens with a line saying what it teaches. List the folder, read what the job needs; on anything that writes to a base, read all of it first. A wrong filter silently drops the wrong rows, and a wrong field poisons every row after it.
