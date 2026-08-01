---
type: intent-trigger
channel: [linkedin]
source: live intent (Trigify)
---

# Intent Trigger: Scaled Social

This campaign is fed by live intent, not a static lead list. A Trigify search listens for the signal; a relay screens, enriches, filters to this segment, and hands the lead to the campaign.

## Signal
Infra topic engagement: posts on platform engineering, developer productivity, cloud cost, scaling infrastructure, DevOps as a service, or SRE, authored by an engineering decision-maker.

## Gate (routes here)
- Genuine signal: a free AI relevance check on the post text passes (a genuine, on-topic infra post, not a vendor ad, job seeker, or off-topic mention). Non-genuine posts drop before enrichment.
- Country is US.
- Company headcount 201 to 2000 (scaled band).

Non-genuine, non-US, and out-of-band leads drop at the gates.

## Wiring
- Searches (any firing feeds this intent): Infra Social for Dave (`b09dbcf0-a3b2-47cc-9f6c-186220615e3f`), Infra Social 2 for Dave (`c09c3659-10e1-49bd-9dfb-dc378a203c3e`), and Infra Social 3 for Dave (`304a68a4-6e07-448f-91d1-abae82f8a950`).
- Relay: Infra Social relay for Dave (Trigify multi-post workflow bound to all three social searches: relevance check, enrich, US + headcount gate).
- Webhook: POST n8n.flowroots.com/webhook/intent-dave, with `target_campaign` set to the Alta campaign webhook URL below.
- Alta campaign webhook: `https://api.altahq.com/audience/webhook/4ff8440d-5ac4-42c6-9565-b581777a28b0/pull-in-prospect`.

## Flow
Search finds the post. Relay screens it for a genuine infra topic, enriches the author (LinkedIn to name, domain, headcount), runs the US + size gate, then POSTs to the Dave intent webhook. The n8n router lands it in the Intent for Dave table, the waterfall resolves the email, and Enroll to Alta posts the lead straight to the Alta campaign webhook.
