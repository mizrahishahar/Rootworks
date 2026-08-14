---
type: log
date: 2026-08-12
subject: Replacing the SOP model with atomic commands
status: proposal — nothing built, nothing changed
---

# Session log — atomic commands over SOPs

Written at the Operator's request at the end of a long Dave.io session. Nothing here was implemented; this is thinking logged for HQ to act on or discard. Where I am uncertain I say so, and where I was wrong today I say that too.

---

## 1. The evidence this rests on

This session opened as `/List` for Dave.io. It declared **STEP 2 — Define the list(s)** and **never reached STEP 3.** Not once, across an entire working day.

What actually ran inside that single "SOP run":

1. Renamed campaigns across vault + PlusVibe + Hub to carry the playbook
2. Renamed the `default` playbook to `pitch-led` and retro-applied it across every campaign
3. Updated the conventions skill to match
4. Built relevance filters on two different tables
5. Built the `Cut review` complements and verified by the complement method
6. Created `manually_approved` rescue fields on three tables
7. Merged two infra fields into one (212 rows, zero conflicts)
8. Backfilled 329 rows from sibling rows already in the base, zero spend
9. Found and removed non-ICP rows (a VFX studio, a prop rental house, a university)
10. Wrote a DiscoLike ICP description and structured filter set
11. Sized the TAM and probed which `tech_stack` vendor domains actually exist
12. Reviewed a 100-domain pull for noise
13. Reviewed a DiscoGen validation prompt
14. Wrote the contact-side persona description
15. Absorbed a cross-session handoff naming four defects
16. Audited a 9,886-row waterfall run
17. Produced the weekly PlusVibe report from the automation's own method
18. Traced call attribution across channels
19. Built the Gateway / non-Gateway deliverability split
20. Ran a SURBL check on all five sending domains

Twenty distinct jobs. One SOP step. That is the case, and it is not an argument about discipline.

---

## 2. The diagnosis

**The SOP was holding state that the base already holds.**

ClayRoots knows which rows are relevant, which have emails, which are enrolled, which are deliverable. The Hub knows which campaigns exist and what they've sent. The SOP run kept a second, parallel notion of "where we are" — and the moment the session drifted, the run's copy went stale while the base stayed true.

That is the whole failure mode. Not that the steps were wrong. That the *run* was trying to be the memory when the memory already existed somewhere better.

Atomic commands work here precisely because of this. `/relevance` can execute at any moment, on any table, with no knowledge of what came before, because it reads truth rather than carrying it.

**Consequence: `sop-runner` disappears entirely.** It exists only to police sequencing ceremony — declare the step, name the owner, stop at the Operator. In an atomic model the gate is the command boundary itself: one command, one artifact, one decision point. Same safety, none of the overhead.

---

## 3. The proposed split

> A **skill** is a noun of expertise. A **command** is a verb with an object. A **tool** is the mechanics.

- `list-builder` (skill) knows what relevance *means*, what overshoot-never-undershoot implies, what a borderline contact deserves.
- `/relevance <table>` (command) produces a filter on one specific table.
- ClayRoots (tool) is where the filter lands.

Skills are never invoked alone; commands load them.

**The test for atomicity:** *can you name the artifact, in one noun, before the command runs?* "A filter." "A number." "A sequence." "A root cause." If you cannot, it is still an SOP wearing a command's clothes.

---

## 4. The command inventory

Marked ✅ where this session genuinely exercised the shape, so it is observed rather than imagined.

### List building
| Command | Artifact |
|---|---|
| ✅ `/icp <source>` | ICP text + structured filters, paste-ready for that source |
| ✅ `/tam` | a pool size, with the filter that produced it |
| ✅ `/bullseye <domain>` | pass/fail per filter condition against a known-good company |
| ✅ `/query-review` | noise rate, with the misses named |
| ✅ `/relevance <table>` | Relevant + Cut review conditions with exact counts |
| ✅ `/filter-audit <table>` | axis-coverage table: does the filter gate everything the build gates? |
| ✅ `/backfill <field>` | N rows resolved from data already in the base, zero spend |
| ✅ `/field-merge` | merged field + conflict count |
| ✅ `/enrich-audit <run>` | the yield funnel with causes ranked |
| `/segment <table>` | filters per segment |
| `/table-init` | fields + the standard view chain |
| `/suppress` | the exclusion set for a new pull |

### Copy
`/sequence` (the short Campaign — write the copy, not the whole procedure) · `/spintax` · `/deploy` · `/token-check`

### Infrastructure
✅ `/automation-read` (what does this workflow actually compute, in plain language) · ✅ `/automation-debug` (why is this output wrong) · `/automation-rerun <scope>` · ✅ `/rename` (a convention applied across vault + sender + Hub in one pass)

