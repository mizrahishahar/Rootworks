---
type: SOP
mode: Co-op
description: Work a hand-given list of LinkedIn prospects, some new, some awaiting a follow-up, drafting one personalized, value-anchored DM per prospect that earns a reply.
---

## When to do it
You have a batch of LinkedIn prospects to reach: some new (first touch), some already messaged and gone quiet (follow-up). You want each one worked properly, one paste-ready DM at a time. Pairs with the Prospect on LinkedIn SOP, that one earns the connection, this one writes the message.

## What we get
Every prospect on the list moved one step toward a reply: a researched Lead Card, a fresh research pass, and a personalized, value-anchored DM ready to send. Nothing written to the CRM. Anyone who has already replied routed to the inbox-manager instead. Any craft lesson folded back into the skill.

## Process

### 1. Hand over each prospect
**Owner:** Operator

Give the worklist: each prospect by name, marked new or follow-up. For every follow-up, paste the full thread so far, the thread is not in the CRM, so the setter reads what you give it. Agree scope and order.

### 2. Ready up
**Owner:** Claude · **Skill:** linkedin-setter

Invoke the linkedin-setter skill and READ IT IN FULL before working a single prospect. Read every Knowledge Base file and the Output Interface. Do not skim, do not work from memory of a prior run. Confirm the Airtable MCP responds for record reads. There is no sending integration here: you draft, the Operator sends on LinkedIn by hand.

### 3. Work the next prospect
**Owner:** Claude · **Skill:** linkedin-setter

For the next prospect: pull the Airtable Companies and Contacts record if it exists (read-only). Run the Fresh Research pass live, recent LinkedIn posts, funding, hiring and launch signals, their positioning in their own words. Present the Lead Card and the Fresh Research, then The Move: the first DM for a new prospect, or the next non-needy follow-up for a quiet one, read off the pasted thread. Deploy the right specialist skill for the words (cold-offer-generator for an offer insight, cold-email-copywriter for copy craft, sales-closer for follow-up tone). Hebrew for Israeli founders, value-anchored, hyper-personalized.

If a prospect on the list has actually replied, that is not this run. Route them to the inbox-manager and move on.

### 4. Approve and send
**Owner:** Operator

Review the Lead Card and the draft, refine, approve. Send the DM on LinkedIn yourself. Then return to step 3 for the next prospect. Repeat until the list is empty.

### 5. Close the run
**Owner:** Claude · **Skill:** linkedin-setter

No CRM write: the record changes only once a reply comes, and that is the inbox-manager's lane. Note which prospects were touched and which now await a reply as carry-forward to the Operator. If the run surfaced a general craft lesson about how the setter itself should work, run improve-skill to fold it into the skill. Then the run is closed.