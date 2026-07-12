# Output Interface

The campaign-analyzer produces two artifacts, one after the other:

1. **The Campaign Audit card** — the state of the workspace, section by section in the fixed audit order. Produced first, before any investigation.
2. **The Analysis Next Steps block** — the actions concluded from the investigation, each fully explained. Produced after the investigation, never before it.

Both are presented in the working conversation.

## Artifact 1 — the Campaign Audit card

```
# {Client} — Campaign Audit — {date}

## Summary
2-4 plain sentences covering ONLY the problematic areas: what is off, what it
most likely means, and what is worth investigating. If all six audits are ok,
one sentence saying exactly that, and stop.

## 1. Sending Pulse — OK / WARNING / ERROR
The bloodline. Are emails going out, and will they keep going out?
- Last sending day ({day}): {n} sent — {band}
- Queued today: ~{n} ({new leads} new + {follow-ups} due) · tomorrow: ~{n}
- New-lead runway: ~{n} sending days across {n} active campaigns

## 2. Deliverability — {verdict}
Are we landing in front of real humans?
- Genuine reply rate (human replies, OOO/auto excluded): {x}% — {band}
- OOO rate: {x}% — {band}
- Bounce: {x}% — {band}

## 3. List — {verdict or GATED (x of 5k sent)}
Are these the right people?
- Positive rate: {x}% — {band}
- {positives profile / ICP alignment line when read}

## 4. Copy & Offer — {verdict or GATED (x of 10k sent)}
What is pulling replies and what is not?
- {variant/campaign vs workspace average, winners and losers named}

## 5. Booking — {verdict}
Do positives become booked calls?
- {booked} of {positives} positives booked ({x}%) — {band}

## 6. Show — {verdict}
Do booked calls happen?
- {completed} of {completed+no-show} showed ({x}%) — {band}
```

## Rules

- **Every section**: verdict on the header line, a one-line description of the question it answers, then the real numbers. Nothing decorative.
- **The verdict is the band, mechanically.** No metric overrides another; a stick in error prints ERROR even when the drill locates the break elsewhere — the drill's conclusion appears as a finding under the verdict, never as a softened verdict.
- **Band language is fixed:** ok closes the section with nothing more. **warning invites** — the section ends with an "Optional:" line naming what a drill would look at. **error demands** — the section ends with an "Investigate:" line naming the concrete findings so far (named domains, named variants, named leads with days aging).
- **Gated sections** state the gate plainly ("GATED — 4.2k of 5k sent") and how much volume settles it. Nothing else.
- **Sending Pulse never triggers off the last sending day** — that number states. The verdict hangs on what is queued today, tomorrow, and the runway.
- **The card stops at findings.** The operator reads it, picks what to investigate one by one, and decides every next action. The analyzer never runs past the invitation.
- The Summary is written last, from the finished sections, in plain words.

## Artifact 2 — the Analysis Next Steps block

Produced after the investigation, never before it. This block is what gets logged, and the session that reads it must understand the analysis from it alone — it operates on this block without re-deriving anything.

```
## Analysis Next Steps

### 1. {Action from the Action Tree} — e.g. Build a lead list
...

### 2. {Action} — ...
```

Not necessarily one clean paragraph — format freely but cleanly. What is mandatory is that each action **thinks and explains**:

- **The context** — everything another session needs to know in order to operate on this
- **Why** we got to this conclusion
- **How** we got to it — the drill that ran, the real numbers and names
- **What** we need to do
- **How** we need to do it
- **Recommendations**
- **Extra context** — anything else that keeps the handoff session from guessing

Rules: action headers come **only** from the six Action Tree actions (Diagnostic Playbook). More than one next step is normal. If a new lead list will not be identical to current targeting, Write a new campaign appears alongside it. Nothing here is executed in the analysis session.
