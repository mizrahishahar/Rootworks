# Sequence Interface

The copywriter works in two artifacts: a variant plan table (the strategy, approved first) and the sequence file (the clean copy, written from the approved plan). This file defines both. How to read the situation and choose the copy lives in `Writing Principles & Framework.md`; taking copy live and mirroring it to the client lives in `Campaign Deployment.md`.

---

## 1. Variant plan (pre-write, approved first)

Before any prose, each campaign gets one table. One row per variant. Each cell is a short strategic description of what that part does, NOT the copy. It is the blueprint the prose is written from, approved as a batch across all campaigns before writing starts. The copy can still move afterward; the table is intent, not a contract.

One table per campaign, titled with the campaign (folder name + date) and its variant / touch count. Columns:

| Variant | Opener - what it values | Offer - outcome + mechanism | Proof / risk reversal | Price / value | CTA |
|---|---|---|---|---|---|
| 1A | the angle or pain the hook leans on | the result, and how it is produced | the credibility proof or the de-risking | the price framing (e.g. free to try, in-person setup) | the value-based ask |

- **Variant** is touch + letter in one cell (`1A`, `1B`, `2A` ...), rows grouped by email.
- Cells are descriptors, not lines. "Values fear of lost leads + local relevance", never the written opener.
- Follow-up rows describe the move (rephrase, email-tree, value-add), not a subject.
- The opener and any personalization draw only on fields that actually exist and are populated in the campaign's lead CSV. Read those fields before the table.

---

## 2. Sequence file (the deliverable)

`Prospects/{client}/Campaigns/{campaign}/Cold Email Sequence.md`. No version numbers; a rewrite replaces it in place.

**Clean copy only.** The saved sequence is the vault-clean version: copy plus personalization placeholders, nothing else. **No sender signature. No spintax. No sending mechanics.** Those are added only at PlusVibe deploy (see `Campaign Deployment.md`). This file is the copy a human reads.

### Header
One line: **Audience** - the exact segment the sequence targets. Nothing else; stage, market read, CTAs, and proof are session context, not part of the saved artifact.

### Body
Emails in order, variants labeled by email number + letter:
- **Email 1**: `1A` `1B` ... - subject + body each.
- **Follow-ups**: `2A` `2B`, `3A` ... - body only, thread under Email 1, no new subject.

The shape scales with the variant / touch count set at handoff: 2 touches x 2 variants = `2 / 2`; a first campaign may run `4 / 2 / 2`.

---

## Personalization placeholders
`{{first_name}}`, `{{company_name}}`, `{{city}}`, and descriptive research placeholders (`{{site_detail}}`, `{{specific_service}}`, `{{state}}`). Descriptive placeholders mark where per-prospect research or enrichment fills in.

## Scaling a winner
Iterations labeled `v1` `v2` `v3`, each with a one-line note on what was varied.

## Diagnosis output (when diagnosing, not writing)

A per-variant table:

| Variant | Status | What fails | What's weak |
|---|---|---|---|
| 1A | keep / rewrite / kill | which principle, tool, or dial | one line |

Then a rewrite-versus-scale recommendation, and a note if the underlying offer, not the copy, is the real problem.