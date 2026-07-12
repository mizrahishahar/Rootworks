# ClayRoots

ClayRoots is our DIY Clay: an in-house email **find, verify, and select** station. It is not Clay (no license) and not the CRM. It lives as an Airtable base (`appSTTKOc9Afqer9d`) next to the CRM, driven by n8n automations. It turns ingested pulls into selectable, verified lists — one table per ingested list, one view per campaign.

## The role split

- **The list-builder** navigates and reads the base: the tables, the real fields, the distributions. Off that read it designs the segmentation and outputs the filter table (one row per segment: name, base filters, size estimate, notes), and flags any genuinely missing field. Light, surgical writes only — never rebuilding what the source columns already carry.
- **The operator** runs the ingest automations, runs the waterfall, cuts the views from the filter table, and exports the segment CSVs.

## The shape of the base

- A **CONTROL PANEL** table with the buttons that fire the n8n automations, and a **Seg Log** table where every ingest run logs.
- A **table per ingested list**, named `{Query name} - Contacts - {date}` (or `... - Domains without contacts` / `... - Domains with public emails` for the domain flavors). One list, one table. Reusing the same query name on the same day collides the table name — vary the name.
- Schema is **not frozen**: different lists carry different extra columns, because the handlers pass extra columns straight through. Any read must tolerate per-list variance.

## Stage 1: Ingest

The operator feeds each per-pull CSV to its ingest automation, which lands a table in the base. The normalization is uniform: it stamps provenance (`query_name`, `ingested_at`, `segment`), cleans names, companies (`company_clean`), and states (`State Full`, with a "your area" fallback), splits contacts from contactless domains, applies the Verified gate (an unverified email is blanked so the waterfall re-finds it), and passes every extra column straight through — which is how the segmentation variables ride from the pull into the base.

You do not shape the CSV here; the shape is the producing handler's CSV output, conformed to the house schema (`Output Interface.md`). Land it and it is clean. One CSV, one run, one table. The role-inbox channel (public emails on domains rather than named contacts) arrives through its own operator automation — a separate table, the other side of the channel axis.

## Stage 2: The waterfall (email find + verify)

Operator-run. Two functions as a configurable waterfall: **finding** (for rows missing an email, finders run in sequence) and **verifying** (every email checked for deliverability, catch-alls resolved). The specific tools and order are implementation and change; what is stable:

- The outcome fields it owns: **`Final Email`** (what campaigns select and send on — a blank input Email with a populated Final Email is the normal, correct state), **`Status`** (done / verifying / no_email_found / error), **`Source`**, and per-step verdicts.
- **Idempotent**: it only processes rows not already done/verifying, so re-running is safe.
- **Verify-only runs exist**: zero finder spend when the table already has emails.
- **Run it in sized chunks.** It writes to the table only at the end of a run and verifies serially, so one giant run times out into a zombie that writes nothing. Cap rows per run (a few hundred); never enter 0 as the cap — 0 means unlimited, not none.
- A "done" row is not always a verified row; read Source and the verdicts when it matters.

The waterfall is where the list shrinks — find rates swing hard by niche. Re-segment when the verified volume drops, and never bench a real decision-maker just because the email has not resolved yet; that is a slice held for the waterfall, not a row to drop.

## Stage 3: Views and export

A row is campaign-ready when `Status = done` and `Final Email` is populated. One view per campaign, gated on the filter table's filters composed with those two conditions. The operator cuts the views and exports; the exported CSVs land in the campaign folders (`Output Interface.md`).

## Navigating the base (the mechanics)

- **Reads blow the token cap at thousands of rows.** Dump to a file and parse (strip the header line before the JSON) rather than pulling rows into context.
- **Writes cap at 50 records per batch**; omit an empty `fieldIds` parameter rather than passing one. Upsert on a stable id when backfilling so you update rather than duplicate.
- **Check the real source, never a sample.** Use the base's own filters (an is-empty filter beats sampling) and count before asserting a fill-rate or a split.
- **Blank values bite filters.** A "does not contain X" filter sweeps in every row where the field is blank; compose filters to handle the blank case explicitly.
- **Incident state can live in the schema.** A checkbox marking a burned slice plus a backfill flag, then a re-cut view — mark and refill, do not rebuild.
