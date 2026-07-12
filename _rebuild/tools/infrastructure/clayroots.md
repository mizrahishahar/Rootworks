---
vertical: list-building
type: infrastructure
owner: Operator
---

# ClayRoots

Our own Clay: an in-house find, verify, and select station, an Airtable base (`appSTTKOc9Afqer9d`) driven by n8n automations. A pull lands as one table, the waterfall fills the emails, and a view per campaign exports the ready list. It is not the CRM.

## The base

One table per ingested pull, named `{query} - Contacts - {date}`, with `Domains without contacts` and `Domains with public emails` for the domain flavours. The schema is not frozen: each pull carries different extra columns, so any read must tolerate per-table variance. A `CONTROL PANEL` table holds the buttons that fire the automations; a `Seg Log` table records every run.

## The two schemas

- **claudeschema (contact pulls).** Keys the ingest needs: `Domain` (the join and the split), `Name` (its presence marks a contact versus a bare domain), `Email` + `Verified` (a verified email stays, anything else is blanked for the waterfall). Everything else optional and passed through.
- **domain schema (company pulls).** Company rows, no `Name`: `Domain` plus firmographics and `public_emails`. The companies ingest splits domains-with-public-emails from those without, and drops blacklisted role addresses (hr@ and the like).

## Actions

How a skill reaches into the base, over the Airtable MCP:

- **Read a table or distribution:** list records, filter with the base's own is-empty and value filters, count before asserting. Thousands of rows blow the token cap, so dump to a file and parse rather than pulling rows into context.
- **Read a view:** a cut view is the campaign-ready slice; read it to hand rows to a skill (title-validator reads the contacts table, export reads the segment view).
- **Write or backfill:** cap 50 records per batch; upsert on a stable id so a backfill updates rather than duplicates. Surgical only, never rebuilding what a source column already carries.
- A "does not contain" filter also sweeps in every blank row, so compose filters to handle the blank case explicitly.

## Automations

Fired from the CONTROL PANEL or a form; the workflows live in n8n (see the n8n tool). Named, not ID'd, because they are cloned per environment.

- **Ingest** (one per source shape): `SEGMENT SUPERSONIQ CONTACTS`, `SEGMENT DISCOLIKE CONTACTS`, `SEGMENT DISCOLIKE COMPANIES`. Each conforms a source CSV to the base and lands the table.
- **Waterfall:** `RUN FULL WATERFALL` (find + verify) and `RUN VERIFICATION ONLY` (verify already-found emails). It owns `Final Email`, `Status` (done / verifying / no_email_found / error), and `Source`. Idempotent; run in chunks of a few hundred (it writes at the end and verifies serially, so a giant run zombies out); never cap at 0, which means unlimited. A row is campaign-ready when `Status` is done and `Final Email` is populated.
