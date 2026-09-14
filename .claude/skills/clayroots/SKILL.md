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

## This folder

`views.md` composes, verifies and previews one view (the table and the paste-ready prompt). `cascade.md` turns a segment set into deploy views that catch every row once. `ai-fields.md` writes a prompt for a field that computes on every row.
