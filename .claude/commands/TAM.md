---
type: SOP
vertical: [list-building]
mode: Co-op
description: Estimate a niche's TAM to judge whether it is big enough for a cold email test. Run before committing to a build, or to assess a niche on its own.
---

# TAM

> Run through the **sop-runner** skill - load it first (with obsidian-cli), one step at a time, never run ahead. Each step names its owner; in Co-op only the Operator advances the run.

## When to do it
Before committing to a build, or whenever a niche's size is in question: is it big enough for a cold email test?

## What we get
A TAM brief - a reachable company count and a decision-maker headcount with the math shown, a viability verdict, the target buyer titles, and the load-bearing assumptions.

## Process at a glance

| # | Step | Owner | Output |
|---|------|-------|--------|
| 1 | Confirm the niche | CLAUDE | Niche confirmed |
| 2 | Estimate and write the brief | CLAUDE | TAM brief |
| 3 | Read the verdict | OPERATOR | Build / do not build |

## Process

### STEP 1 — Confirm the niche

**Owner:** CLAUDE

Confirm it is specific enough to estimate: subsector, geography, and size band. Ask only if the ambiguity would swing the estimate; if it is already specific ("HVAC contractors, US, mid-market"), say so.

**Output:** the niche confirmed, as it will be estimated. Then wait for the go.

---

### STEP 2 — Estimate and write the brief

**Owner:** CLAUDE · **Skill:** tam-estimator · **Tool:** web search

Run the estimate per the tam-estimator expertise. Label every number sourced or estimated; never invent a statistic; round to avoid false precision.

**Output:** the TAM brief, in exactly this form:

```
## TAM - {sector / niche}
**Geography:** {US / North America / global} · **Segment:** {SMB / mid-market / enterprise / mixed}

| Line | Value | Source / assumption |
|------|-------|---------------------|
| Total market revenue | ${X}B | {source or method} |
| Avg revenue per company | ${X}M | {assumption} |
| Raw company count | ~{X,000} | revenue / avg |
| Reachability discount | {X}% | {reason} |
| Reachable companies | ~{X,000} | after discount |
| Decision-makers per company | {X} | {assumption} |
| **Total addressable contacts** | **~{X,000}** | |

**Verdict:** two to three sentences on the reachable count and viability.
**Target titles:** the two to four buyer titles to reach.
**Key assumptions:** the three to five load-bearing ones, the most uncertain flagged.
```

Then wait for the read.

---

### STEP 3 — Read the verdict

**Owner:** OPERATOR

Under ~1,000 reachable, do not build - the client belongs on ABM or calling. Under 10,000, build but note the exhaustion risk. Above that, the niche clears.

**Output:** the call - build / do not build.
