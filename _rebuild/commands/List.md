---
type: SOP
vertical: list-building
mode: Co-op
description: Build the lead side of a campaign. Scope the opening and the queries, run the sources through their tools, validate, land and enrich in the base, segment, and export. Operator owns the platforms, the spend, and the base execution; Claude owns the scope, the pulls it runs, and the segmentation.
---

# Build a Lead List

A build turns a brief into a ready segmented list. The shape is: scope, an optional company-source step, a contact-source step, validate, then enrich, segment, and export. Each source is run through its tool in `tools/`; the work is driven by the list-builder skill.

## When
You need the lead side of a campaign. Brief: who to reach, which source opens it, any domains in hand, prior results.

## The flow

| # | Step | Owner | Skill / Tool | Output |
|---|------|-------|--------------|--------|
| 1 | Hand over the brief | Operator | — | the brief |
| 2 | Scope: queries + opening | Claude | list-builder | query spec(s), the opening |
| 3 | Company source *(optional)* | Operator | list-builder + `tools/discolike` | qualified domains |
| 4 | Contact source | Claude / Operator | list-builder + the contact tool | a broad pull CSV |
| 5 | Validate contacts | Claude | title-validator | keep / cut / review |
| 6 | Land the pull | Operator | `tools/clayroots` | a base table |
| 7 | Enrich | Operator | `tools/clayroots` | verified emails |
| 8 | Segment | Claude | list-builder | the filter table |
| 9 | Cut and export | Operator | `tools/clayroots` | per-segment CSVs |
| 10 | Assemble and hand off | Claude | list-builder + conventions-manager | campaign folders + a handoff |

## The opening (steps 3-5)

| Opening | Company step | Contact step |
|---|---|---|
| Contact-first | skip | run the contact tool, then validate |
| Company-first | run the company tool | bridge its domains into the contact tool, then validate |
| Company-only | run the company tool, keep its public-email domains | skip; the public-email domains still land, enrich, segment, and export (steps 6-10) |

## Gates
- **Go / no-go** (before step 2): if the niche is unproven, run the TAM command; under ~1,000 reachable, do not build.
- **Fit-check** (step 3): validate the sample with DiscoLike's `validate-icp-fit` to ~80% before the full company pull; do not scale a pull that fails.
- **Spend** (step 4): nothing paid runs without an explicit yes.
- **Filter table** (step 8 to 9): the Operator approves the segmentation before views are cut.
- **Folders** (step 10): the Operator reviews and approves before the list is handed off.
