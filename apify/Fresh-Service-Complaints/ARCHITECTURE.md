---
type: review
vertical: [intent, list-building]
status: LIVE 2026-09-06
date: 2026-09-06
---

# Service Reviews Intent Signal - as shipped

The Trustpilot negative-service-reviews signal for Adelante, live end to end 2026-09-06. This file is the architecture of record; the earlier static-watchlist designs (51k-domain task input, category score threshold) are dead - the 1,500-domain runs crashed at load 2026-09-01 and the design was replaced, not patched.

## The architecture

```
Apify schedule (daily 05:00 UTC)
  -> task fresh-service-complaints-daily (aH50ImWpUYUzob8D7)
     runs OUR actor natty_violet/fresh-service-complaints (9xc25yKyrOktuTvRY)
       step 1  FEED: each Trustpilot category page sorted by latest_review
               = the stores reviewed since yesterday, whole category, no list held anywhere
       step 2  FILTER: those stores in batches of 10 -> 1-2 star, topic customer_service,
               lookback 2 days (blackfalcondata child, every call charge-capped)
       output  one dataset: review rows + company metadata
  -> webhook ai25GtaGIr7jZq2qb: { play: recM3l6gfnWHYfgb4, resource }
  -> n8n Handle Service Reviews Intent Signal (AaUCNxL8xMef92pq)
       hard lines -> BizData -> ICP (DTC US/UK sentence) -> wide contact pull -> upsert
  -> table US+UK DTC - Service Reviews (Intent) (tblAVm4eyTkss9jWK), Adelante base
```

Actor source: `apify/Fresh-Service-Complaints/` in this repo (main.js ~90 lines), deployed with `apify push`. The repo is the source of truth; the account runs the deployed copy - same relationship as n8n/.

Also live: `adelante-support-hiring-daily` (task A5CQDtgBemnf9kfkY, schedule 10:30 UTC, webhook ZZN1r2BfSZ2NJDk1X -> /webhook/intent-signal, play recOqOd92kO60dLH5) - the hiring signal on the unchanged hiring handler, target table tblgpuwLFPQNfMLJq.

## Proven, with numbers (2026-09-06)

- Sort test: category page + `sort=latest_review` passes through the child actor; returns the recency mix, not the best-of list ($0.01).
- Actor proof run (1 category, 3 feed pages): 36 stores -> 53 fresh negative service reviews at 16 companies, freshest 37 minutes old, 3 minutes, ~$0.12, zero failed batches.
- Production input: 4 categories (clothing, cosmetics, furniture, electronics), 6 pages each, lookback 2.

## Cost controls, layered

Child calls carry maxTotalChargeUsd 1 each - maxDomainsPerRun 1000 - maxReviewsPerCompany 20 - task timeout 3h. Expected morning: well under $1 scrape; enrichment only on funnel survivors, counted per stage in the run log.

## Tuning knobs (task input, zero code)

- More volume: add categories, raise feedPagesPerCategory, widen lookbackDays, drop the topics filter.
- Less noise: keep topics, tighten the ICP sentence on the Signals row, tighten relevance/views.
- Marketplace noise (Vinted, Redbubble, TeePublic appear in feeds) is killed by the ICP sentence, by design; it is not a scrape problem.

## Still open

- Views on both intent tables (standing chain + share link): Chrome pass, before campaign feeds.
- Campaigns + queue views + Signal link when copy exists.
- Landed companies do not refresh (already-in-table gate); re-trigger policy is a later views/campaign call.
- Apify token is in the OS keyring via `apify login` on this machine; rotate from the console if it leaks.
