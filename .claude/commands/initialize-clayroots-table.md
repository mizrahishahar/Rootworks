# initialize-clayroots-table

Bring one ClayRoots contacts table to the standard: the constant fields, and the standing chain of views. Chrome does the building; the API does the proving.

Loads `conventions-manager` (the chain and its names) and `views-poweruser` (the mechanics and the traps).

## Before touching anything

Name the table back: base, table, table id, row count, and **channel** — the table name declares it (`... (Linkedin)` has no email waterfall). Then read the schema. Never build against a remembered shape; fields were renamed as recently as this week.

Check that `relevance` carries values. The field existing is not the same as the pass having run - an all-unchecked `relevance` means `Relevant` is empty and the whole chain below it is empty too. If it has not been stamped, stop and run `/filter-by-relevance` first.

## Constant fields - create any that are missing

| Field | Type | Why |
|---|---|---|
| `relevance` | checkbox | The verdict. Views filter on this, never on Title keywords |
| `manually_approved` | checkbox | The rescue lane. Only ever WIDENS Relevant |
| `Tag` | text | Build provenance, stamped at launch. The pin for per-build views |
| `Deploy Error` | text | Written by Deploy View to Campaign only |

Create through the API, with the description written. Never create a field to hold a filter's logic.

**Both checkboxes exist on purpose.** `relevance` is what the pass stamps and what a re-run overwrites; `manually_approved` is the Operator's hand and survives a re-run. Ticking `relevance` directly on one row works, and it will be lost the next time the pass runs.

## The standing chain

`&` joins a state. ` : ` opens a lens.

| View | Filter | Fields |
|---|---|---|
| `Grid view` | **none, ever** | all |
| `Relevant` | `relevance` is checked, OR `manually_approved` is checked | all minus never-visible |
| `Cut review` | `relevance` is unchecked AND `manually_approved` is unchecked | first_name, company, Seniority, Title, Description, `manually_approved` |
| `Relevant : Waterfall` | = Relevant | `Email` + every waterfall-lane field the table carries |
| `Relevant & Not Waterfalled` | Relevant AND `Status` empty | all minus never-visible minus campaign fields |
| `Relevant & Not Found` | Relevant AND `Status` any of verifying, no_email_found, error | same |
| `Relevant & Found` | Relevant AND `Status` = done | same |
| `Relevant & Found : Campaigns` | same rows as Found - a lens, not a narrowing | `Final Email` + campaign fields |
| `Relevant & Found : Never Contacted` | Found AND (`Messages Sent` empty OR = 0) | same |

A checkbox has two states, so `Relevant` and `Cut review` are exact complements by construction and every new row lands in one of them the moment it arrives. Unchecked means both *cut* and *not yet judged* - the same bucket, and correctly so: both need eyes. Which one a table is in is answered by whether `relevance` has been stamped at all, not by the view.

**A LinkedIn table drops the waterfall spine entirely** - no `Waterfall`, `Not Waterfalled`, `Not Found`, `Found`. Its chain is `Grid view` → `Relevant` → `Cut review` → `Relevant & LinkedIn` (Relevant AND `Social` not empty), and that view is the sender feed.

**Never visible in any view:** `Contact Key`, `Score`, `Similarity`, `Keywords`, `segment`, `query_name`, `ingested_at`. A primary field cannot be hidden - leave it as column one and move on.

**Campaign fields** (written by the sync and deploy machines, never by hand): `Campaigns`, `Campaign Status`, `Messages Sent`, `Last Contacted`, `Bounce Reason`, `Synced At`, `Deploy Error`.

**The waterfall lane is never a fixed list.** Read it off the schema each time - `Email`, `Email Source`, `Status`, `Final Email`, and every `P*` / `MV *` pair present. A fourth provider appeared this month; a fifth will. (sometimes you don't have any fields of it besides the base ones because the waterfall hasn't been run yet. that's fine.)

## Building it in Chrome

Duplicate the view above, rename it, then narrow. The filter panel's *"Describe what you want to see"* box composes nested logic well - say **"Keep every existing condition and group exactly as they are, and add..."**, then **read the tree it produced before applying**. It rewrites the whole filter roughly one time in three, and a wrong tree looks identical in a row count.

- Confirm the view name in the header before editing a filter. A rename that silently failed is how the original `Relevant` nearly got overwritten.
- `Escape` with unapplied changes opens *"Discard your filter changes?"* - click **Back**, then Apply.
- Airtable caps conditions per view. If it refuses, restructure rather than hand-building.
- A field that looks numeric may not be. `Infra Employees` is text holding `0`, `1`, `2-3`, `4+`, so `> 1` matches nothing. Group the parent by a field once to read its real buckets and whether a blank bucket exists.

## Done when the arithmetic closes

State every count, and prove these two:

- `Relevant` + `Cut review` = the table, exactly.
- `Not Waterfalled` + `Not Found` + `Found` = `Relevant`, exactly. (LinkedIn: `Relevant & LinkedIn` ≤ `Relevant`, and name the gap - contacts with no profile.)

A count that looks right is not a count that is right. Read rows on both sides of anything new.

Per-build views are not this command's job - they belong to `/segment`. Report what you left undone: legacy views that should die, fields marked safe to delete, and any view whose filter could not be reproduced.
