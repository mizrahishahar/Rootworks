---
Type: Campaign Sequence
client: Dave.io
segment: Owner-Led - Hiring (Manual)
channel: LinkedIn + Email (Alta)
updated: 2026-07-13
---

# Owner-Led · Hiring — Sequence (LinkedIn + Email)

**Audience:** founder / CTO at small US companies with no infra owner, hiring on the infra side. Source + wiring in `Intent Trigger.md`.

**Copy rules (locked):** concrete templates, no AI generation. Sentence case. Fields `{{firstName}}`, `{{company}}`. Generic signal ("hiring on the infra side"). No "capacity". "human in the loop" (never "small team behind it" or "real engineer"). No read-only. No "scale without headcount" here (Scaled only). "cut costs" (plural). CTA = a teardown. No em dashes.

## Flow & schedule

```
LinkedIn: view -> connection request (blank)
Email 1        day 0
LinkedIn 1     opener (after connection accepted)
Email 2        day 2
LinkedIn 2     +1 day after LinkedIn 1
Email 3        day 4
LinkedIn 3     +2 days after LinkedIn 2
reply on either channel -> stop -> route to inbox-manager
```

## LinkedIn

**Connection request:** blank.

**1 — opener**
Hey {{firstName}}, saw {{company}} is hiring on the infra side. Curious, is that meant to be a proper infra owner, or has it mostly been landing on you and the engineers so far?

**2 — value (no ask; built to pull a "what do you mean?")**
At most small teams, infra isn't broken because of the tools. It's broken because it's landing on a developer who was hired to build product, not run infrastructure. Two totally different skill sets, so it stays in firefighting mode until someone actually owns it.

**3 — breakup**
Last one from me {{firstName}}.

I want to tell you about Dave, our AI agent that handles your infra with a human in the loop, so your team stays on the product instead of firefighting.

Teams that switched cut infra costs by about 45% and freed up 8x their engineering time, for a fraction of a hire.

Want me to map where it'd save {{company}} the most? No worries either way.

## Email

**1 — Subject: Who owns infra at {{company}}?**
Hey {{firstName}},

Saw you're hiring on the infra side. Usually that means it's been landing on you and the engineers, and pulling them off the product.

Dave handles it instead, from day one, so the team stays building. No 3-6 month ramp, no recruiting.

Want me to put together a short teardown of where Dave would cut costs in {{company}}'s setup and send it over?

**2 (day 2)**
Hey {{firstName}},

Quick context on how it works: Dave is an AI agent that becomes your infra owner, with a human in the loop. It maps your whole setup and takes infra off your plate from day one.

The teams that switched cut infra costs by about 45% and freed up 8x their engineering time, for a fraction of what a hire runs.

Mind if I send more info?

**3 (day 4, breakup)**
Hey {{firstName}},

Last one from me. If the infra role's still open, Dave can cover it this week instead, so your engineers stay on the product and you're not waiting months.

Want me to map where it'd save {{company}} the most before you close it?