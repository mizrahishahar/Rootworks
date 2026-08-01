---
Type: Campaign Sequence
client: Dave.io
segment: Scaled - Social
channel: LinkedIn + Email (Alta)
updated: 2026-07-13
---

# Scaled · Social — Sequence (LinkedIn + Email)

**Audience:** VP Engineering / Head of Infrastructure / Director of DevOps at larger US companies with a stretched infra team, sourced from engaging with infra / DevOps content on LinkedIn. Source + wiring in `Intent Trigger.md`.

**Copy rules (locked):** concrete templates, no AI generation. Sentence case. Fields `{{firstName}}`, `{{company}}`. Signal = generic topic engagement ("the infra conversation"); NEVER name a creator. No "capacity". "human in the loop". No read-only. This segment DOES use "scale output without adding headcount". "cut costs" (plural). CTA = a teardown (take load off). No em dashes.

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
Hey {{firstName}}, been seeing you around the infra/devops conversation lately. Curious, how's the infra team keeping up as {{company}} grows, or is it a couple of people carrying the whole platform for everyone?

**2 — value (no ask; built to pull a "what do you mean?")**
The real bottleneck on most infra teams isn't headcount. It's that every deploy and every fire still routes through the one or two people who actually know the setup. Another hire just joins that same queue months later. Hard thing to hire your way out of.

**3 — breakup**
Last one from me {{firstName}}.

I want to tell you about Dave, our AI agent that handles infra alongside your team, with a human in the loop, so you scale output without adding headcount.

Teams that switched cut infra costs by about 45% and freed up 8x their engineering time.

Want me to map where it'd take load off {{company}}'s team? No worries either way.

## Email

**1 — Subject: Infra load at {{company}}?**
Hey {{firstName}},

Been seeing you around the infra conversation lately. At a lot of growing teams, one or two engineers end up carrying the whole platform for everyone else.

Dave handles infra alongside your team, so you scale output without adding headcount and your people stay on the roadmap.

Want me to put together a short teardown of where Dave would take load off {{company}}'s team and send it over?

**2 (day 2)**
Hey {{firstName}},

Quick context on how it works: Dave is an AI agent that handles infra with a human in the loop. It maps your whole setup and takes the day-to-day load off your engineers.

The teams that switched cut infra costs by about 45% and freed up 8x their engineering time, for a fraction of another hire.

Mind if I send more info?

**3 (day 4, breakup)**
Hey {{firstName}},

Last one from me. If the platform's still routing through a couple of people, worth seeing what Dave takes off the team so your engineers stay on the roadmap.

Want me to map where it'd take load off {{company}}?