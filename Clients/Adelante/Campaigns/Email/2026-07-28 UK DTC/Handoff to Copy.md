# Adelante — UK DTC — Handoff to Copy

Built 2026-07-28. Source: [[Storeleads TO Supersoniq TO Clayroots]] waterfall, UK Shopify+WooCommerce, wide-open on revenue/employees/age (per Shahar's call for volume). Contacts table: `Adelante Clayroots` base, `UK DTC Shopify+Woo - Contacts - 2026-07-28`, filtered through the `Campaign ready` view (title/industry noise cut) before segmentation.

## The segmentation, and why

Two axes drew these 11 campaigns:

1. **Vertical** (`Industry Groups`) — Apparel & Footwear, Home & Garden, Food & Drink, Beauty & Fitness, and Sports are each big enough and different enough in their support pattern to earn their own angle (sizing/returns for apparel, damaged-in-transit for home goods, perishables/subscription for food, routine/repeat for beauty). Everything too thin to stand alone (Pets & Animals plus a long tail — Toys, Books, Computers, Games, Autos, Electronics, Health, etc.) folds into **General DTC**.
2. **Persona** — Founder/Owner vs. Hired Operator (C-Suite, President, VP, Head, Director). This is not personalization, it's a different pitch: a founder feels the cost personally (their own money, their own risk); a hired operator feels the workload (their team, their SLAs). Sports stays a single campaign — its founder/hired-operator split would break under ~120 contacts per side, too thin to write to separately.

## Per-segment breakdown

| # | Segment | Count | Angle |
|---|---|---|---|
| 1 | Apparel & Footwear — Founder/Owner | ~230 | Direct: your money, your risk. Sizing/returns pain, personally felt. |
| 2 | Apparel & Footwear — Hired Operator | ~409 | Your team drowning in sizing/returns tickets; make them senior, don't replace them. |
| 3 | Home & Garden — Founder/Owner | ~182 | Direct. Damaged-in-transit and delivery-issue tickets eating founder time. |
| 4 | Home & Garden — Hired Operator | ~323 | Team-workload framing on the same pain. |
| 5 | Food & Drink — Founder/Owner | ~165 | Direct. Perishables/subscription support load (delayed shipments, spoilage claims). |
| 6 | Food & Drink — Hired Operator | ~294 | Team-workload framing. |
| 7 | Beauty & Fitness — Founder/Owner | ~103 | Direct. Subscription/repeat-order support rhythm. |
| 8 | Beauty & Fitness — Hired Operator | ~182 | Team-workload framing. |
| 9 | Sports | ~182 | No persona split — write to founder and operator both, general framing. |
| 10 | General DTC — Founder/Owner | ~274 | Direct, vertical-agnostic. Standard WISMO/returns pain. |
| 11 | General DTC — Hired Operator | ~488 | Team-workload framing, vertical-agnostic. |

## True personalization available per row

Every contact carries, and can be merge-tokened into copy:

- `first_name` — verified against `Title`, always populated
- `Company` — brand name
- `Title` — exact role, e.g. "Managing Director," "Head of Customer Service"
- Domain-side context (via `Key Apps`, `Tech Stack`) — whether the store already runs a chat/support bot (bot-gap signal, same as the Israeli build): worth checking before claiming "no bot" in an opener, since StoreLeads app data lags — spot-check before naming a specific tool.

## Cautions for copy

- **Emails are unverified.** Supersoniq delivered them directly at pull time; no bounce/catch-all verification pass has run on this table (unlike the Israeli Contacts table, this one has no `MV`/`BB`/`Status` fields at all — a known gap in this waterfall's table schema). Flag to Shahar before a large send if deliverability risk matters.
- **Company-fit is post-hoc filtered, not source-filtered.** The pull went wide open (all revenue/employee/age bands) with no industry filter available at source — filtering happened after the fact on `Industry Groups`. Some non-DTC noise (charities, universities, industrial B2B) was caught and excluded, but treat any single row with skepticism if the company name doesn't obviously read as a retail brand.
- **"Founder"/"Owner" is Supersoniq's own title classification**, not a verified ownership fact — a "President" or "Managing Director" could occasionally also be a real founder using a different title; the persona split is a good proxy, not a certainty.

## Exports

CSV per segment drops into its own folder above, named `UK DTC Shopify+Woo - {Segment} - 2026-07-28.csv`, once the Operator exports each of the 11 views.
