---
Type: Campaign Sequence
client: Piper AI
segment: Decision Makers - Feedback
channel: Email (PlusVibe)
updated: 2026-08-05
---

# Decision Makers - Feedback - Sequence (Email)

**Audience:** decision makers at US GC / CMAR firms - the operating layer, not the top. Presidents, VPs, COOs, ops and precon directors, chief estimators, BizDev, plus the innovation / VDC / senior-tech seats. CEO / Chairman / Owner deliberately excluded. Every lead has a verified email and has never been in a Piper campaign.

**Segments:** `Decision Makers` (sendable, 326) and `Decision Makers - Gateway` (173). **Identical copy on both** - the gateway split is a deliverability fence, not an audience. Playbook: `feedback-led`, shape 4 / 1. Sender: PlusVibe, workspace 6a27bb851bffeb09ca749fd9. Sending window 03:00-11:00 PT, Mon-Fri.

**Vars:** `{{first_name}}`, `{{authority_line}}`. The authority line is a per-lead clause derived from Title + company_clean + Description - completes "Given the fact that ...", lowercase, 10 words max, points at where work gets won and planned, and names the company where it reads naturally. Example: "you and your team shape which facility projects Kroeschell pursues". **A blank authority line breaks every touch-1 variant mid-sentence - those leads are held back, not sent.**

**Deployed.** PlusVibe drafts `2026-08-05 - US GC-CMAR Feedback - Decision Makers` (6a735d24d80eb8df867e8829) and `... - Gateway` (6a735d25ca6ae58fa0b77abb). Mon-Fri 03:00-11:00 America/Los_Angeles, 39 inboxes, daily limit 5000, stop-on-reply at the domain, bounce auto-pause 5%, tracking off, priority 0.5, 2-day gap between touches. Spintax on greeting and every CTA, three options each, meaning-neutral; never on the offer, the funding line or the proof.

**One folder, two sending campaigns.** A SEG split is a deliverability fence, not an audience, so it does not earn its own campaign folder - both lead lists live flat here. See conventions-manager.

**The test.** Two bodies x two subject lines, crossed. Body A carries the "get more specific" one-liner and says "AI operating system". Body B carries "supercharges your estimating team" and says "operating system", no AI. Subject A is "your take {{first_name}}", subject B is "built something for precon teams".

**Touch 1 - variant 1A** - body A, subject: your take {{first_name}}

{{first_name}},

We raised from the most respected fund in the world, the one behind Airbnb and Instagram, to build the first ever AI operating system for preconstruction teams.

It enables growth-driven general contractors to get more specific under pressure without adding headcount.

Given the fact that {{authority_line}}, you'd know fast whether this is useful or nonsense.

Would appreciate your blunt take if you're open to it.

**Touch 1 - variant 1B** - body B, subject: built something for precon teams

Hey {{first_name}},

We raised from the fund behind Airbnb and Instagram to build the first ever operating system for pre-con teams.

We built something that supercharges your estimating team, scaling bid volume and raising win rate without adding headcount.

Given the fact that {{authority_line}}, your read on this would be worth more than most.

Open to giving us your honest take?

**Touch 1 - variant 1C** - body A, subject: built something for precon teams

{{first_name}},

We raised from the most respected fund in the world, the one behind Airbnb and Instagram, to build the first ever AI operating system for preconstruction teams.

It enables growth-driven general contractors to get more specific under pressure without adding headcount.

Given the fact that {{authority_line}}, you'd know fast whether this is useful or nonsense.

Would appreciate your blunt take if you're open to it.

**Touch 1 - variant 1D** - body B, subject: your take {{first_name}}

Hey {{first_name}},

We raised from the fund behind Airbnb and Instagram to build the first ever operating system for pre-con teams.

We built something that supercharges your estimating team, scaling bid volume and raising win rate without adding headcount.

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
- **a16z named by what it is known for, not by its name.** "a16z" alone means nothing to a precon director. Nikol's call (2026-08-05): name the fund by Airbnb and Instagram instead. Body A uses "the most respected fund in the world, the one behind Airbnb and Instagram"; body B uses the plainer "the fund behind Airbnb and Instagram". Both claims are client-supplied and should stay confirmed with Nikol.
- **AI is a variable under test.** Body A says "AI operating system" (Nikol's suggestion); body B deliberately omits AI, per Shahar. The construction market's trust in generic AI is low, so whether the word helps or hurts is a real question.
- **The second line is the other variable.** Body A runs the positioning one-liner ("get more specific under pressure"); body B runs Nikol's "supercharges your estimating team".
- **Subjects crossed.** 4 variants = 2 bodies x 2 subjects, so subject-line effect reads separately from body effect.
- **No numbers in touch 1.** Every outcome lives in touch 2.
- **Bid-hunting is not the lead.** It appears as one outcome in touch 2, never as the opening promise - that framing is what the 29.7 Opportunity Hunter ran to 0 positives.
- **No "?" in either subject** (Nikol reset, 07-06). Nikol's 07-20 language rules applied: "precon", "system" not "software", no backward-looking "what you already win" framing.
- **The walkthrough is a promise.** Assets records that prior copy promised a walkthrough that was never recorded. This one is recorded on request, personalised - Roi must be willing to make it.
- **No links, no Loom link, no named logos, no calendar, no terms, no guarantee.** The one-pager and Canva deck stay held for warm, asked-for moments.
