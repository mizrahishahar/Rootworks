---
vertical: [list-building]
type: infrastructure
owner: Operator
---

# Apify

Intent-based scraping source: an Apify actor detects a buying signal - a job post, a hiring spree, a tech-stack change, whatever the store can scrape - and hands the hits to the shared intent machine, which qualifies, verifies, and enrolls them. A standing task runs the actor on its own cadence; the surfaced contacts land continuously in the client Intent table in [[clayroots]], not in dated build tables. One task and one webhook per play.

## The signal
An actor plus its input: the audience and the trigger it scrapes, on a schedule that fits how often the signal changes.

## Actions (MCP)
- **Find the actor:** `search-actors` for the signal, `fetch-actor-details` to read its README and input schema.
- **Read a run:** `get-actor-run`, `get-dataset-items` to inspect what an actor returns.
- The MCP finds, reads, and runs actors; it does **not** create a scheduled task or a webhook - those are console actions.

## Operator actions
Create the scheduled task with the prepared input, and set its webhook to the shared intent-signal endpoint. The webhook payload carries the play's identity: `{client, table, campaign, eventType, resource}`, plus any filter knob that deviates from the defaults.

## Spend check
Apify compute per run; the schedule cadence and the input's result cap are the cost control. The downstream enrichment and verification are guarded by the intent machine, not here.
