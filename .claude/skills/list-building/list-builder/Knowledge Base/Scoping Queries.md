# Scoping Queries

The first of the two calls, and the one that shapes everything downstream: **how many queries does this brief warrant, and how does each open?** One number and a spec per query. Each query becomes one major pull, one CSV, one table — and usually the spine of its own campaigns.

## Read the brief first

A build arrives as a handoff: the offer, who to reach, which handler opens the build, any domains already in hand, prior results. The brief names the opening — **companies-first** (a company-discovery handler) or **contacts-first** (a contacts-database handler). The handler file defines how its query is shaped and what it outputs; this file carries the judgment that stays constant across every tool: how many queries.

## How many queries (the core judgment)

A query has one center — one audience it describes well. Run separate queries when the brief truly contains separate audiences; run one when it does not. The tests, tool-independent:

1. **The one-sentence test.** Can you write one description that is SPECIFICALLY — not generically — true for everyone the query should return? If the sentence goes generic to cover everyone, there are two audiences and two queries.
2. **The copy test.** Would the audiences need genuinely different copy angles? Different angle = different campaign = usually its own query, so the pull arrives pre-shaped.
3. **The volume test.** A split only earns its keep if each side has standalone volume. Thin sides fold back into one query and split later in the base, if at all.

Do not multiply queries for sub-groups that share vocabulary and are often the same companies. Each handler file adds its tool-specific form of these tests (e.g. the discovery tool's category-anchor and seed-coherence tests).

## Name the query-implied segments now

The segments the query split already implies are set here, not later: a two-query build IS (at least) two campaigns. Naming them at scoping is what secures the variables — the pulls must carry what the intended segments will select on, so name those variables in the query spec (discovery extraction variables, contact-level fields). Designing segments only after ingest is what forces expensive base fixes. The full segment set still waits for the base and the real distribution — see [[Segmentation]].

## The spec you hand over

Per query: the audience in one specific sentence, the description or filter set in the handler's own language, the suggested filters worth setting, and the variables the intended segments need on the rows. Make it as easy as possible to run well.
