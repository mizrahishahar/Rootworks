---
vertical: [list-building, analysis, inbox-management]
type: infrastructure
owner: Operator
---

# Flowroots Hub

The one Airtable base (`appQG6dK0FIOhTxOl`) that is the CRM, the client registry, and the run log in a single control plane. The CRM is its **Prospects table** (`tblEPFCO0kJn2tMyK`): the system of record for every prospect from a positive reply through a completed meeting, all clients in one table, each row tied to its client by the `Client` linked field into the Clients registry - Flowroots' own prospects link to the Flowroots row. The inbox run works from its records, analysis reads relationship state, and `PipelineStatus` *is* the lead's tier. The registry, AUTOMATIONS, SESSIONS, and CONTROL PANEL tables are broken down in [[clayroots]].

> History note: the Hub took over as CRM when Close was retired on 2026-07-25.

## The Prospect row
Name, Website, `domain` (formula), `Client` (link), Industry, Headcount, ARR, `PipelineStatus`, `QualificationStatus` (Qualified / Needs Review / Disqualified / TO CHECK), `Qualification Brief` (rich text), `contextNotes` (rich text), Proposal, `NextTouchDate`, and linked Meetings / Messages / Contacts / Transactions. Record URLs take the form `https://airtable.com/appQG6dK0FIOhTxOl/tblEPFCO0kJn2tMyK/<recordId>`, and the record id is what downstream automations take - the Onboard Client webhook fires with `?recordId=<Prospects record id>`.

## The pipeline (the tiers)
`PipelineStatus` values, in order: **Positive Reply -> Scheduled Call -> Call Completed -> No Show -> Hot List -> Followup (BAMFAM) -> Followup (No Meeting) -> Holding -> Strategic Holding -> Closed Won -> Closed Lost -> Disqualified.** A positive reply is the floor - the lowest point we work; everything below it (pre-reply) lives in the sender, not here.

**The status law:** a client's prospects use only the pre-booking band plus terminals - Positive Reply, Scheduled Call, Call Completed, No Show, Disqualified. Everything past the completed call (Hot List, the Followups, Holding, Strategic Holding, Closed Won/Lost) is reserved for Flowroots' own prospects, because Flowroots runs its own sales but hands a client's prospect off at the booked meeting.

## Status maps to situation
The status names the inbox situation to work:

| PipelineStatus | Inbox situation |
|---|---|
| Positive Reply | First reply / Conversation / Follow-ups (by last touch) |
| Scheduled Call | Meeting booked, then Pre-call |
| No Show | No-show |
| Holding / Strategic Holding | Defer (Flowroots only) |
| Hot List / aged | Cold re-open (Flowroots only) |

## How automations write
- **The reply qualifiers** create the Prospect row and a linked Contacts row off a positive reply, set `PipelineStatus` to Positive Reply (or Disqualified when out-of-ICP), and fill `QualificationStatus`, `Qualification Brief`, and `contextNotes`.
- **The booking flows** set Scheduled Call and create a full Meetings row (Title, Date, Company link).
- **The Fathom meeting-summary sync** sets Call Completed.
- **The moveplnr Slack sync** posts BDR call updates onto the row as record comments.

## How to read it
- **A client's pipeline:** the filtered view on the Prospects table, filter by `Client`. One table, one view per client - the inbox and pipeline read.
- **A lead's state:** the row itself - status, qualification, `contextNotes` - plus its record comments for the BDR call trail and its linked Meetings / Messages / Contacts.
- **Move the status:** update `PipelineStatus` on the row when a situation resolves (booked, no-show, held), within the status law's band for the client.
- **Log the touch:** append to `contextNotes` or add a record comment, dated, so the timeline stays honest.
