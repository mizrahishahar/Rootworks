---
type: SOP
vertical: [inbox-management]
mode: Co-op
description: The inbox manager's run for today. Ready up on the skill, list every lead we work from a positive reply up, reconcile them with Close, present them by tier and use-case, then work each one - one at a time, Lead Card then message, a gate between each - to its next move toward a booked-and-shown meeting. Draft-and-ask on every send.
---

# Inbox

> Run through the **sop-runner** skill - load it first (with obsidian-cli), one step at a time, never run ahead. Each step names its owner; in Co-op only the Operator advances the run.

> **Unattended (scheduled) run:** pull and present the worklist, the Lead Cards, and the drafted messages as the run output, then stop. Do not write to the vault. Sending and logging (Step 5) belong to the Operator - nothing goes out or gets written without approval. This stays a Co-op run; a missing Operator does not make it autonomous.

## When to do it
Every day, once per active client. The whole inbox, not just positive replies - every conversation that needs a move today, from a fresh yes to a no-show to a lead gone cold.

## What we get
Every lead worked one at a time - Lead Card then message - to its drafted next move; each send approved and out; Close and the logs updated; durables promoted into the client's Overrides.

## Process at a glance

| # | Step | Owner | Output |
|---|------|-------|--------|
| 1 | Ready up + load the client | CLAUDE | Context read |
| 2 | List everyone we work | CLAUDE | Reconciled worklist |
| 3 | Present the leads table | CLAUDE | Leads table by tier |
| 4 | Work each lead, one at a time | CLAUDE | Lead Card + Message, per lead |
| 5 | Approve, send, next | OPERATOR + CLAUDE | Sent + Close moved, loop to 4 |
| 6 | Close the run | CLAUDE | Run logged + durables promoted |

## Process

### STEP 1 — Ready up on the skill, then load the client

**Owner:** CLAUDE · **Skill:** inbox-manager + linkedin-setter · **Tool:** the client vault + Close

First, ready up on the reply skills for the channels this client runs (the Overrides name them): `inbox-manager` for email, `linkedin-setter` for LinkedIn. Invoke each that applies and read it in full - the skill, its knowledge base, its interfaces - fresh every run. Then load the context: the session logs newest-first, the client's inbox Overrides and Assets, the onboarding form.

**Output:** the context read - skill-ready and context-aware, where the inbox stands. Then wait for the go and any context you want to add.

---

### STEP 2 — List everyone we work

**Owner:** CLAUDE · **Tool:** the client's senders (PlusVibe for email, HeyReach for LinkedIn, per the Overrides) + Close

Pull every lead from a positive reply upward - the floor - across every channel the client runs. Read the live threads from each channel's sender and reconcile them against Close: every positive-reply-and-up lead is a Close record, and its stage is the tier. Where a live thread has no record, create one; where a record's stage no longer matches the thread, correct it.

> [!warning] If a sender does not load, stop.
> The email sender is PlusVibe and the LinkedIn sender is HeyReach by default; the Overrides say otherwise. The moment the sender MCP errors or fails to load on any call - even the first - halt the run right there. Do not retry in a loop, do not work around it, do not proceed on stale state, do not fabricate the worklist from memory or a prior log. Flag it and wait for the Operator to reload / reconnect the sender before pulling live. Do not log anything to the vault - a sender that needs a refresh is not a run worth recording.

**Output:** the reconciled worklist - every lead pulled and its stage lined up with the thread. Then wait for the go.

---

### STEP 3 — Present the leads table

**Owner:** CLAUDE · **Skill:** inbox-manager

The tiers, highest-value first, and the default move each one carries:

| Tier (Close stage) | What it is | Default move |
|--------------------|------------|--------------|
| Meeting Booked | booked, not yet shown | protect the show - pre-call asset, confirm |
| Positive Reply | interested, not booked | fulfill the ask, offer two times |
| No Show | booked and missed | rebook, two times |
| Holding / Cold | quiet or stalled | a human re-open, no ask |

