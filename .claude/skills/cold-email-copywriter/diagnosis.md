Teaches: how to read outbound numbers at the right level, tell an infrastructure problem from a list problem from a copy problem, and judge campaign copy variant by variant.

# Diagnosis

The numbers exist to feed the next iteration. Every read ends in a verdict, a named cause, and what changes next.

## Where the numbers live

**The Hub Campaigns table is the first stop, always.** One row per campaign: Contacted, Replies, Positive Replies (CRM, our count of real linked prospects) beside the sequencer's own count, Reply Rate, Positive Rate, Bounce Rate, Last Sent, and the full Campaign Copy on the same row. The quick check is three moves: filter to the client, rank by what you care about, read the copy of winners and losers side by side. Deeper cuts (per variant, per domain, per inbox) come from the sending platform; the platform skill knows how.

## Counting honestly

- A rate without its volume is noise. One reply in forty proves nothing in either direction.
- Genuine replies only: OOO and auto-replies are not replies. Replies are unique people, not messages.
- Opens never drive a verdict. They are unmeasured unless tracking was on, and inflated by scanners even then.
- Trust CRM positive counts over sequencer labels, and verify a surprising number by reading the actual replies.

## Judge at the right level

This is the discipline that prevents wrong verdicts. Infrastructure and lists are properties of the whole sending operation, judged across every campaign at **workspace** volume. A single **campaign** earns judgment only after those are clean and only at its own volume floor. The KPIs, in the order they gate each other:

| Level | Signal | Healthy | Worrying | Broken | Judge from |
|---|---|---|---|---|---|
| Workspace · infrastructure | Bounce rate | under 3% | | 3%+ | any volume |
| Workspace · infrastructure | Domain vs siblings | in line | lagging | silent, or 80%+ sender bounces | 500+ sends per domain |
| Workspace · list | Genuine reply rate | 2%+ | 1 to 2% | under 1% | 2k+ sent across its campaigns |
| Campaign · copy & offer | Positive rate (per contacted) | 0.5%+ | 0.15 to 0.5% | under 0.15% | **3k contacted, this campaign** |
| Inbox | Positives that book | 30%+ | 20 to 30% | under 20% | positives exist |

**Copy may be blamed only from the fourth row down**: the campaign has 3k+ contacted AND every row above it reads healthy. Below the floor: keep sending or widen the window, no verdict. Rows failing above it: that row is the verdict, and the copy was never given its chance.

What each level's break means:

- **Infrastructure broken:** mail is not landing; no other number means anything. Locate by per-domain bounce splits and sibling comparison. A dead domain is replaced fast; it costs more than a new one.
- **List broken:** mail lands, the people are wrong. Read the negatives verbatim ("wrong person" = resegment, "we already use X" = saturation, go where X is not) and profile who the positives actually are; they describe the ICP that resonates, which may not be the ICP targeted.
- **Campaign broken:** finally the copy and the offer. Our own reference points: winners run 2 to 3.5% positive on tight small lists, 0.5 to 0.8% on broad ones, and a broad list at 0.5% with volume out-produces a tight list at 2%.
- **Inbox broken:** positives exist and calls do not; speed, slots, and the ask are the suspects, the campaign is not. The inbox skill owns it.

## Judging campaign copy

When the question is the copy itself, the unit of judgment is the variant, and the platform draws variations independently per step, so a variant is never a locked track: real angle tests need one campaign per angle, and a variant read is an angle read.

The read: pull per-variant numbers from the platform, then put each variant's copy beside its numbers and explain the gap in craft terms: which opener earned the read, which outcome resonated, which proof was proximate, which CTA collected. A verdict about a variant names the line responsible, not just the rate. Winning angles propagate into new campaigns; dying variants are killed, not rewritten.

Present a copy judgment in this shape (real tables, never inside code fences): a heading naming the campaign and its contacted count, then the variant table, then three labeled lines.

| Variant | Angle | Sent | Reply | Positive | Verdict |
|---|---|---|---|---|---|
| A | intro-to-founder | ... | ... | ... | winner, propagate |
| B | pain-first | ... | ... | ... | kill |

**What the winner did:** one short paragraph, naming lines.
**What the loser did:** one short paragraph, naming lines.
**Next campaign:** the angle it runs and why.

## What a verdict becomes

One of a few moves, each named with its evidence: build a different list, fix or replace infrastructure, kill and relaunch on a new angle, sharpen the offer (the strongest lever of all, see `offers.md`), or work the replies harder. A new targeting decision always pairs with new copy; the old words were written for the old reader.
