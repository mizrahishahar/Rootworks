# DiscoLike

**Kind:** company-discovery tool. Opens a build on companies. The operator runs the platform and DiscoGen (the validation + variables pass); qualified domains come back. You author the query, analyze, and debug — nothing else.

## Query output
An **ICP description** — one paragraph per query — plus the **suggested seeds** and the **filters worth setting**. One spec per query; how many queries is the scoping call ([[Scoping Queries]]). How to write the description is below.

## CSV output
None. This handler produces no CSV: the operator runs the discovery and hands back qualified domain CSV(s) carrying the DiscoLike infographics and the DiscoGen variables. Those domains feed the contacts handler, whose CSV output joins these infographics back on `domain`.

## What it is (why authoring here pays)

A B2B company-data platform that indexes the web from SSL certificates rather than buying LinkedIn data. ~70M domains, essentially every company with a secure website, 40+ languages, ~3x LinkedIn coverage. It reaches the blue-collar, SMB, private, and international long tail that LinkedIn-anchored tools miss. Every discovery row carries the company's cleaned homepage text and firmographics free; DiscoGen reads that data to validate the companies and extract variables.

## The engine model (what the description is matched against)

A query is a "mini-vertical": seed domains plus a text definition. DiscoLike embeds the definition and ranks all ~70M domains by **cosine similarity against each company's homepage text**. Quality is highest at the front and degrades toward the tail; the system auto-stops when industry variance rises.

- **Recall lives in the vector; filters only subtract.** The embedding (seeds + icp_text) defines the candidate pool; every filter subsets it and never adds. Invest in the description and the seeds; spend filters sparingly.
- **Seeds are the search vector.** Use genuinely representative ones (client's won deals, textbook-fit companies); a few off-ICP seeds bias the whole ranked pull.
- **Analyze ICP is the entry move.** The platform turns your description into a query plan (~5 seeds + keywords). Author the description, review the returned plan against client context, tune.

## Writing the ICP description (the deliverable)

The description is a paragraph, one per query, that the operator drops into the platform. It gets embedded and matched against homepage text — so **write it the way the target's homepage reads, not the way a firmographic brief reads.**

- **Describe the company, in its own vocabulary.** What it does, the services it names, who it serves, how it talks about itself. A residential mover's page says "local and long-distance moving, packing, storage, free in-home estimates, families and homes" — so the description says that. Abstract labels ("SMB logistics providers") embed against nothing.
- **Cover the niche's wording variants.** The embedding captures meaning beyond exact words, but feed it the spread anyway: the service names, the customer types, the offer phrases the niche's real sites use. Thin descriptions rank thin-copy sites; rich descriptions discriminate.
- **One audience per description — the one-sentence test.** Every sentence should be SPECIFICALLY true for the target and not for its neighbors. Residential ("we move your home, free in-home estimate, families") vs commercial ("office relocation, FF&E, minimize downtime, facility managers") cannot share a paragraph — that is two queries (see the split tests below).
- **Exclude by omission, not negation.** The description pulls toward what it contains; keep the near-miss neighbors out by never using their vocabulary, not by writing "not X" (negation embeds the very words you want distance from).
- **Firmographics do not belong in the text.** Geography, size, revenue live in the filters; homepage text does not say "51-200 employees," so writing it buys nothing and dilutes the vector.
- **Name the variables the segments will need.** The query-implied segments are set at scoping (see [[Scoping Queries]]); DiscoGen extracts variables from the homepage data — name in the spec what the intended segments will select on, so it rides in on the rows.

The full spec you hand the operator, per query: the description, the suggested seeds, and the filters worth setting.

## The filters, by behavior

- **category** — THE precision anchor. Uppercase enum, top 2 per company, reliable classification: kills wrong-industry drift, rarely removes real targets. Anchor every spec on it and add adjacent groups (e.g. residential movers = CONSUMER_SERVICES; commercial movers = BUSINESS_PRODUCTS_AND_SERVICES; van-line/long-haul can tag SUPPLY_CHAIN_AND_PROCUREMENT). Verified: the category anchor took real-target density ~20% to ~77% on a 100-sample.
- **consensus / variance** — keep near defaults (10 / MEDIUM); let category carry precision. To reach deeper into the tail, raise variance — not min_similarity.
- **min_similarity** — usually not binding: the result set has a natural floor set by the variance auto-stop (a 10k pull at 65 bottomed ~75). Lowering it below the natural floor surfaces nothing.
- **phrase_match** — RISKY: drops any company whose homepage lacks the words. Quoted = exact phrase; unquoted words in one chip = AND; separate chips = OR (widens); a + prefix requires a term across the OR groups. For recall, few broad unquoted single tokens, each its own chip; exact multi-word phrases miss wording variants. Phrases never create recall.
- **negate_phrase_match** — RISKIEST: removes real targets that happen to use the word. Run near-zero negates; DiscoGen does precision downstream.
- **Geography** (country ISO-2 + region shortcuts, state), **employee_range** (1-10 … 10001+), **revenue_range** (<1M … >1B), **business model** (B2B/B2C/…, useful for residential-vs-corporate splits), **digital footprint** (0-800; a floor drops single-page shells; auto-zeroed for small-footprint verticals), **tech_stack** (vendor domains, Team plan), **exclude_leadgen** (API-only, default true, leave it).
- **The Count is not a preview** — it reflects per-filter universes, not result-record counts. Size by pulling small and reading.

## When one audience needs two queries (this handler's split tests)

1. You cannot write ONE icp_text sentence SPECIFICALLY true for all the seeds.
2. The sub-groups anchor on DIFFERENT categories.
3. Empirically: a mixed-seed 100-pull reads muddy or decays fast.

Do not split sub-groups that share a category and vocabulary and are often the same companies. The general how-many-queries judgment lives in [[Scoping Queries]].

## Platform reference (analyze / debug)

- **Cost model:** net-new only, 90-day cache; re-pulls within the window free (exception: segment-domains charges even cached). Free: counts, account-status, usage, match-contacts, saved-query tools. BYOK: validate-icp-fit, generate-contacts. Roughly 8-18 cents per search + ~$1.50-3.50 per 1k records by tier.
- **The save mechanic:** only explicitly saved queries are referenceable downstream as inclusion/exclusion sources; MCP calls do NOT auto-save; history-only queries cannot be chained.
- **Scoping quirks (field-verified):** inclusion_query_id accepts arrays (union). Pairing it with a heavy domain-footprint exclusion SILENTLY BREAKS scoping — signature: results sorted by alphabetically-last domains. Persona-only exclusion lists are safe and are the right shape for contact iteration. count-contacts ignores scoping entirely.
- **Output shapes:** industry = array of UPPERCASE enums; seniority enum: executive/vp/director/manager/senior_ic/mid_level/entry_level; public_emails = comma-separated string on company rows; email_validated covers indexed personas only; phone = array of {phone, type}.
- **Limits:** discover 5-10,000 records/pull; 10 seeds; 20 phrases; exclusion lists ~240k max; DiscoGen-class tasks ~10k per task, async.
