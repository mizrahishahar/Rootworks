---
vertical: [list-building, analysis, inbox-management]
type: infrastructure
owner: Operator
---

# Close

The CRM, the system of record for every prospect from a positive reply through a completed meeting. One org, separated by a `Client` field. The inbox run works from its records, analysis reads relationship state, and the pipeline stage *is* the lead's tier.

## The pipeline (the tiers)
The kanban is the Opportunity pipeline. Stages, in order: **Positive Reply -> Meeting Booked -> No Show -> Meeting Completed -> Hot List -> Holding -> Strategic Holding -> Closed Won -> Closed Lost -> Not Interested.** A positive reply is the floor - the lowest point we work; everything below it (pre-reply) lives in the sender, not here.

## Stage maps to situation
The stage names the inbox situation to work:

| Close stage | Inbox situation |
|---|---|
| Positive Reply | First reply / Conversation / Follow-ups (by last touch) |
| Meeting Booked | Meeting booked, then Pre-call |
| No Show | No-show |
| Holding / Strategic Holding | Defer |
| Hot List / aged | Cold re-open |

## Actions (MCP)
- **Read the leads we work:** `lead_search` / `find_opportunities`, filtered by `Client` and stage.
- **Read a thread's state:** `fetch_lead`, `find_notes`, the Message custom activities.
- **Move the stage:** `update_opportunity` when a situation resolves (booked, no-show, held).
- **Log the touch:** `create_note` or a Message activity, backdating `date_created` so the timeline stays honest.

Custom fields carry the `Client`, the Qualified verdict, and the `Thread ID` (a Slack ts) that ties a record to its live thread.
