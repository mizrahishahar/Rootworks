---
type: intent-trigger
channel: [linkedin]
source: live intent (Trigify)
---

# Intent Trigger: Owner-Led Hiring

This campaign is fed by live intent, not a static lead list. A Trigify search listens for the signal; a relay screens, enriches, filters to this segment, and hands the lead to the campaign.

## Signal
Infra hiring posts: text contains "hiring" AND one of DevOps / SRE / platform engineer / infrastructure / cloud engineer, authored by an engineering decision-maker.

## Gate (routes here)
- Genuine signal: a free AI relevance check on the post text passes (a real infra-hiring post, not a recruiter, job seeker, or off-topic mention). Non-genuine posts drop before enrichment.
- Country is US.
- Company headcount 11 to 200 (owner-led band).

Non-genuine, non-US, and out-of-band leads drop at the gates.

## Wiring
- Searches (any firing feeds this intent): Infra Hiring for Dave (`13a1df49-2b77-4f9e-99aa-b0348e25fda8`) and Infra Hiring 2 for Dave (`d05dcbd3-47a9-44b4-9536-3dd5cdba4f88`).
- Relay: Infra Hiring relay for Dave (Trigify multi-post workflow bound to both hiring searches: relevance check, enrich, US + headcount gate).
- Webhook: POST n8n.flowroots.com/webhook/intent-dave, with `target_campaign` set to the Alta campaign webhook URL below.
- Alta campaign webhook: `https://api.altahq.com/audience/webhook/3c2ba4e8-4193-490b-bc23-5ffeed0cc819/pull-in-prospect`.

## Flow
Search finds the post. Relay screens it for genuine infra-hiring intent, enriches the author (LinkedIn to name, domain, headcount), runs the US + size gate, then POSTs to the Dave intent webhook. The n8n router lands it in the Intent for Dave table, the waterfall resolves the email, and Enroll to Alta posts the lead straight to the Alta campaign webhook.
