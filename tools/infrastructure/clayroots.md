---
vertical: [list-building]
type: infrastructure
owner: Operator
---

# ClayRoots

Our own Clay, multi-tenant: one Airtable base per client, driven by one shared set of n8n waterfalls (the `waterfall` tools). A waterfall lands finished tables in the client base, the email waterfall fills the verdicts, skills clean and segment inside the base, and a view per campaign exports the ready list. It is not the CRM.

## The Hub (`appQG6dK0FIOhTxOl` - Flowroots Hub)

The control plane. Every automation resolves its client here at runtime; nothing is hardcoded per client.

- **Clients registry** (`tblK0nCoNVvFf5SPa`) - one row per client: Clayroots Base ID, PlusVibe Workspace ID, Slack Channel ID, driveMainFolderID, Close Smart View ID, Qualification Prompt. The first read of any build.
- **AUTOMATIONS** (`tbli7rV6Qf3sLpV6R`) - one row per run of every automation, the launcher and the log in one object. On-demand runs are born by a creation form (one form view per automation, prefilled links in CONTROL PANEL); event-driven flows create their own row already stamped Running. Lifecycle: Running, then Succeeded or Failed. Each row carries the params it launched with, the Client link, counts in and out, credits, duration, and a rich per-run Description. Read the row, not the n8n canvas, to know what a run did.
- **SESSIONS** (`tbl3c80o7QlZ4VByU`) - selected operational session logs, one record per run of a logging SOP: Session, Type (Email Campaign, Linkedin Campaign, Onboarding, List Build, Infra Plumbing, Analysis / Strategy), Client, Date, Log, Deliverables. Human-to-human communication stays in the vault Logs folder.
- **CONTROL PANEL** - one row per operation with its launch form link.

## A client base

Resolved from the registry, never assumed. Inside it, two kinds of tables:

- **Build tables** - born by a waterfall, one list one table, disposable after its campaign loads: `{Build} - Contacts - {date}` and `{Build} - Domains - {date}`.
- **Standing tables** - permanent: the Intent tables (per the intent flows), and DNC Domains (ingest drops matches).

## The contract

A build table carries its source pass-through plus the stable spine the machine relies on:

- `Contact Key` - lower(first + last + domain), the dedup identity; every contact write is an upsert on it, which is why re-runs never double rows.
- `Domain`, `Name`, `first_name`, `last_name`, `Company`, `company_clean`, `Email`, `Verified`.
- The email-waterfall set: `MV P0`, `P1 (Trykitt)`, `MV P1`, `P2 (LeadMagic)`, `MV P2`, `BB`, `Final Email`, `Status`, `Source`. Campaign-ready = `Status` done + `Final Email` populated.
- `Seniority Rank` - row-local formula. `RankInCompany` - stamped by the pipeline rank pass, rewritten on every touch, never edited by hand.
- Provenance: `segment`, `query_name`, `ingested_at`.
- Domains tables carry `public_emails_clean` plus the verification set.

Everything else is the source to carry, and welcome; read the real table, never assume the column set.

## The responsibility line

Data transformation belongs to the waterfalls; ClayRoots is where judgment is applied to finished data. Claude touches rows only through scoped Airtable MCP actions:

- **Read** - filtered searches and counts against the live base; count before asserting a distribution. Read views to hand rows to a skill.
- **Write** - surgical, capped 50 records per batch, upsert on a stable id; stamping a segment field on qualifying rows is the model case. Never rebuild what a source column carries.
- A "does not contain" filter also sweeps in blank rows; handle the blank case explicitly.

Bulk transformation, cross-source joining, ranking, dedup, formatting: those are waterfall capabilities. When a build needs one the machine lacks, that is a missing waterfall feature to name and build in n8n, not an operation to improvise.

## Views and export

One view per campaign, gated on the segment filters composed with campaign-ready (`Status` done, `Final Email` set) and the per-company cap (`RankInCompany` <= N). Grouped-by-Domain views show counts natively. Cut the views, download the CSVs, land them in the campaign folders, fill down a Loaded stamp.