### Analysis
✅ `/report` · ✅ `/attribution` · `/campaign-health`

### Deliverability
✅ `/blocklist-check` (see §5 — this one was invented mid-session out of necessity and immediately found a live fault) · `/placement-test`

### Inbox
`/reply`

---

## 5. The commands I would fight for

These were not on the Operator's own list. Each earned its place today.

**`/bullseye`** — test the filter against a company you already won, before spending. Thirty seconds. It caught two defects this morning that would each have silently deleted bitfab.ai from the list: `min_digital_footprint` set to 75 against its actual score of 5, and a country gate against its null address block. Cheapest insurance in the entire build.

**`/filter-audit`** — distinct from *building* a filter. It asks one question: does this filter carry a condition for every axis the build gates on? That is what answered "is 83% passing good?" — the pass rate was meaningless noise; the missing country condition was the actual answer.

**`/attribution`** — what actually produced this outcome? Produced the single largest finding of the day: **email has booked zero calls across 15,800 sends**, and all three of Dave's meetings came from one Alta LinkedIn campaign. Nobody had asked the question.

**`/enrich-audit`** — the yield funnel on a waterfall run. Surfaced that a run logging *Succeeded* had a third of its batch unprocessed. (Caveat below — I later found that batch was still in flight, so the finding was premature. The command is still right; my reading of it was not.)

**`/blocklist-check`** — three of Dave's five sending domains are on SURBL's `[abuse]` list, two of them actively sending on four campaigns each. This was invented on the spot because the Operator asked for it, and it found a live production fault in under ten minutes.

**Three of the five are audits.** That is the pattern worth carrying: the SOP model had many steps that *do* things and almost nothing that *checks* things. Every genuine failure surfaced today — the country leak, the digital-footprint floor, the LinkedIn attribution, the SURBL listings — was caught by a check that had no name.

---

## 6. What should stay sequenced

Not everything decomposes, and pretending otherwise would break something that works.

**Onboarding** has genuine external ordering — contract signed, invoice paid, warmup clock, access granted. Those dependencies live in the world, not in the run. It is a checklist against reality, and it should stay one.

I am *not* confident about `/Inbox`. It has a real per-thread loop with a gate between each lead, and that loop may be load-bearing rather than ceremonial. Worth examining separately rather than assuming it decomposes.

---

## 7. Honest notes on my own failures this session

These matter because several of them are arguments for the model, not against it.

**I over-scoped repeatedly.** Asked for a relevance filter on Cultivado, I delivered analysis of three other tables and was correctly told off. Asked for a Gateway filter, I returned a four-condition campaign-ready stack when a one-condition MX filter was wanted. Asked for the PlusVibe summary, I attached three paragraphs of diagnosis. **This is the strongest evidence for atomic commands I can offer:** with no declared artifact, there was no natural place to stop, so I kept going. A command that must produce exactly one named thing would have stopped me every time.

**I got the weekly report wrong.** I computed Calls Booked by filtering `Call Booked At` directly and skipped the PV-only filter the automation applies. Reported 2 and 18; the true PlusVibe figures were 0 and 2. The automation was correct and I blamed it before checking. The Operator caught it. A `/report` command that reproduced the automation's own filter chain would not have had the opportunity.

**I called 36% of a batch unprocessed** when the waterfall was still running. The number moved from 1,284 to 1,807 while I worked. I should have checked whether the run was live before diagnosing it as a fault.

**I proposed a seniority gate, was overruled, and a cross-session handoff later proposed the same thing independently.** I still think the Operator's call was right on the evidence available, but two independent agents reaching the same rejected conclusion is a signal worth revisiting deliberately rather than letting it resurface a third time by accident.

---

## 8. Open questions I cannot answer from here

- **What holds a multi-command build together?** My claim is "the base is the state," but that is untested. If `/relevance` runs and `/segment` needs to know a decision `/relevance` made that *isn't* written to a field, the model leaks. Worth stress-testing on one real build before committing.
- **Where do per-build rulings live?** Today's country ruling (US + CA) and headcount ruling (1-50) were Operator decisions that every downstream command needs. They belong somewhere durable — Overrides on the registry row is the obvious candidate, but nothing currently forces a command to read them.
- **Do commands compose or chain?** I have assumed the Operator chains them by hand. Whether some pairs should fuse (`/relevance` → `/filter-audit` always) is unresolved.

---

## 9. What I would do first

Not the full twenty. **`/relevance` and `/filter-audit`.**

They are the pair where today's money actually leaked, and they are the two run often enough to know the shape cold. Ship those two, use them on real builds for a week, and the right shape for everything else will fall out of how those two want to be called.

Everything above is a proposal. Nothing in this repo was modified.
