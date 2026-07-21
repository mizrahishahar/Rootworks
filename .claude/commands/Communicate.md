---
type: SOP
vertical: [client-communication]
mode: Co-op
description: Take something that has to reach a client and work out how to say it and how to send it. Gather the context, let client-success-lead set the read - the angle, what to say and withhold, the channel and the timing - then draft it and send on approval. $ARGUMENTS
---

# Communicate

> Run through the **sop-runner** skill - load it first (with obsidian-cli), one step at a time, never run ahead. Each step names its owner; in Co-op only the Operator advances the run.

## When to do it
Something has to go to a client and the framing is not obvious: a decision, a delay, a miss, a scope or price change, a piece of news, a hard conversation. Often handed off from an `Analysis` run that decided the communication move. Not the standing weekly report, which is `Report`. This is the move that has to land right the first time.

## What we get
The message read the right way and drafted in the client's channel voice, the channel and timing decided, approved and sent, and logged so the relationship keeps a record of what was said.

## Process at a glance

| # | Step | Owner | Output |
|---|------|-------|--------|
| 1 | Gather the context | CLAUDE | Context read |
| 2 | Set the read | CLAUDE | The communication move |
| 3 | Draft the message | CLAUDE | The draft |
| 4 | Approve and send | OPERATOR | Sent and logged |

## Process

### STEP 1 — Gather the context

**Owner:** CLAUDE · **Tool:** the client vault + Close (CRM)

Establish the run: which client, what exactly has to be communicated and why now, what already went out (the last report, the last conversation, the open threads), and where the relationship stands in Close. `$ARGUMENTS` names what we are communicating, and where this run opens from an `Analysis` handoff, that context paragraph is the brief.

**Output:** the context read - what has to reach the client and what the last touch was. Ask for what is missing, then wait for the go.

---

### STEP 2 — Set the read

**Owner:** CLAUDE · **Skill:** client-success-lead

client-success-lead reads it and returns the communication move, before a word is drafted.

**Output:** the read, set off as live markdown:

- **Really about** - what this is from the client's side, under the surface fact
- **Say / withhold** - what goes in writing and what does not
- **Shape** - problem-plan-action, a straight update, or a question that opens a call
- **Channel + timing** - where it goes and when, and whether it is a message or a call
- **Steering toward** - the one outcome the message is pulling to

---

### STEP 3 — Draft the message

**Owner:** CLAUDE · **Skill:** client-success-lead

Draft it to the read: the client's channel voice, honest, over-communicating the plan and not the excuse, resetting expectations straight where the news is hard. No fabricated numbers or dates.

**Output:** the draft - short, one message, not a wall.

---

### STEP 4 — Approve and send

**Owner:** OPERATOR · **Tool:** Slack + the client vault

The Operator reviews, adjusts, and sends to the decided channel, or notes the hold and why. Nothing sends without approval. Then Claude logs it.

**Output:** the message sent, and the run logged into the client's Logs - what was said, on which channel, and what it was steering toward, so the next touch has the thread.
