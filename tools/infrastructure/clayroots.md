---
vertical: [list-building]
type: infrastructure
owner: Operator
---

# ClayRoots

Our own Clay, multi-tenant: one Airtable base per client, driven by one shared set of n8n builders and waterfalls (see `n8n/INDEX.md` for the machines). A builder lands tables in the client base, the email waterfall fills the verdicts, judgment cleans and segments inside the base, and the Deploy machine pushes a view's leads into the campaign. It is not the CRM - that is the Hub Prospects table ([[Readme]]).

Every automation resolves its client through the Hub Clients registry at runtime; nothing is hardcoded per client. Run logs land in the Hub Automations table - read the row, then verify by cell values on the target table.

## A client base

Resolved from the registry (`Clayroots Base ID`), never assumed. Inside it:

- **Build tables** - born by a builder: `{Build} - Contacts` and `{Build} - Domains` (date suffixes retired 2026-08-11). Since the create-or-append rework (2026-07-29), every builder can also APPEND to an existing table by Table ID, guarded: a contacts builder refuses a table named `*Domains*`, refuses a table missing `Contact Key`, refuses type clashes. Tables are long-lived working assets, not disposables.
- **Standing tables** - the Intent tables (per the intent flows) and DNC Domains (ingest drops matches; deploy honors it).

## The contract (the stable spine)

A build table carries its source pass-through plus what the machine relies on:

- `Contact Key` - lower(first + last + domain), the dedup identity; every contact write is an upsert on it, so re-runs never double rows. KNOWN DEFECT: the cleaners strip non-ASCII, mangling names and keys (GitHub issue #1).
- `Domain`, `Name`, `first_name`, `last_name`, `Company` (always the cleaned value - one shared cleanCompany at write time), `company_clean`, `Email`, `Valid` (DiscoLike's belief about the person, NOT proof the mailbox exists - MillionVerifier judges).
- The email-waterfall set: `MV P0`, `P1 (Trykitt)`, `MV P1`, `P2 (LeadMagic)`, `MV P2`, `P3 (Prospeo)`, `MV P3`, `BB`, `Final Email`, `Status`, `Source`. Found = `Status` done + `Final Email` populated. Status doctrine: `done` / `verifying` / `no_email_found` (someone looked, nobody there) / `error` (nobody looked - retryable). A provider being down is a fact about the provider, never about the row.
- `Build Date` - date the row was born; immutable, backed by a `Created` CREATED_TIME() formula field because upserts re-stamp payload fields.
- `Tag` - optional free-text label the Operator sets at launch, written on every row of that run. Replaces the retired `query_name`. Blank is valid.
- Provenance: `segment`, `ingested_at`.
- Domains tables carry `public_emails_clean` plus the verification set.

Everything else is the source to carry, and welcome; read the real table, never assume the column set.

## The responsibility line

Data transformation belongs to the machines; ClayRoots is where judgment is applied to finished data. Chat touches rows only through scoped Airtable actions:

- **Read** - filtered searches and counts against the live base; count before asserting a distribution.
- **Write** - surgical, capped 50 records per batch, upsert on a stable id; stamping a segment field is the model case. A company-level classification is not done until it is verified written on every sibling row at that company - report rows touched against rows expected.
- A "does not contain" filter also sweeps in blank rows; handle the blank case explicitly.

Bulk transformation, joining, ranking, dedup, formatting: machine capabilities. When a build needs one the estate lacks, that is a missing machine feature - a GitHub issue, not an improvisation. Utility machines already exist for most of it: Clean Company Names, Stamp Tag, Add contact key, Add rank in company, Append fields, Verify Emails, Waterfall (see `n8n/INDEX.md`).

## What chat can and cannot do to Airtable, exactly

The Airtable MCP has no `create_view`, no `delete_view`, no `delete_field`, and cannot create select-field choices. Views are composed as filters and handed to the Operator to build in the UI; field deletions and new select options are manual.

- **Reading a view:** `list_views_for_table` returns name, ID, type only - never the filter, never a count. There is no "records from view X" call. Any "view count" is a replicated filter, run fresh.
- **Exact counts, cheaply:** `list_records_for_table` with `pageSize: 1` returns `metadata.totalRecordCount` for the full filtered set.
- **Select filters need the choice ID**, not the display string - a mismatch silently returns zero rows.
- **The filter tool holds one level of AND/OR** - no nested `(A OR B) AND (C OR D)` in one call. Decompose and check each layer's count.

## Views and export

One table, one working chain of views:

1. **Grid view** - default, untouched.
2. **Relevant** - the relevance filter: a company-level condition AND a title condition (title matching on seniority tokens - Founder, Chief, CTO, VP, Head, Director, Owner - never on domain nouns like Software/Data/Cloud, which every IC carries). `Cut review` is its exact complement; the two must sum to the table.
3. **`manually_approved`** - the rescue field: a row the filter cuts but a human approves stays in by checkbox, not by loosening the filter.
4. **Relevant + Found** - Relevant AND `Status` done AND `Final Email` populated. The campaign-ready population.
5. **Segment views** - one per campaign, cut from Relevant + Found. Segment counts must sum exactly to the parent - no row missed, none double-counted. Verify the sum every time; orphans hide in healthy-looking views.

**Export is the Deploy machine, not CSVs.** `Deploy View to Campaign` pushes a view into a PlusVibe campaign: required-field gate (Final Email, first name, company; every other VISIBLE column must be filled - hidden columns ignored, so the view is the control surface), name sanity check, DNC honor, read-back verification, `Deploy Error` stamped per row, a Lead Lists receipt with the view deep link. Dedupe mode comes from the launch row (Strict default = never re-email anyone who ever existed in the workspace).
