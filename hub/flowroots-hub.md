---
vertical: [list-building, analysis, inbox-management]
type: infrastructure
owner: Operator
---

# Flowroots Hub

The one Airtable base (`appQG6dK0FIOhTxOl`) that is the database of the application: the CRM, the client registry, the client knowledge base, the run log, and the session journal in a single control plane.

**Structure lives in [`SCHEMA.md`](SCHEMA.md)**, compiled from the live base; regenerate with `node scripts/hub-pull.js`. This file carries only what the schema cannot say.

## The tables, what they mean

- **Clients** (`tblK0nCoNVvFf5SPa`) - the registry and address book. Base IDs, workspace IDs, channels, scheduler, routine URLs and keys. Every job resolves its client here first; nothing is hardcoded per client.
- **Prospects** (`tblEPFCO0kJn2tMyK`) - the CRM. Every prospect from a positive reply through a held meeting, all clients in one table, each row linked to its client. Upserts merge on `Dedup Key` ({client slug}|{domain}, plain text by design - Airtable cannot merge on computed fields).
- **KB Files** (`tblJAWVcCaW6TmfbC`) - the client knowledge base. One row per document, retrieval by Client + Type: `onboarding-form`, `overrides`, `qualification-prompt`, `product`, `research`, `intel`. Text in cells, never attachments. The `qualification-prompt` rows are read LIVE by the reply intakes. `Verified` checked = numbers confirmed with the client, usable verbatim in copy; unchecked = treat every number as unconfirmed. Note: Airtable rich text normalizes markdown and escapes underscores on write; machine readers must unescape (the intakes do).
- **Campaigns** (`tblbVPakE4n16ob7Y`) - one row per campaign instance, upserted on Campaign ID by the nightly syncs and the reply intakes. Carries the copy (`Campaign Copy`) and `Agent Config`.
- **Automations** (`tbli7rV6Qf3sLpV6R`) - the run log and launcher in one object. Read the row, not the n8n canvas, to know what a run did; verify by cell values on the target table, never by the log alone.
- **Logs** (`tbl70VAPYGBUhkyAp`) - the session journal, one row per working session at close: what happened, what was decided, what is open. The journaling surface every session, local or cloud, can reach. Replaces **Sessions** (`tbl3c80o7QlZ4VByU`), which is DEPRECATED - never write to it.
- **CONTROL PANEL** - one row per operation with its launch form link.
- **Meetings, Reports, Openers, Lead Lists, Messages, Contacts** - what their names say; Transactions / Recurring Templates / Content Posts are HQ finance and content, not fulfillment.

> History: the Hub took over as CRM when Close was retired on 2026-07-25. The Clients-folder dissolution moved client knowledge into KB Files on 2026-08-14. The legacy `Qualification Prompt` and `Overrides` fields on Clients are fallbacks until the KB path is verified on a live reply, then they die.

## The pipeline (the tiers)

`PipelineStatus` values, in order: **Positive Reply -> Scheduled Call -> Call Completed -> No Show -> Hot List -> Followup (BAMFAM) -> Followup (No Meeting) -> Holding -> Strategic Holding -> Closed Won -> Closed Lost -> Disqualified.** A positive reply is the floor - the lowest point we work; everything below it (pre-reply) lives in the sender, not here.

**The status law:** a client's prospects use only the pre-booking band plus terminals - Positive Reply, Scheduled Call, Call Completed, No Show, Disqualified. Everything past the completed call (Hot List, the Followups, Holding, Strategic Holding, Closed Won/Lost) is reserved for Flowroots' own prospects, because Flowroots runs its own sales but hands a client's prospect off at the booked meeting.

## Status maps to situation

| PipelineStatus | Inbox situation |
|---|---|
| Positive Reply | First reply / Conversation / Follow-ups (by last touch) |
| Scheduled Call | Meeting booked, then Pre-call |
| No Show | No-show |
| Holding / Strategic Holding | Defer (Flowroots only) |
| Hot List / aged | Cold re-open (Flowroots only) |

## How automations write

- **The reply intakes** (PlusVibe + Alta) create the Prospect row and a linked Contacts row off a positive reply, set `PipelineStatus` (Positive Reply, or Disqualified when out-of-ICP), fill `QualificationStatus`, `Qualification Brief`, `contextNotes`, link the Campaign, and fire the client's inbox routine.
- **The 12-hourly thread syncs** refresh `Conversation Thread`, `Last Engaged`, `Last Touch`.
- **The booking flows** set Scheduled Call and create a full Meetings row.
- **The Fathom meeting-summary sync** sets Call Completed.
- **The BDR Slack sync** posts call updates onto the row as record comments.

## How to read it

- **A client's pipeline:** the filtered view on Prospects, filter by `Client`.
- **A lead's state:** the row itself - status, qualification, `Conversation Thread`, `contextNotes` - plus record comments for the BDR trail and linked Meetings / Messages / Contacts.
- **Move the status:** update `PipelineStatus` when a situation resolves, within the status law's band for the client.
- **Log the touch:** append to `contextNotes` or a record comment, dated, so the timeline stays honest.

## Gotchas, paid for

- **Airtable upsert clobbers payload fields:** an upsert writes the same field set on create AND update, silently re-stamping first-occurrence facts. Durable stamps belong in `CREATED_TIME()` formula fields, not payload.
- **Interface deep links:** every client link is built from the client's own `Dashboard Page ID` as the path; the detail page IDs are shared constants (Prospects `pagU8C93nMn6vPMTM`, Campaigns `pagnDARjFPzq5HclC`). Never borrow another client's page id.
- **Select filters need the choice ID**, not the display string; a typo'd display string returns zero rows silently.
- `list_records_for_table` with `pageSize: 1` still returns `metadata.totalRecordCount` - the cheap exact count.
