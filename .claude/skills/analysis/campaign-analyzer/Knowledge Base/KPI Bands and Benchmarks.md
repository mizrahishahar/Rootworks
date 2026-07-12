# KPI Bands and Benchmarks

Two layers. The **six audits and their measurement sticks** are the live judgment system Flowroots runs on. The **coach benchmarks** are the authoritative source numbers behind them. Judge with the sticks; cite the benchmarks for the why.

## The system in one paragraph

Every audit runs at **workspace level** — all the client's campaigns together. Every stick lands in one of three bands, and the band is the action: **ok = everything is good, say so and move on. warning = investigation is optional, invite it. error = investigation is mandatory.** That constant never changes, audit to audit, day to day. **Bands are mechanical and are never overridden.** A stick in error is in error even when every neighboring metric looks healthy: OOO, bounce, placement tests, and any other signal inform the *investigation* — they help locate where the break is — but they never soften, excuse, or flip a verdict. If the drill concludes the break is downstream (a list signal, not a pipe problem), that is a *finding reported under the error verdict*, never a reason to print OK. Only once an investigation fires do you break the workspace apart — into domains (deliverability) or campaigns (everything else).

## The audit order

1. **Sending Pulse** — are emails going out, and will they keep going out?
2. **Deliverability** — are we landing in front of real humans?
3. **List** — are these the right people? (gated: 5k+ sent AND deliverability clean)
4. **Copy & Offer** — what pulls replies and what doesn't? (gated: 10k+ sent AND 1+2 clean)
5. **Booking** — do positives become booked calls?
6. **Show** — do booked calls happen?

Sending days are **Monday-Friday**. "Yesterday" always means the last sending day.

## The measurement sticks

### 1. Sending Pulse

| Stick                        | ok             | warning           | error             |
| ---------------------------- | -------------- | ----------------- | ----------------- |
| Sent on the last sending day | 1,000+ per day | 500-1,000 per day | under 500 per day |

The last-sending-day number **states, it does not trigger**. What matters is forward: how many emails are queued to go **today**, tomorrow, and in general — computed per active campaign from new-lead runway plus follow-ups due. A weak yesterday with a strong queue is fine; a strong yesterday with a dry queue is the real error.

- **New-lead runway** = total loaded leads minus contacted, summed across active campaigns, divided by the daily new-lead consumption. This is the number the verdict hangs on.
- A Sending Pulse problem is a **leads problem**. It is not about schedules, inbox errors, or paused campaigns. It means the lists are exhausting and nothing new is staged. The fix is always fulfillment: build the next list, build the next campaign.

### 2. Deliverability

Gate: workspace sent 2,000+ in the window. Under it, the only verdict is "keep sending."

| Stick | ok | warning | error |
|---|---|---|---|
| **Genuine reply rate** — human replies only, OOO and automatic replies excluded, / sent | >= 2% | 1-2% | < 1% |
| **OOO rate** (min 2k, reliable at 5k) | >= 2% | 1-2% | < 1% |
| **Workspace bounce rate** | < 3% | — | >= 3% |

Genuine replies include interested, not-interested, info, wrong-person — any human reply proves a human received the mail. Under 1% genuine reply signals a deliverability problem, full stop. Near-zero OOO at volume means mail is likely filtered before a human ever sees it.

**Domain drill (fired by warning optionally, by error mandatorily):** per domain, minimum 500-1,000 sends on that domain before judging it.
- Per-domain bounce + reason split: **sender bounce >= 80%** = accounts fried, delete and replace. Hard bounces concentrated = data problem, pause and clean the list. Catch-all/public campaigns get looser bounce bars by nature.
- Per-domain genuine reply rate: **< 1%** while sibling domains are healthy = rest/kill that domain.
- **Trend (checked only when signs fired, never as a daily chore):** a domain under 1% genuine reply for 3-4 weeks, or 40% below the 30-day workspace average = aging infra, rest/kill. History comes from prior daily audit logs.

### 3. List — gated: 5k+ sent AND deliverability clean

| Stick | ok | warning | error |
|---|---|---|---|
| **Positive rate** (positives / sent) | >= 0.5% | 0.15-0.5% | < 0.15% |

With clean infra, the list is the default suspect (~80% of the time).

### 4. Copy & Offer — gated: 10k+ sent AND deliverability + list clean

Same positive-rate stick, read per campaign and per variant against the **workspace average**. Above average works; below does not. Simple.

### 5. Booking

| Stick | ok | warning | error |
|---|---|---|---|
| **Booking rate** (booked / positives) | > 30% | 20-30% | < 20% |

### 6. Show

| Stick | ok | warning | error |
|---|---|---|---|
| **Show rate** (completed / (completed + no-show)) | >= 60% | 40-60% | < 40% |

## Coach benchmarks (the source numbers)

### Christian — base campaign KPIs (of prospects contacted)

- Reply rate (any reply): **2-4%**. Below it, suspect deliverability.
- Positive reply rate: **0.25-0.5%**. Below it, suspect list or copy.
- Meetings booked: **2-4 per 1,000 contacted**. Below it, suspect reply handling.

### Matt Lucero — at scale

- **5,000-10,000 sends** before judging a campaign. **10,000** before judging copy. **5,000 leads** validates a niche test.
- Reply rate **~1% floor**; above 1% keep rolling.
- Positive -> call booked: **20% blended** (calendar-ask replies ~90% book, pricing-ask replies ~5%).
- Root-cause rule: check infra hygiene first; if infra is clean, default to the **list**. Copy is almost never the cause unless the sequence carries links, phone numbers, or weird formatting.

### Nick Abraham — infra, bounce, and kill

- Do not assess deliverability under **500-1,000 sends per domain**. Do not evaluate bounce rate until volume makes the percentage mean something.
- **Bounce reason matters more than bounce rate.** Hard bounce = data/list problem: pause and clean. Sender bounce = reputation: delete and replace the accounts.
- Catch-all and public-email campaigns bounce higher by nature; judge them on separate, looser thresholds.
- Do not trust warmup scores. Kill on sender bounce + reply trend instead.
- Kill a domain on any one of: sender bounce **>= 80%**; reply rate trending **< 1% for 3-4 weeks**; reply rate **40% worse than the 30-day portfolio average**; **40%+ spam-rejected** to clean Google/Outlook inboxes.

### CA community consensus

- **Lead list is the culprit ~80% of the time.** Stop tweaking subject lines first; fix the list.
- Kill domains under **1% reply** or over **3% bounce**. Move fast on kills.

### CA funnel benchmarks — show rate

- Cold-traffic show rate target: **60%+**; healthy observed range 50-75%. Warm traffic reaches 80%+. Pre-call assets, reminders, and pre-call touches are what move it.

### Andre — 2026 volume and cadence

- **>= 1,000 emails/day** and **>= 30,000/month** per client. This is where the Sending Pulse ok-line comes from.
- **90-day** minimum commitment window before judging whether cold email works for the offer.
- **10+ touchpoints per lead**, achieved by recycling lists across new campaigns.
- Reply references: ~2.5% in a standard niche, 4-5% in an unsaturated niche, 0.5% at very high volume.

## How the layers reconcile

The 2% genuine-reply / 0.5% positive lines sit between Matt's 1% survival floor and Christian's 2-4% target. Read it: **1% is "still alive," 2%+ is "on target," below 1% is a real problem.** The sticks are the operational truth; the coach numbers explain why each line sits where it does.
