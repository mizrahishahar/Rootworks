---
type: SOP
mode: Co-op
description: The daily client run. Establish where the client stands, produce today's missions, hand each mission off to its own session, and make the right communication move.
---

## When to do it
Every morning, once per active client. The standing run that turns "where does this client stand" into today's missions and the right client communication.

## What we get
A clear statement of where the client stands today, the concrete missions for this client today, each mission handed off to its own session (never executed here), the communication move decided and made, and a log the next run can stand on.

## Process

### 1. Ready up on the skill
**Owner:** Claude · **Skill:** campaign-analyzer

Invoke the campaign-analyzer skill and read it in full — the skill and its entire knowledge base, end to end, plus its interfaces. A dedicated phase: understand it deeply and follow it through the whole run. Fresh every time, never from memory of a prior run.

### 2. Load the client
**Owner:** Claude

Load this client's full recent context before touching anything else: the recent session logs in the client's Logs folder, read newest-first until the continuity is clear, the recent campaign folders and reports, a quick look at the Airtable CRM record for where the relationship stands, and anything else recent in the client's folder. The run starts only once you are fully context-aware.

### 3. Run the Campaign Audit
**Owner:** Claude · **Skill:** campaign-analyzer

If the workspace has not started sending yet, the run ends here: state it and stop — onboarding work is not this SOP.

Run the full workspace audit per the campaign-analyzer skill already loaded. I**f the PlusVibe connection errors, do not continue and do not work around it: flag it to the Operator, wait for the fix, then run the live pull.** Present the Campaign Audit card (the analyzer's first artifact) and stop; the investigation belongs to the next step.

### 4. Investigate and decide the next steps
**Owner:** Operator 

You stop here. you wait for my response.

We work the card together: the Operator picks what gets investigated or checked further, one drill at a time, and together the next steps are decided — what is wrong or due, and what we do about it today. The gate out of this step is simple: we have a polished Analysis Next Steps block (the analyzer's second artifact), each decided action explained fully enough to be handed off cold. Then we can communicate on it and log it. **This session is analysis only.** No next step is executed here — not a list build, not an infra fix, not a copy rewrite, not a reply. Each decided next step is handed off to its own session, named clearly enough to be picked up cold.

### 5. Decide the communication move
**Owner:** Claude · **Skill:** client-success-lead

Invoke the client-success-lead skill with today's picture and the decided next steps, tasked with understanding what is to be communicated to the client today — the good, the bad, and the natural — and how. If the move is to communicate, draft it ready to send.

### 6. Act on the communication move
**Owner:** Operator

Review the draft, refine, send — or note the hold and why. Capture anything the client says back.

### 7. Log the run
**Owner:** Claude

Write the run into this client's Logs folder: both analyzer artifacts — the audit card with its real numbers (this is the trend history future audits read) and the Analysis Next Steps block, logged as-is (this is what the handoff sessions open with); the missions concluded and where each was handed off; the communication move and what was sent or why nothing was; open threads for tomorrow. Detailed enough that tomorrow's run and any handoff session can start cold.
