Teaches: bringing one ClayRoots contacts table to the standard, the constant fields, the standing chain of views, and the arithmetic that proves it. Chrome does the building; the API does the proving.

# Table setup

## Before touching anything

Name the table back: base, table, table id, row count, and **channel**, which the table name declares (`... (Linkedin)` has no email waterfall). Then read the schema; never build against a remembered shape, fields get renamed. And check that `relevance` carries values: the field existing is not the same as the pass having run, and an all-unchecked `relevance` means the whole chain below `Relevant` is empty too. Unstamped means the relevance rule gets written first (`relevance-formula.md`).

## Constant fields, created through the API with descriptions

| Field               | Type                      | Why                                                              |
| ------------------- | ------------------------- | ---------------------------------------------------------------- |
| `relevance`         | checkbox (formula-backed) | The verdict. Views filter on this, never on Title keywords       |
| `manually_approved` | checkbox                  | The rescue lane. Only ever WIDENS Relevant                       |
| `Tag`               | text                      | Build provenance, stamped at launch. The pin for per-build views |

Both checkboxes exist on purpose: `relevance` is what the rule computes and a rule change overwrites; `manually_approved` is the Operator's hand and survives it. The many machine-written fields (the waterfall lane, campaign fields, deploy receipts) are not setup's job: their writers create and own them, and setup only needs to not fight them.

## The standing chain

`&` joins a state; ` : ` opens a lens.

| View | Filter | Fields |
|---|---|---|
| `Grid view` | none, ever | all |
| `Relevant` | `relevance` is checked, OR `manually_approved` is checked | all minus never-visible |
| `Cut review` | `relevance` is unchecked AND `manually_approved` is unchecked | first_name, company, Seniority, Title, Description, `manually_approved` |
| `Relevant : Waterfall` | = Relevant | `Email` + every waterfall-lane field the table carries |
| `Relevant & Not Waterfalled` | Relevant AND `Status` empty | all minus never-visible minus campaign fields |
| `Relevant & Not Found` | Relevant AND `Status` any of verifying, no_email_found, error | same |
| `Relevant & Found` | Relevant AND `Status` = done | same |
| `Relevant & Found : Campaigns` | same rows as Found, a lens, not a narrowing | `Final Email` + campaign fields |
| `Relevant & Found : Never Contacted` | Found AND (`Messages Sent` empty OR = 0) | same |

**`Relevant & Found : Campaigns` is deploy-gating, twice.** Deploy View to Campaign refuses to deploy from a table that does not carry this view by exact name, AND from a table whose description carries no share link for it; both abort before anything is sent. It is the durable lead-list window: every Lead Lists receipt links to it (never to the selector view that deployed, whose filter dissolves), and the deploy stamps `Campaigns` membership so the lens shows every deployed list forever.

**The share link, part of setup.** This view is the one window clients see campaigns through; every other view is internal. In Chrome, on the view: Share view -> create link, password `{Client}01` (Dave01, Adelante01). Creating the link is the only manual act (no API can mint share links); the Operator hands the link to the session, and the session writes one line into the TABLE description via the meta API: `Campaigns view: https://airtable.com/shr...`. No one edits descriptions by hand. The deploy regex-extracts the first shr URL from the description (the password is never stored; the pattern is the convention) and writes it on the Lead Lists receipt. No link in the description, no deploy.

**The view's visible fields (client-facing spec).** Show: Name, Title, Company, City, Country, Final Email, Social, Campaigns, Messages Sent, Last Contacted, PLUS every personalized custom field the table carries (Infra Employees, Tech Needs, Trustpilot Rating, and their kin), judged in real time during the Chrome pass since custom fields differ per build. Domains tables swap the person fields for Company + Domain. Deliberately hidden: Campaign Status, State, Deploy Error, Bounce Reason, Synced At, Tag, the waterfall lane, and every machine verdict field.

A checkbox has two states, so `Relevant` and `Cut review` are exact complements by construction and every new row lands in one of them the moment it arrives. Unchecked means both *cut* and *not yet judged*, the same bucket, and correctly so: both need eyes.

**A LinkedIn table drops the waterfall spine entirely.** Its chain is `Grid view`, `Relevant`, `Cut review`, and `Relevant & LinkedIn` (Relevant AND `Social` not empty), and that last view is the sender feed.

**Never visible in any view:** `Contact Key`, `Score`, `Similarity`, `Keywords`, `segment`, `query_name`, `ingested_at`. A primary field cannot be hidden; leave it as column one and move on.

**Campaign fields** (written by the sync and deploy machines, never by hand): `Campaigns`, `Campaign Status`, `Messages Sent`, `Last Contacted`, `Bounce Reason`, `Synced At`, `Deploy Error`.

**The waterfall lane is never a fixed list.** Read it off the schema each time: `Email`, `Email Source`, `Status`, `Final Email`, and every provider pair present. A new provider appears without notice, and a table the waterfall has not touched yet legitimately carries only the base fields.

## Building it in Chrome

Duplicate the view above, rename it, then narrow. The filter panel's "Describe what you want to see" box composes nested logic well: say "Keep every existing condition and group exactly as they are, and add...", then **read the tree it produced before applying**; it rewrites the whole filter roughly one time in three, and a wrong tree looks identical in a row count.

- Confirm the view name in the header before editing a filter; a silently failed rename is how `Relevant` nearly got overwritten once.
- `Escape` with unapplied changes opens "Discard your filter changes?": click Back, then Apply.
- Airtable caps conditions per view; if it refuses, restructure rather than hand-building.
- A field that looks numeric may not be (`Infra Employees` is text holding `0`, `1`, `2-3`, `4+`, so `> 1` matches nothing). Group the parent by a field once to read its real buckets and whether a blank bucket exists.

## Done when the arithmetic closes

State every count, and prove these two:

- `Relevant` + `Cut review` = the table, exactly.
- `Not Waterfalled` + `Not Found` + `Found` = `Relevant`, exactly. (LinkedIn: `Relevant & LinkedIn` <= `Relevant`, and name the gap: contacts with no profile.)

A count that looks right is not a count that is right; read rows on both sides of anything new. Per-build deploy views are a separate job with their own naming (`views.md`). Report what was left undone: legacy views that should die, fields marked safe to delete, any view whose filter could not be reproduced.
