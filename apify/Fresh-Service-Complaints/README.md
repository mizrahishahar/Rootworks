# Fresh Service Complaints

The one custom Apify actor in the estate, and the front half of the Trustpilot service-reviews intent signal (Adelante). Settled with the Operator 2026-09-06 after the static-list architecture failed at load (1,500-domain runs crashed 2026-09-01; the 51k-universe design is dead, never revive it).

## What it does

1. **Feed:** reads each Trustpilot category page sorted by `latest_review` - the stores reviewed since yesterday, across the entire category. Verified live 2026-09-06: the sort passes through the child actor and returns the recency mix, not the best-of list.
2. **Filter:** for those stores, in batches of 10 (the child actor's hard cap), fetches only 1-2 star reviews tagged `customer_service` within `lookbackDays`. Stores whose fresh review was positive or off-topic return nothing and cost nothing.
3. **Output:** one dataset of review rows + company metadata rows - the exact shape `Handle-Service-Reviews-Intent-Signal` parses. The scheduled task's webhook posts `{ play: <Signals row id>, resource }` to `/webhook/service-reviews-intent-signal`; this actor never calls n8n itself.

Both children are `blackfalcondata/trustpilot-reviews-scraper` (categories mode proven at 350 rows; reviews mode proven at 10-domain batches). Every child call carries `maxTotalChargeUsd`.

## Deploy

```
cd Rootworks/apify/Fresh-Service-Complaints
apify push
```

Needs `apify login` once (Operator's API token, console -> Settings -> API & Integrations). The deployed copy runs on the Flowroots Apify account; this folder is the source of truth, committed like every n8n workflow.

## The scheduled task (one, daily)

- Actor: this one. Input: the prefilled defaults (4 categories, lookback 2, stars 1-2, customer_service).
- Schedule: daily 05:00 UTC.
- Webhook (run succeeded): `https://n8n.flowroots.com/webhook/service-reviews-intent-signal`, payload template `{ "play": "recM3l6gfnWHYfgb4", "resource": {{resource}} }`.
- Task max charge: $2. Child calls capped at $1 each.

## Cost shape

Feed ~$0.02/category/day. Filter: billed per delivered review ($0.00025) + $0.005 per 10-store batch start. A normal morning across 4 categories lands well under $1. The knobs: `categories`, `feedPagesPerCategory`, `lookbackDays`, `topics`.
