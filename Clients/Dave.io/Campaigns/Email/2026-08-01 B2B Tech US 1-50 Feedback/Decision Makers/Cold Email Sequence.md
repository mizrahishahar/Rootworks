---
Type: Campaign Sequence
client: Dave.io
segment: Decision Makers - Feedback
channel: Email (PlusVibe)
updated: 2026-08-07
---

# Decision Makers - Feedback - Sequence (Email)

**Audience:** infra decision makers (founders, CEOs, CTOs, Heads/VPs of Eng) at US B2B tech companies, 1-50 employees, software product on cloud infra - fresh leads never contacted by us (deduped vs the 17.7 sends and the DNC). Seat is carried by the authority line, one campaign. Playbook: `feedback-led`, follow-up rebuilt on `default`. Sender: PlusVibe (Flowroots X Dave.io, Dave-1 inbox set). Live campaigns: 2026-08-01 - B2B Tech US 1-50 - Infra Decision Makers (6a6e2d3dabf8c14b8a8aae1d) and - SEG (6a7088afeba0a1d3e31819b2).

**Vars:** {{first_name}}, {{authority_line}}. The authority line is a per-lead clause derived from the company Description - completes "Given the fact that ..." in 1A and "I'm writing because ..." in 1B, lowercase, 12 words max, names what they actually run, no compliment. Examples: "you're the one keeping the payments API up at Lumen", "your team runs a real-time classifier on two engineers".

---

## v2 - CURRENT (2026-08-07)

**Touch 1 - variant A** (opens on us) - subject: your take {{first_name}}?

{{first_name}}, my co-founders and I left monday(.)com to build the first ever autonomous cloud infrastructure.

Given the fact that {{authority_line}}, you'd know fast whether this is useful or nonsense.

Would appreciate your honest take.

P.S. Best case I save you $200K a year on an infra role. Worst case I owe you twenty minutes and a $50 Amazon gift card.

**Touch 1 - variant B** (opens on them) - subject: built something for lean eng teams

{{first_name}}, I'm writing because {{authority_line}}.

We are three founders that left monday(.)com to build the first ever autonomous cloud infrastructure.

I'm looking to get your honest feedback on what we've built. I think it can help you.

Can I share more?

P.S. Best case I save you $200K a year on an infra role. Worst case I owe you twenty minutes and a $50 Amazon gift card.

**Touch 2 - single variant** - threaded, +2 days

FYI, I'm only asking teams running real production infra without a real team dedicated to it. That's why you came up.

8 teams are already running it in production. We cut their cloud costs around 45%, and freed up 8x of their engineering time.

I'm pretty sure it'll blow your mind, and might save you $200K a year on an infra role. If not, a $50 Amazon gift card, on me.

Can I show you what we built?

P.S. not relevant? just reply "no thanks"

### What the variant pair tests

1A opens on us and puts their authority mid-email. 1B opens on them, leading with the authority line, and puts the credential second. One variable: the entry point.

### Spintax (deploy stage)

**1A - 4 slots**

| Slot | Option 1 (base) | Option 2 | Option 3 |
|---|---|---|---|
| the departure | my co-founders and I left | my co-founders and I walked out of | my co-founders and I quit |
| the build | the first ever autonomous cloud infrastructure | the first autonomous cloud infrastructure there has ever been | the first ever autonomous cloud infra |
| the read | you'd know fast whether this is useful or nonsense | you'd be able to tell straight away if it's the real thing | you'd know quicker than most whether it's useful or nonsense |
| the ask | Would appreciate your honest take. | Would really value your honest take. | Would love your honest take on it. |

**1B - 4 slots** (CTA fixed, no spin)

| Slot | Option 1 (base) | Option 2 | Option 3 |
|---|---|---|---|
| the reason | I'm writing because | I'm reaching out because | Writing because |
| the founders | We are three founders that left | We're three founders who left | The three of us left |
| the build | the first ever autonomous cloud infrastructure | the first autonomous cloud infrastructure there has ever been | the first ever autonomous cloud infra |
| the ask | I'm looking to get your honest feedback on what we've built. | I'd really like your honest feedback on what we've built. | I'm after your honest feedback on what we've built. |

**2A - 6 slots** (eligibility opener fixed, no spin)

| Slot | Option 1 (base) | Option 2 | Option 3 |
|---|---|---|---|
| the proof | 8 teams are already running it in production | 8 teams have it in production right now | It's in production at 8 teams already |
| the cost result | cut their cloud costs around 45% | took around 45% off their cloud bill | brought their cloud costs down around 45% |
| the time result | freed up 8x of their engineering time | gave them back 8x of their engineering time | put 8x of their engineering time back on the roadmap |
| the upside | and might save you | and could well save you | and it might save you |
| the downside | If not, a $50 Amazon gift card, on me. | If not, a $50 Amazon gift card is on me. | If not, I'll send you a $50 Amazon gift card. |
| the CTA | Can I show you what we built? | Can I walk you through what we built? | - |

**Never spun:** monday(.)com, {{authority_line}} and its frame, 45%, 8x, $200K, $50 Amazon gift card, "That's why you came up.", "I think it can help you.", "I'm pretty sure it'll blow your mind", "Can I share more?", "FYI, I'm only asking teams".

---

## v1 - RETIRED (2026-08-01 to 2026-08-07)

**Result:** 0.2% reply on 1,237 contacted (main), 0.6% on 167 (SEG). Under every band, and under the direct 4/2/2 it replaced (0.7-1.3%).

**Why it was retired:**
- Touch 1 closed on "Would it make sense to present it to you?" - a demo request inside a feedback ask, which collapses the disarm the playbook rests on.
- The bet (the only line with real asymmetry) sat on day 3, behind "blow your mind".
- Touch 2 was a single variant and carried no independent lever.

**Touch 1 - variant A** - subject: your take {{first_name}}?

{{first_name}}, my co-founders and I left monday(.)com to build the first ever autonomous cloud infrastructure.

Given the fact that {{authority_line}}, you'd know fast whether this is useful or nonsense.

I'd really value your honest take. Would it make sense to present it to you?

**Touch 1 - variant B** - subject: built something for lean eng teams

Hey {{first_name}},

Three of us left monday(.)com to build the first system that runs a company's cloud infrastructure end to end. No need for an agency or a hire.

Given the fact that {{authority_line}}, you'd know better than most whether it's real.

Would it make sense to present it to you? Happy to share more if that's interesting.

**Touch 2 - single variant** - threaded, +2 days

Quick follow-up. The teams already running it cut cloud costs around 45% and got their engineers back on the product instead of handling fires.

I'm pretty sure it'll blow your mind. Best case I save you $200K a year on an infra hire, worst case I owe you twenty minutes and a $50 Amazon gift card.

Can I show you what we built?

---

## Cohort note (v1 to v2 changeover)

The edit was applied in place on the live campaigns rather than as a new campaign (Operator's call). At changeover the main campaign stood at 1,336 contacted of 3,634:

- ~380 completed both touches on v1 - never see v2.
- ~956 mid-sequence - got v1 touch 1, will get v2 touch 2. They never see the bet in the touch-1 P.S.
- ~2,298 untouched - get v2 in full.

When judging v2, the number to trust is replies from leads first contacted on or after 2026-08-07, not the campaign's headline rate.

## Question history

v1 (2026-08-01): first campaign on the feedback-led playbook for Dave.
v2 (2026-08-07): CTA de-pitched, bet moved to a touch-1 P.S., follow-up rebuilt on `default` (eligibility -> pilot result -> bet -> CTA), both proof numbers carried, spintax rebuilt to 3 options per slot.