For each lead, mark its channel; for email leads name the reply play from `tools/email-replies/` (LinkedIn leads carry no play - the move is derived live from linkedin-setter). Group by tier, and say which lead we start with and why.

**Output:** the leads table, grouped by tier. Then wait for the go on scope.

```
# {Client} - Inbox - {date}

## Meeting Booked ({n})
| Lead | Company | Channel · play | Last touch | The move |
|------|---------|-----------|------------|----------|
| {name} | {co} | Email · Pre-call asset | 2d to call | deploy the case study |

## Positive Reply ({n})
| {name} | {co} | First reply | today | fulfill + offer two times |
| {name} | {co} | Next follow-up | 5d quiet | outcome question, no slots |

## No Show ({n})
| {name} | {co} | No-show | yesterday | rebook, two times |

## Holding / Cold ({n})
| {name} | {co} | Cold re-open | 3w quiet | a human question |
```

---

### STEP 4 — Work each lead, one at a time

**Owner:** CLAUDE · **Skill:** inbox-manager (email) or linkedin-setter (LinkedIn), by the lead's channel · **Tool:** for email, the reply play in `tools/email-replies/` + the client's email sender (PlusVibe by default); for LinkedIn, linkedin-setter's principles (no play file - the move is derived live) + the client's LinkedIn sender (HeyReach by default); the client's scheduler (Calendly by default) for both

Top tier first, **one lead at a time, a hold between each - never a batch.** Route the lead by its channel: an email thread runs through inbox-manager and its reply play, a LinkedIn thread through linkedin-setter, principle-derived. For the current lead: read the thread in full, then show the **Lead Card**, then the drafted **Message**. On a booking, pull real slots from the client's scheduler (Calendly by default, unless the Overrides say otherwise), or ask the Operator if no connector is wired. Never invent a slot or a duration.

**Output — the Lead Card**, one per lead, same field order every time: bold each field label, the verbatim qualification in italics, Thread and Read on their own lines. Clean markdown, never a code box. On LinkedIn there is no subject line, and the persona is the sending profile:

---

**Lead Card**

**{Company}** · {email}

- **Contact:** {name} — {role}, **{confirmed / gateway / unknown} DM** ({the basis})
- **Location / size:** {location} · {size} · **ICP: {score}**
- **Timezone:** {tz} · now {local hour} local
- **Persona / subject:** {persona} ({persona email}) · "{subject}"
- **Qualification (verbatim):** *"{the lead's stored qualification, word for word}"*

**Thread:** {touches, chronological} → {latest inbound, dated and marked}: "{...}"

**Read:** {email: the named play from tools/email-replies/ · LinkedIn: the live read} — {the one-line judgment that sets the move}

---

**Output — the Message.** By channel:

- **Email** (inbox-manager): the drafted email right under the card, as clean paragraphs (never a blockquote), in the persona's voice and signed as that persona.
- **LinkedIn** (linkedin-setter): the messages as you would actually send them, each labelled `Msg 1`, `Msg 2` on its own line - short, plain, properly capitalized, no signature, in the sender's voice.

No invented duration and no calendar link, either channel. Then hold for the go on this lead before the next.

---

### STEP 5 — Approve, send, next

**Owner:** OPERATOR + CLAUDE · **Tool:** the sender + Close + the vault

The Operator reviews the Lead Card and the message, refines, approves. Then Claude sends it, moves the Close stage when a use-case resolves (booked, no-show, held), and logs the touch on the record.

**Output:** sent + Close moved (if needed). Then return to Step 4 for the next lead. Repeat until the worklist is empty.

---

### STEP 6 — Close the run

**Owner:** CLAUDE · **Skill:** inbox-manager · **Tool:** the vault

Once the worklist is empty, close it out.

**Output:**
- **Log** the run into the client's Logs: who was worked, what moved, what is waiting, the open threads for tomorrow.
- **Promote** anything durable into the client's inbox Overrides (a confirmed objection answer, a new use-case call, a lead-with or avoid) - keeping the file tight, cutting what it made stale.
- **Improve** the skill: if the run surfaced a general craft lesson about how the inbox manager itself should work, run improve-skill to fold it in.
