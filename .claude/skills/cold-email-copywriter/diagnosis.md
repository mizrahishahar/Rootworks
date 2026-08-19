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

This is the discipline that prevents wrong verdicts. Two levels, judged in order:

**1. The workspace level: infrastructure and lists.** Deliverability and list health are properties of the whole sending operation, not of one campaign. Judge them across every campaign a client is running, at workspace volume:

- **Infrastructure.** Bounce rate 3%+ anywhere, or replies near zero across ALL campaigns, or one domain silent while its siblings reply: that is mail not landing, and no campaign verdict is valid until it is ruled out. Per-domain bounce splits and sibling-domain comparison locate it. A domain with 80%+ sender-side bounces or weeks under 1% reply is dead: replace it fast, a dead domain costs more than a new one.
- **The list.** Judged across the campaigns that share it. Healthy genuine reply runs 2%+; under 1% at 2k+ sent with clean infrastructure says the mail lands but the people are wrong. Read the negatives verbatim: "wrong person" means resegment, "we already use X" means saturation, go where X is not. Profile who the positives actually are; they describe the ICP that resonates, which may not be the ICP that was targeted.

**2. The campaign level: copy and offer.** Only once infrastructure and list are clean does a campaign's own performance mean anything. **A campaign is judged from roughly 3k contacted.** Below that, keep sending or widen the window; above it, the campaign's positive rate is real: 0.5%+ is healthy, 0.15 to 0.5% says the argument is weak, under 0.15% says kill it. Our own winners have run 2 to 3.5% positive on tight small lists and 0.5 to 0.8% on broad ones; a broad list at 0.5% with volume out-produces a tight list at 2%.

**3. After the reply: the inbox.** Positives that do not become calls (healthy is 30%+ booking) are a working-the-reply problem: speed, slots, the ask. The inbox skill owns it; the campaign is not the suspect.

## Judging campaign copy

When the question is the copy itself, the unit of judgment is the variant, and the platform draws variations independently per step, so a variant is never a locked track: real angle tests need one campaign per angle, and a variant read is an angle read.

The read: pull per-variant numbers from the platform, then put each variant's copy beside its numbers and explain the gap in craft terms: which opener earned the read, which outcome resonated, which proof was proximate, which CTA collected. A verdict about a variant names the line responsible, not just the rate. Winning angles propagate into new campaigns; dying variants are killed, not rewritten.

Present a copy judgment in this shape:

```
### {campaign} · {contacted} contacted

| Variant | Angle | Sent | Reply | Positive | Verdict |
|---|---|---|---|---|---|
| A | intro-to-founder | ... | ... | ... | winner, propagate |
| B | pain-first | ... | ... | ... | kill |

**What the winner did:** one short paragraph, naming lines.
**What the loser did:** one short paragraph, naming lines.
**Next campaign:** the angle it runs and why.
```

## What a verdict becomes

One of a few moves, each named with its evidence: build a different list, fix or replace infrastructure, kill and relaunch on a new angle, sharpen the offer (the strongest lever of all, see `offers.md`), or work the replies harder. A new targeting decision always pairs with new copy; the old words were written for the old reader.
