# Supersoniq

**Kind:** contacts database. Opens a build on contacts — and every companies-first build arrives here for the contact pull. You run the pull yourself over MCP, after the operator approves the stated cost.

## Query output
A **filter set** — one or several — structured filters only (geography, seniority, headcount, function). How many is the scoping call ([[Scoping Queries]]). Authoring detail below.

## CSV output
**One merged CSV per major pull** (one ICP or one domain list; internal batching invisible), into the client's Reports folder, conformed to the house schema (`Output Interface.md`):

- Supersoniq carries company columns on every contact row; on a contacts-first pull those ride as the company data.
- On a companies-first pull, **left-join the discovery infographics on `domain`: the infographics win on company fields**, the overlapping raw columns drop, every contact-level field is kept. One pass at CSV assembly.
- **Verified gate:** `contact_email_status` = Verified keeps the email and marks `Verified=true`; anything else marks false so ingest blanks it and the waterfall re-finds it.
- **Include the contactless domains** (a Domain with no Name) so the domains-without-contacts split stays visible; never ship a contacts-only file when domains went in.

## Where it is strong

- **The people are on LinkedIn**: corporate, GTM, funded, mid-market and up.
- **Validated domains in hand → their decision-makers** — the domain bridge, the strongest single move here.
- **The person's own signal**: contact-level geography and name carry what a company's web presence hides.

When the people are not on LinkedIn (owner-operated, local, trades), Supersoniq caps like every LinkedIn-anchored database — a signal about where the data lives, not proof the market is empty. The fallback is [[ContaGen]], on the operator's call.

## Authoring the query

Structured filters only. Preflight with `get_filter_values` (free) so a filter value does not silently zero out, and `count_contacts` to size. Pull breadth on seniority rather than exact titles, so real decision-makers are not silently dropped.

- **No Software/SaaS industry label.** The taxonomy is LinkedIn-style; you cannot isolate a software niche with the `industries` filter. Pull on the filters that exist and isolate the niche after the pull from each record's company industry tags.
- **`search_hybrid` is broken for tight targeting** — the query string acts as a hard keyword constraint and tends to collapse to a single match, while still costing credits. Real pulls use structured filters.
- **`count_contacts` is an estimate.** A suspiciously round number — especially exactly 1000 — means "at least this large, probably far larger." Never conclude a corpus is small off a round count.

## The domain bridge (companies-first pulls)

1. `match_companies` (free) — size how many of the domains Supersoniq holds and the contacts behind them.
2. `enrich_companies` — pull the decision-makers (email + company firmographics; never a phone). Caps at roughly companies x per-company-limit under ~2000 per call — batch large domain sets (e.g. 200 domains at per_company_limit 10).

## Cost model (size, state, get the yes)

- **Free:** `get_key_info` (balance + cost map), `count_contacts`, `get_filter_values`, `get_usage`, `match_companies`, `save_list`, `build_icp`, `search_contacts` in preview mode.
- **Contact pulls** (`search_contacts`, `search_lookalike`, `get_icp_contacts`, `enrich_companies`): **full = 1 credit including email; naked = 0.5 without.** Pull full when these people will be emailed — pulling naked "to find emails later" forces a full re-pull, a mistake already paid for.
- **`enrich_fields`**: 0.2 credit per delivered field; at 3+ fields a naked pull is cheaper.
- **Phones**: 10 credits (25 specialty), only if on file; never included in a pull.
- **Email finding**: 2 partner credits per target, not refunded on not-found. **Verification**: separate wallet, 1 credit per real verdict.
- Over the confirm threshold, pass `confirm:true`. The partner key tracks credits separately — confirm the balance on the key in use before concluding you are out.
