---
type: review
vertical: [intent, list-building]
status: awaiting Operator review, nothing published
date: 2026-09-01
---

# Handle Service Reviews Intent Signal - Operator review

Handler for the Trustpilot negative-service-reviews signal (Adelante), authored as repo source in `n8n/Handle-Service-Reviews-Intent-Signal/`. **Not pushed to n8n, no Airtable schema created, nothing spent.** Skeleton reused wholesale from `Handle-Hiring-Intent-Signal`; graph validated with `scripts/graph.js`, topology identical edge-for-edge.

## The signal

Apify `blackfalcondata/trustpilot-reviews-scraper`, reviews mode, on a DTC watchlist: `stars [1,2]`, `topics ["customer_service"]`, `sort recency`, `includeCompanyInfo true`, `countryOfReviewer US`. Server-side filters proven live 2026-08-27 (10 big + 10 small DTC brands, ~$0.04/run of 120-150 reviews). Webhook posts the standard `{ play: <Signals row id>, resource }` to `/webhook/service-reviews-intent-signal`.

## Reused verbatim vs written

| Piece | Status |
|---|---|
| Parse Launch, Client Vars, Prep/Poll/Apply ICP, Count Calls, Contact Calls (wide pull: CG seniority net, cap 12, Ark titles, Supersoniq banned), Apply DNC | Verbatim copies |
| Company Facts, Build Run Log, Guard Fail Log, Parse Play | Verbatim minus named diffs: source-node name, Automation name, drop-line labels, fallback `Signal Type = 'service_reviews'`, guard fix-it text |
| Build Intent Leads | Verbatim except `baseRow`: the `Job ...` payload block swapped for the `Review ...` / `Trustpilot ...` block; contact handling, net-new dedupe, stats untouched |
| DiscoLike BizData, ICP loop, upserts, waterfall fire, Clean Fields call, Log Run, Error Logger wiring, throttles, credentials | Copied node-for-node in workflow.json |
| **Filter & Qualify Reviews** (the source-parse) | **The one fresh node** |

## The fresh source-parse

Groups review rows by `companyDomain` into one company row per brand: `{domain, company, headcount 0, country, signal payload}`. Hard lines counted per drop: not-negative belt, no domain, hosted-platform fence (reused list), wrong country (company metadata only; `reviewerCountry` is the reviewer's, never gates; unknown passes per the hiring rule), already-in-table. **Not carried over, by nature of the source:** staffing words and body-shop test (job-post pathologies), and the headcount hard line (Trustpilot has no headcount; BizData lands Employees and the ICP sentence carries the size bar). Payload aggregated per company: negative count, freshest date + URL, top-3 quotes, titles, reply share (`replied_label`, e.g. `4/6` - the small-brand buyer signal), trust score, total reviews, Trustpilot URL, contact email from metadata rows.

## Payload columns the new table needs (beyond the standard intent set)

`Review Count` (number) · `Review Latest` (date) · `Review Link` (url) · `Review Titles` (text) · `Review Quotes` (long text) · `Review Replied` (text, "4/6") · `Trustpilot Rating` (number) · `Trustpilot Reviews Total` (number) · `Trustpilot URL` (url), plus the standard `ICP Reason`, `Existing In Role`, `detected_at`. Table itself per the clayroots-tables Intent section (relevance, manually_approved, linkedin_name_match, Deploy Error, Campaigns + Channel lookup, the chain).

## The Signals row I'd create (not created)

- **Name:** Adelante - Trustpilot service reviews - US DTC
- **Signal Type:** `service_reviews` (new select option, Operator adds)
- **Roles:** Customer Support, Customer Service, Customer Experience, CX (read as: existing support staff count, never a gate)
- **Target Table:** the new intent table in Adelante's ClayRoots base
- **Country:** US · **Max Employees:** 500 (enforced via the ICP sentence for this signal, see open decisions)
- **ICP:** "A consumer DTC ecommerce brand selling physical products from its own online store (Shopify or similar), roughly 10-500 employees; not a marketplace, aggregator, staffing firm, agency, or B2B software company. We sell an AI customer-support agent that answers pre-sale and post-sale inquiries."
- **Client:** Adelante · **Campaigns:** linked at deploy time (the feed switch)

## Open decisions for the Operator

1. **Sibling workflow vs source-parse branch.** INTENT-PLAYS.md says "a new type = one edit cycle on the handler's source-parse"; the build prompt said a new folder. I built the sibling per the prompt. Folding it into the one handler later (a Signal-Type branch at the parse) keeps one funnel to maintain; the sibling keeps blast radius zero. Either way the downstream is byte-identical today.
2. **Doors' ride-list convention.** The PV door treats `Job `-prefixed columns as ride-only (sent when filled, never block). The new payload uses `Review ` / `Trustpilot ` prefixes; the door's convention list needs those added, or the columns kept hidden in queue views, or they become required vars. One-line door edit, Operator's call.
3. **Which Apify actor carries the standing task.** blackfalcondata caps `companyDomains` at 10/run (watchlist = N runs, each firing the webhook; the handler is per-run and per-domain deduped, so this works but is chatty). memo23/trustpilot-scraper-ppe takes an unbounded startUrls list + `lastDays` for one daily run, but its dataset field names differ; the source-parse is written against blackfalcondata's shape and would need a mapping pass for memo23.
4. **Watchlist vs discovery cadence.** Reviews mode needs domains in; the universe comes from a monthly categories-mode run (or Storeleads size-filtered, the sharper small-brand lever). That universe-refresh task is not part of this handler and needs its own decision.
5. **Max Employees enforcement.** For this signal the hard line can't run pre-BizData (no headcount in reviews). Acceptable as ICP-only, or add a post-BizData employee gate in Company Facts (one edit, breaks "reused verbatim").
6. **`detected_at` semantics.** Stamped at run time, like hiring. The review's own `publishedDate` lands in `Review Latest`; if freshness windows matter for queue views, they should filter on `Review Latest`, not `detected_at`.

## Before first run (the checklist, when approved)

Push via `n8n-push.js` (never with a run in flight) · Operator attaches credentials to the new HTTP nodes · create the Signals row + select option · create the table + views per the skill · point the Apify task webhook at `/webhook/service-reviews-intent-signal` with the Signals row id · one proven run with the funnel read and rows spot-checked both sides · `audit-logging.js` · commit.
