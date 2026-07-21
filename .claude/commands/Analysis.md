---
type: SOP
vertical: [analysis]
mode: Co-op
description: The daily client run. Establish where the client stands, run the campaign audit per channel, decide today's missions, and hand each off to its own session. Analysis only - nothing is executed here.
---

# Analysis

> Run through the **sop-runner** skill - load it first (with obsidian-cli), one step at a time, never run ahead. Each step names its owner; in Co-op only the Operator advances the run.

> **Unattended (scheduled) run:** produce the audit card (Steps 1-2) and present it as the run output, then stop. Do not write to the vault - deciding the missions (Step 3) and logging the run (Step 4) belong to the Operator, in an attended run. This stays a Co-op run; a missing Operator does not make it autonomous.

## When to do it
Every morning, once per active client: the standing run that turns "where does this client stand" into today's missions.

## What we get
A clear read of where the client stands, and today's missions decided and handed off, each to the SOP that owns it, carrying the context that session opens on. Nothing is executed here.

## Process at a glance

| # | Step | Owner | Output |
|---|------|-------|--------|
| 1 | Gather the context | CLAUDE | Context read |
| 2 | Run the audit | CLAUDE | Audit card |
| 3 | Investigate and decide | OPERATOR | Next Steps block |
| 4 | Log the run | CLAUDE | Run logged |

## Process

### STEP 1 — Gather the context

**Owner:** CLAUDE · **Tool:** the client vault + Close (CRM)

Load the recent context: the session logs newest-first until continuity is clear, the recent campaign folders, the CRM record for where the relationship stands, anything else recent in the folder. Read only to know where the client stands - do not pull the sender or start the audit; that is Step 2.

**Output:** the context read - where the client stands and what is unusual about this run. Then wait for the go and any context you want to add.

---

### STEP 2 — Run the audit

**Owner:** CLAUDE · **Skill:** email-analyzer and/or linkedin-analyzer · **Tool:** the client's sender (PlusVibe for email, HeyReach for LinkedIn by default)

For each channel the client runs, pull the live numbers from its sender tool and run the workspace audit. If the workspace has not started sending, say so and stop - onboarding is not this run.

> [!warning] If a sender does not load, stop.
> The moment a sender MCP errors on any call, halt and flag it to the Operator. Do not retry in a loop, do not work around it, do not audit on stale numbers. Wait for the Operator to reload / reconnect the sender before pulling live. Do not log anything to the vault - a sender that needs a refresh is not a run worth recording.

**Output:** the audit card - live markdown, no code box, set off like this:

---

**{Client} — Campaign Audit — {date}**

**Summary:** two to four sentences on the problem areas only; if all six are OK, one sentence saying so.

| # | Audit | Verdict | The numbers |
|---|-------|---------|-------------|
| 1 | Sending Pulse | OK / WARN / ERROR | last day {n} · queued ~{n} · runway ~{n} days |
| 2 | Deliverability | {verdict} | reply {x}% · OOO {x}% · bounce {x}% |
| 3 | List | {verdict} / GATED ({x} of 5k) | positive {x}% |
| 4 | Copy & Offer | {verdict} / GATED ({x} of 10k) | {winners and laggards vs avg} |
| 5 | Booking | {verdict} | {booked} / {positives} ({x}%) |
| 6 | Show | {verdict} | {completed} / {completed + no-show} ({x}%) |

Each **ERROR** row is followed by an `Investigate:` line naming the concrete findings; each **WARN** row by an `Optional:` line.

---

Present the card and wait.

---

### STEP 3 — Investigate and decide

**Owner:** OPERATOR · **Skill:** email-analyzer and/or linkedin-analyzer

Work the card together, one drill at a time, until there is a polished Next Steps block. **Analysis only: nothing is executed here** - not a list build, not an infra fix, not a campaign, not a word to the client. This run discovers the work; the session that opens on the handoff does it.

Every decided action becomes a handoff to the SOP that owns it:

| Hand off to | When |
|---|---|
| `List` | the lead side: build a lead list, insert new leads, pause and clean a list, change the triggers or the segments |
| `Campaign` | the copy side: write a new campaign, rewrite a sequence, fix the offer |
| `Plumbing` | the infrastructure: the sending setup, an automation, the base wiring, the CRM sync, a webhook |
| `Communicate` | something has to reach the client: a decision, a miss, a delay, news, a hard conversation |

The same SOP can be handed off more than once in a run: two separate lists to build is two `List` entries. Working out how many, and which, is what this run is for.

**Output:** the Next Steps block - one entry per handoff, each naming its SOP and carrying a full context paragraph (the why, the drill, the real numbers and names, what to do, the recommendations), enough for a cold session to open on it and act without re-deriving anything.

Only after discussion.

---

### STEP 4 — Log the run

**Owner:** CLAUDE · **Tool:** the client vault

Log the run into the client's Logs.

**Output:** the run logged - both artifacts (the audit card is the trend history future audits read; the Next Steps block is what each handoff session opens with), the missions and the SOP each was handed to, and the open threads for tomorrow.
