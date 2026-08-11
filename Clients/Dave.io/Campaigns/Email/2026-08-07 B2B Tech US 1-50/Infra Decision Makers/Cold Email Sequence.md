---
Type: Campaign Sequence
client: Dave.io
segment: Infra Decision Makers
channel: Email (PlusVibe)
playbook: offer-led
updated: 2026-08-11
---

# Infra Decision Makers - Sequence (Email)

**Audience:** infra decision makers (founders, CEOs, CTOs, Heads/VPs of Eng) at US B2B tech companies. Audience not yet loaded - both campaigns sit at 0 leads pending the corrected pull from the `/List dave 10.8` relevance rebuild. The folder name follows the campaign name and should be renamed if the market changes.

**Playbook:** `offer-led`. Runnable because Sean approved the guarantee on 2026-08-11 and asked for it to be A/B tested.

**Sender:** PlusVibe (Flowroots X Dave.io). Live campaigns: `2026-08-07 - B2B Tech US 1-50 - Infra Decision Makers - offer-led` (6a75cf2674835df2d825dd19, 40 inboxes) and `- Gateway` (6a78212e78b225f68c3838a9, 14 SURBL-FREE inboxes). Both DRAFT.

**Vars:** {{first_name}}, {{company_name}}. No {{authority_line}} - this campaign carries none of that token's blast radius and can run on any corrected pull with no AI-field pass.

**The A/B (Sean's ask, do not collapse):** the guarantee sits in the body on body A, condition-framed, and in the P.S. on body B, failure-framed. Each body runs against both subject lines, so touch 1 is four variants. Compare A vs C and B vs D for the subject question; A vs B for the guarantee-placement question.

---

## v2 - CURRENT (2026-08-11)

### Touch 1

**Variant A** - body A - subject: your cloud costs
**Variant C** - body A - subject: {{first_name}} <> Sean

{{first_name}},

If we could cut 45% of {{company_name}}'s cloud costs and the $200K a year on an infra role, with the first ever autonomous cloud infrastructure (you only pay once you see it actually work on your setup), would this be worth sharing more?

P.S. Either way, a $50 Amazon gift card on me.

**Variant B** - body B - subject: your cloud costs
**Variant D** - body B - subject: {{first_name}} <> Sean

{{first_name}},

If we could 8x your engineering output by making sure your team never has to touch infrastructure again (we're three ex monday(.)com founders who just built the first ever autonomous cloud infrastructure), would this be worth sharing more?

P.S. If it doesn't work on your setup, you don't pay. And a $50 Amazon gift card on me either way.

### Touch 2

Threaded, +2 days, single variant.

{{first_name}},

This isn't recruiting, it isn't an agency, and it isn't anything you've seen before (hint: it has human-backed agents).

I'm pretty sure it'll blow your mind. I'm reaching out to teams without a full infra team behind them to get their honest feedback on it.

Mind if I send it over?

P.S. if this isn't relevant, just reply "no thanks". That's feedback too.

### Spintax (deploy stage)

Every option was substituted into its sentence and read back before shipping. The touch-1 ask sits inside an "If we could ... would ..." conditional, so every option must begin with "would" or the sentence breaks.

**Body A (variants A and C)**

| Slot | Option 1 | Option 2 | Option 3 |
|---|---|---|---|
| the build | the first ever autonomous cloud infrastructure | the world's first autonomous cloud infrastructure | the first autonomous cloud infrastructure ever built |
| the ask | would this be worth sharing more? | would you want to hear more? | would it be worth me sending you more? |

**Body B (variants B and D)**

| Slot | Option 1 | Option 2 | Option 3 |
|---|---|---|---|
| the build | who just built the first ever autonomous cloud infrastructure | who just built the world's first autonomous cloud infrastructure | behind the first ever autonomous cloud infrastructure |
| the ask | would this be worth sharing more? | would you want to hear more? | would it be worth me sending you more? |

**Touch 2**

| Slot | Option 1 | Option 2 | Option 3 |
|---|---|---|---|
| the negation | This isn't recruiting, it isn't an agency, and it isn't anything you've seen before | Not a recruiter, not an agency, and nothing like what's already out there | It's not a hire, it's not an agency, and there's nothing else like it |
| the qualifier | teams without a full infra team behind them | teams without a full infra team in place | teams without a full infra team of their own |
| the feedback ask | to get their honest feedback on it | for their honest feedback on it | to hear their honest feedback |
| the CTA | Mind if I send it over? | Want me to send it over? | Can I send it over? |

**Never spun:** 45%, $200K, 8x, the guarantee in either position, the $50 Amazon gift card, monday(.)com, the "(hint: it has human-backed agents)" parenthetical, "I'm pretty sure it'll blow your mind.", all three P.S. lines.

**Spam check:** "save" and "for you" / "for your" appear nowhere - not in a body, not in a P.S., not in a spintax option. Both were present in v1 and were the reason for this revision.

---

## Previous messages

### v1 - RETIRED (2026-08-07 to 2026-08-11)

Never sent. Retired before launch for three reasons: each body was locked to a single subject so the subject line could not be read independently; the copy carried the spam-flagged words "save" and "for your time"; and touch 2 did not name what the product actually is.

**Variant A** - subject: your cloud costs

{{first_name}},

If we could cut 45% of {{company_name}}'s cloud costs and save you $200K a year on an infra role, with the first ever autonomous cloud infrastructure (you only pay once you see it actually work on your setup), would this be worth sharing more?

P.S. Either way, $50 Amazon gift card on me for your time.

**Variant B** - subject: shipping at {{company_name}}

{{first_name}},

If we could 8x your engineering output by making sure your team never has to touch infrastructure again (we're three ex monday(.)com founders who just built the first ever autonomous cloud infrastructure), would this be worth sharing more?

P.S. If it doesn't work on your setup, you don't pay. And either way, $50 Amazon gift card on me for your time.

**Touch 2** - threaded

{{first_name}},

This isn't recruiting, it isn't an agency, and it isn't anything you've seen before.

I'm pretty sure it'll blow your mind. I'm reaching out to teams without a full infra team behind them to get their honest feedback on it.

Mind if I send it over?

P.S. if it's not for you, just reply "no thanks". That's feedback too.

---

## Open

- **The audience.** Both campaigns are at 0 leads. The natural source is the recovered pool from the `/List dave 10.8` relevance rebuild, which is correcting a ~37-39% non-US leak and a `reloaded_patch` scope that was silently cutting qualified buyers.
- **Sean on `human-backed agents`.** He cut the phrase "human in the loop" on 2026-07-17. This is the same concept in different words and it is now live in touch 2. Worth telling him.
- **The client-review export** has not been produced. It is the last artifact and comes only once the audience is loaded and the campaign has launched.
