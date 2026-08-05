---
Type: Campaign Sequence
client: Piper AI
segment: Decision Makers - Feedback
channel: Email (PlusVibe)
updated: 2026-08-05
---

# Decision Makers - Feedback - Sequence (Email)

**Audience:** decision makers at US GC / CMAR firms - the operating layer, not the top. Presidents, VPs, COOs, ops and precon directors, chief estimators, BizDev, plus the innovation / VDC / senior-tech seats. CEO / Chairman / Owner deliberately excluded. Every lead has a verified email and has never been in a Piper campaign.

**Segments:** `Decision Makers` (sendable, 326) and `Decision Makers - Gateway` (173). **Identical copy on both** - the gateway split is a deliverability fence, not an audience. Playbook: `feedback-led`, shape 2 / 1. Sender: PlusVibe, workspace 6a27bb851bffeb09ca749fd9. Sending window 03:00-11:00 PT, Mon-Fri.

**Vars:** `{{first_name}}`, `{{authority_line}}`. The authority line is a per-lead clause derived from Title + company_clean + Description - completes "Given the fact that ...", lowercase, 10 words max, points at where work gets won and planned. Example: "you and your team shape which luxury retail jobs get pursued". **A blank authority line breaks both touch-1 variants mid-sentence - those leads are held back, not sent.**

**Touch 1 - variant 1A** - subject: your take {{first_name}}

{{first_name}},

We raised money to build the first ever operating system for preconstruction teams.

It enables growth-driven general contractors to get more specific under pressure without adding headcount.

Given the fact that {{authority_line}}, you'd know fast whether this is useful or nonsense.

Would appreciate your blunt take if you're open to it.

**Touch 1 - variant 1B** - subject: built something for precon teams

Hey {{first_name}},

We raised money to build an end to end operating system for pre-con teams.

It helps scale bid volume, cut manual rework, raise win rate, and break into new bid sources, all without adding headcount.

Given the fact that {{authority_line}}, your read on this would be worth more than most.

Open to giving us your honest take?

**Touch 2 - single variant** - threaded, no new subject, +2 days

I can record a quick walkthrough for you if you prefer.

A team we just ran a pilot with reached incredible results. Around 50 hours a month hunting bids is gone, and two people on their precon desk now do what used to take ten.

I'm positive it will impress you.

Let me know what you think.

## Question history

First campaign on the feedback-led playbook for Piper. Written 2026-08-05 after four outcome-led campaigns (29.7 Opportunity Hunter) returned 0 positives on 545 sends.

Decisions taken during the write:
- **Authority is OURS, not the prospect's.** The opener is the funding credential; `{{authority_line}}` (the prospect's remit) sits below it, exactly as in the Dave.io feedback template.
- **a16z named and then dropped.** "a16z" alone means nothing to a precon director. Tested as "a16z, one of the biggest tech investors in the world" and "the fund now pouring money into construction" before settling on the plainest form, "we raised money to build". a16z stays in the inbox-manager's pocket for when a reply asks who backs us.
- **No numbers in touch 1.** Touch 1 is the clean value prop only; every outcome lives in touch 2.
- **Bid-hunting is not the lead.** It appears as one outcome in touch 2, never as the opening promise - that framing is what the 29.7 Opportunity Hunter ran to 0 positives.
- **No "?" in either subject** (Nikol reset, 07-06). Nikol's 07-20 language rules applied: "precon", "system" not "software", no backward-looking "what you already win" framing.
- **Touch 2 variant B scratched** - it was a rewording of 2A, not a different angle.
- **The walkthrough is a promise.** Assets records that prior copy promised a walkthrough that was never recorded. This one is recorded on request, personalised - Roi must be willing to make it.
- **No links, no Loom link, no named logos, no calendar, no terms, no guarantee.** The one-pager and Canva deck stay held for warm, asked-for moments.
