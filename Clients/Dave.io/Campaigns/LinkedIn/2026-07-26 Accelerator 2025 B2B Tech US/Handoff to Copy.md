---
Type: Campaign Handoff
client: Dave.io
date: 2026-07-26
channel: LinkedIn (Alta)
source-table: Accelerator 2025+ B2B Tech US - Contacts - 2026-07-26 (tblifFRX1krtbZDyq)
---

# Handoff to Copy — 2026-07-26 Accelerator 2025 B2B Tech US

First non-signal LinkedIn campaign for Dave.io: pre-loaded audience instead of the hiring-signal node. Runs on Alta (manual upload per Overrides). Playbooks stand as usual — `/LinkedIn-Campaign` per segment.

## The audience, and why it is gold

595 US B2B-tech companies from **2025+ accelerator cohorts** (YC W25–F26, Techstars, a16z Speedrun SR004–006, Alchemist Classes 38–41, 500 Global, TinySeed), DiscoLike-enriched, Contagen + Supersoniq contacts, 686 rows adjudicated one-by-one.

**The structural claim this campaign leans on, triple-verified:** 580 of 593 companies employ **zero dedicated infra people** (Supersoniq graph + Gemini web research + Perplexity deep research + manual checks on the tail). These are 1-50-person product teams where founders and devs carry deploys, pipelines, and fires themselves. The `Infra Employees` field on every row holds the exact number.

## Segments (views cut on `Title Verdict` × `Infra Employees`)

| Segment (folder) | Size | Who | The angle to write to |
|---|---|---|---|
| Founders & Tech - Infra 0 | 524 | Founders, CEOs, CTOs, VP/Head/Dir Eng at companies with **no infra person at all** | The core poke: infra pulls your devs off the product; nobody owns it. Same SDLC pain as the Hiring Signal sequence, minus the hiring hook |
| Founders & Tech - Infra 1 | 13 (+2 at Infra 2+ if folded in) | Same seats at companies with **one (or a couple) infra hires** | The "stretched" angle: one person carrying all of infra is a bus-factor and a bottleneck — never "you have no one" |
| Founding Engineers | 23 | Founding/first engineers — the person who IS the infra duct tape | Peer voice, not buyer voice: they live the 2am deploys; talk shop, not ROI |

## Personalization actually on the rows

- `first_name` — 100% (validate at deploy)
- `company_clean` / `Company` — 100%
- `Infra Employees` — the number, on every row (0 for most; copy must NEVER assert "you have no DevOps" as fact — ask, don't tell; for Infra-1 rows dodge "no one" phrasing entirely)
- `Title` — real and adjudicated
- Employees band (1-10 / 11-50), State, Description — present on most rows via the domain data
- **No accelerator/cohort field on rows** — the accelerator identity was lost at the DiscoLike append; a "saw you just came out of YC" line is NOT safely mergeable. Generic "early-stage/just-raised" energy only, unless copy references the Reports CSV manually
- ~375 rows carry a verified `Final Email` — for Alta's no-accept email fallback only, per Overrides

## Voice constraints (standing, from Sean)

Sentence case. Human in the loop — never "capacity" / "real engineer" / read-only claims. No "2am on-call" centering. No "AI" in copy — lead "we help". No em dashes. Soft CTAs. Frame: scale without adding DevOps headcount; day-one value vs 3-6-month hire.

## Mechanics

- Alta campaigns per segment; Operator uploads the exported CSVs manually
- Connection request blank; messages gated on accept (house default)
- DNC scrubbed at source (conntour.com removed); junk domains dropped
- Ignore RankInCompany (per Operator); Social-empty rows filtered at upload
