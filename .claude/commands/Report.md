---
type: SOP
vertical: [client-communication]
mode: Co-op
description: The weekly client KPI report. Pull the week's real numbers, frame them against the baseline in the fixed schema, and send - so this touchpoint is never missed. One run per active client, end of week.
---

# Report

> Run through the **sop-runner** skill - load it first (with obsidian-cli), one step at a time, never run ahead. Each step names its owner; in Co-op only the Operator advances the run.

## When to do it
End of every week, once per active client. The weekly KPI report is the single most consistent written touchpoint; if it does not go out, the client notices.

## What we get
The week's report in the fixed schema, framed against the baseline, approved and sent to the client's channel.

## Process at a glance

| # | Step | Owner | Output |
|---|------|-------|--------|
| 1 | Gather the context | CLAUDE | Context read |
| 2 | Pull the week | CLAUDE | The week's numbers |
| 3 | Draft the report | CLAUDE | The draft |
| 4 | Approve and send | OPERATOR | Sent and logged |

## Process

### STEP 1 — Gather the context

**Owner:** CLAUDE · **Tool:** the client vault

Establish the run: which client this report is for, where their baseline and KPI commitments live, and anything unusual about the week the numbers alone will not show (a paused campaign, an infra fix, a conversation already had).

**Output:** the context read - which client, and what the week's numbers will need framing against. Ask for what is missing, then wait for the go.

---

### STEP 2 — Pull the week

**Owner:** CLAUDE · **Tool:** the client's sender + Close (CRM)

Pull the week's real numbers: positive replies, calls booked, conversion against the KPI set at onboarding, and the booked-meeting movement in Close. Pull the baseline and KPI commitments from the client's onboarding form, and last week's report from the logs for the trend.

> [!warning] If a sender does not load, stop.
> The moment a sender MCP errors on any call, halt and flag it to the Operator. Do not retry in a loop and do not report on stale numbers. Wait for the Operator to reload the sender before pulling live.

**Output:** the week's numbers against the baseline and last week's trend.

---

### STEP 3 — Draft the report

**Owner:** CLAUDE · **Skill:** client-success-lead

client-success-lead drafts it. Honest numbers, never fudged; pipeline math from the LTV and close rate set at kickoff, the same formula every week.

**Output:** the draft, in exactly this schema:

```
KPI update for the week:

- Positive replies: {n}
- Calls booked: {n}
- Conversion: {x}% (KPI: {y}%) {✅ / ⚠️}
- Pipeline value added: ${n}
- Expected revenue: ${n}

{One line of human framing: a celebration against the baseline if ahead,
a concrete next step pulling to a call if behind. Never the why in writing.}
{Warm, forward-looking sign-off.}
```

---

### STEP 4 — Approve and send

**Owner:** OPERATOR · **Tool:** Slack + the client vault

The Operator reviews, adjusts, and sends to the client's channel. Nothing sends without approval. Then Claude logs it.

**Output:** the report sent, and the run logged into the client's Logs with the numbers, so next week's run has the trend.
