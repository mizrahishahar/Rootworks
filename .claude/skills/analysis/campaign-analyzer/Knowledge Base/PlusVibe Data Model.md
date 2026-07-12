# PlusVibe Data Model

PlusVibe is the cold email sending platform. This is where campaign performance data lives and how to pull and count it honestly.

## Access

- **PlusVibe MCP** - the primary interface. Tools are named plainly (`get_workspaces`, `list_campaigns`, `get_campaign_stats`, `get_analytics_stats`, `get_campaign_summary`, `get_emails`, `get_campaign_emails`).
- **REST API** - base `https://api.plusvibe.ai/api/v1`, header auth. The automations use the raw endpoints; the MCP wraps the same data.

## Hierarchy

```
API key
 └── Workspace        (one per client; has id + name)
      └── Campaign     (has _id/id, name, status)
           └── Leads / Emails (sent + received)
```

One workspace maps to one client. Always scope a pull by `workspace_id`.

## Core pulls

| Need | MCP tool | Key params |
|---|---|---|
| List workspaces | `get_workspaces` | none |
| List campaigns + status | `list_campaigns` | `workspace_id`, `status?`, `limit?` |
| Per-campaign sent + stats | `get_campaign_stats` | `workspace_id`, `start_date`, `end_date?`, `campaign_id?` |
| Workspace aggregate stats | `get_analytics_stats` | `workspace_id`, `start_date`, `end_date` |
| One campaign summary | `get_campaign_summary` | `workspace_id`, `campaign_id` |
| Inbound replies | `get_emails` | `workspace_id`, `email_type=received`, `preview_only=true`, `campaign_id?`, `label?`, `page_trail` |
| Sent emails for a lead | `get_campaign_emails` | `workspace_id`, `lead`, `campaign_id?` |

`get_emails` is paginated: follow `page_trail` from each response until it is empty.

## The objects

**Campaign** - `_id` (or `id`), `name`, `status`. Status values: `ACTIVE`, `COMPLETED`, `DRAFT`, `PAUSED`.

**Stats row** (from `get_campaign_stats` / `get_analytics_stats`) - keyed by `_id`; the field that matters is `sent_count`. Open tracking is not used (cold email opens are unreliable and pixel-based opens inflate noise), so opens are never a band input.

**Received email** (a reply) - `campaign_id`, `thread_id` (fallback `source_thread_id`), `lead_id`/`lead`, `label`, `timestamp_created` (fallback `source_modified_at`).

## Label taxonomy

Raw PlusVibe labels roll up into six buckets:

| Bucket | Raw labels |
|---|---|
| **positive** | `INTERESTED`, `MEETING_BOOKED`, `MEETING_REQUEST`, `POSITIVE_REPLY` |
| **booked** | `MEETING_BOOKED` (also counts as positive) |
| **completed** | `MEETING_COMPLETED` (also counts as positive) |
| **no-show** | the no-show label (also counts as positive) |
| **ooo** | `OUT_OF_OFFICE` |
| **negative** | `NOT_INTERESTED` |
| **info** | `INFORMATION_REQUEST` |
| **wrong** | `WRONG_PERSON` |
| **other** | anything uncategorized |

The booked / completed / no-show labels are **operator-maintained in PlusVibe** and are the live source for the Booking and Show audits. Booking rate = booked / positives. Show rate = completed / (completed + no-show).

## Counting methodology (do this every time)

This is what makes a rate honest. The digest and weekly automations both count exactly this way.

1. **Campaign universe.** Keep `ACTIVE` + `COMPLETED` only. Exclude `DRAFT` and `PAUSED` from every total. Count `ACTIVE` separately when you want the live campaign count.
2. **Sent.** Sum `sent_count` across kept campaigns for the window.
3. **Replies = unique threads.** Take every received email, drop any whose `campaign_id` is not in the kept set, then dedup by `thread_id` (fallback `source_thread_id`, then `lead+campaign`). Keep the **latest** message per thread by timestamp. The thread's category is that latest message's label bucket.
4. **Genuine replies exclude OOO and automatic replies.** The headline reply rate counts human replies only (positive, negative, info, wrong, other-human). OOO is reported as its own line and judged on its own stick, never mixed into the reply rate.
5. **Rates.**
   - Genuine reply rate = human replies (OOO/auto excluded) / sent
   - Positive rate = positives / sent
   - Booking rate = booked / positives ; Show rate = completed / (completed + no-show) — both from the PlusVibe labels above.
6. **Sending days are Mon-Fri.** "Yesterday" in any pulse read means the last sending day.

## Sending Pulse pulls

There is no ready "scheduled today" metric; compute it per active campaign:

- `get_campaign_summary` gives `contacted`, `completed` (leads who finished the sequence), `total_sent_emails`.
- `get_lead_count` gives total loaded leads.
- **New leads remaining** = total loaded - contacted. **Follow-up load** = contacted - completed (leads still moving through the sequence, mapped against the sequence waits for what is due).
- **Runway (sending days)** = new leads remaining across active campaigns / daily new-lead consumption.

## Standing report artifacts

Two automations pre-compute this counting and write files into the client's folder. Read them as fast input before pulling live:

- **Daily Campaign Digest** - overwrites `latest-campaign-report.md` in the client's `Reports/` folder each morning. Lifetime totals, per-campaign numbers, workspace tier, band diagnosis.
- **Weekly KPI Report** - writes `YYYY-MM-DD - Weekly report.md` into the client's `Logs/` folder each Friday. This week vs last week with deltas, campaign ranking by positives.