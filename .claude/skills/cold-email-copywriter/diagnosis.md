Teaches: how to judge a campaign, meaning the message and the offer as they landed on this batch of people. When a campaign earns a verdict, what the verdict is, and how "good" is measured once the easy rules run out.

# Diagnosis

A campaign is judged on one thing: did the message and the offer earn positive replies from these people. Nothing here is about domains, inboxes or lists.

**This file applies only once infrastructure and list are known clean.** Infrastructure is the inbox-management skill's job: its weekly health report flags the domains, and a client carrying open flags on the domains a campaign sends from has no campaign verdict yet, only an infrastructure one. The list is the list-building skill's job: a campaign whose people are the wrong people is a list verdict, read from the negatives verbatim ("wrong person", "we already use X"). When both are clean, everything below is about copy and offer.

## Where the numbers live

**The Hub Campaigns table is the first stop, always.** One row per campaign: Contacted, Messages Sent, Replies, Positive Replies (CRM), Last Sent, and the full Campaign Copy on the same row. Filter to the client, rank by positives, read the copy of winners and losers side by side. Per-variant numbers come from the sending platform in session.

## Counting

- Positive replies are the stick. A positive is a linked Prospects row, our count, never the platform's label.
- Contacted is the denominator, never sends and never leads loaded.
- OOO and auto-replies are not replies. Opens never drive a verdict.
- A rate without its volume is noise.

## The rule

| Moment | Read | Verdict |
|---|---|---|
| Launch | Leads loaded | 1,000 per campaign, never more. The deploy door refuses a view over 1,000 |
| 1,000 sends | Positive replies | 0 = kill. 1 or more = scale to 3,000 |
| 3,000 sends | Positive replies per 1,000 contacted, per variant | Judge, below |

Before 1,000 sends there is no read. Between 1,000 and 3,000 there is no read either; the campaign is scaling, and the only thing to do is feed it. A campaign killed at 1,000 is killed as an angle on this segment, and the next campaign on the segment runs a different angle.

## Judging at 3,000

At 3,000 there is no absolute number that says good. There are three relative reads, and a verdict needs all three.

**1. Against the client's own campaigns.** The stick is positive replies per 1,000 contacted. The benchmark is the median of this client's campaigns that reached 3,000. The first campaign to reach 3,000 sets the bar for the ones after it.

| This campaign vs the median | Verdict |
|---|---|
| Above | Double down: same segment, same angle, more list, and the winning variant becomes the next campaign's base |
| At par | Keep running to the end of the segment. Nothing to copy, nothing to kill |
| Under half | Kill the angle, unless one variant alone is above the median, in which case that variant is the next campaign |

**2. Against what a positive is worth.** A positive is worth the client's fee per call times the share of positives that book. A campaign earns its sends while positives per 1,000 contacted, times that value, exceeds what 1,000 sends cost the client in infrastructure and our time. The numbers come from the client's registry row and the Hub, never from memory. A campaign at par on read 1 can still be worth doubling down on if one positive is worth enough, and a campaign above par can still not be worth it if the client's economics are thin.

**3. Against the TAM left.** How many people fitting this segment remain uncontacted, read from the client's ClayRoots view count. A winner with no TAM left is finished, not scaled: the next move is a sibling segment with the same angle. A loser on a segment with a large TAM is a copy problem worth one more angle before the segment is abandoned.

Only one of the three reads can decide alone: no positives at all past 3,000 is a kill whatever the economics.

## Judging the variants

The platform draws variations independently per step, so a variant is never a locked track. Real angle tests are one campaign per angle, and a variant read is a subject-line or opener read, not an angle read.

Pull per-variant numbers from the platform, put each variant's copy beside its numbers, and explain the gap in craft terms: which opener earned the read, which outcome resonated, which proof was proximate, which CTA collected. A verdict about a variant names the line responsible, not just the rate. Winning variants propagate into the next campaign as its base; dying variants are killed, not rewritten.

Present it in this shape, real tables, never inside code fences: a heading naming the campaign and its contacted count, then the variant table, then three labeled lines.

| Variant | Angle | Contacted | Positive | Per 1,000 | Verdict |
|---|---|---|---|---|---|
| A | intro-to-founder | ... | ... | ... | base for next |
| B | pain-first | ... | ... | ... | kill |

**What the winner did:** one short paragraph, naming lines.
**What the loser did:** one short paragraph, naming lines.
**Next campaign:** the segment, the angle, and which of the three reads decided it.

## What a verdict becomes

One of four moves, each named with its evidence: kill the angle and relaunch the segment on a new one; double down with more list on the same angle; move the angle to a sibling segment because the TAM ran out; sharpen the offer, the strongest lever of all, see `offers.md`. A new segment always gets new copy; the old words were written for the old reader.
