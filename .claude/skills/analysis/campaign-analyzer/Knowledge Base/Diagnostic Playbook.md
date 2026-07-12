# Diagnostic Playbook

How each audit is investigated once its band calls for it. The sticks (KPI Bands and Benchmarks) say whether to investigate; this says exactly what the investigation is. The constant: **ok = say so and move on · warning = investigation optional, invite it · error = investigation mandatory.** All sticks are read at workspace level; investigation is where you break into domains or campaigns.

## 1. Sending Pulse

**What it is about:** the amount of sends and the amount of leads. Nothing else. Not schedules, not inbox errors, not paused campaigns — when the pulse weakens it is because **we do not have enough leads**.

**The daily read (always, no trigger needed):**
- Sent on the last sending day (Mon-Fri only), against the 1,000/500 stick. This number states, it does not trigger.
- **Queued today and tomorrow:** per active campaign, new leads remaining (total loaded minus contacted) plus follow-ups due (contacted minus completed, mapped against sequence waits). This is the number that matters.
- **New-lead runway** in sending days.

**Investigation (warning invites, error demands):** go deep into the client's **list-building logs** — they are written detailed for exactly this. Establish:
- Where the leads state stands: what was built, what was loaded, what remains.
- Are we close to exhausting the current lists?
- Is there a list already built but not yet loaded into a campaign?
- What are the next steps the last build session left open?

**The action is always fulfillment:** build the next list, build the next campaign. This is the bloodline; after deliverability it is the most important thing the audit protects.

## 2. Deliverability

**Workspace read first:** genuine reply rate (OOO/auto excluded), OOO rate, workspace bounce — against the sticks. Each stick gets its own band, mechanically. Healthy OOO or clean placement tests never override a genuine-reply error; they are evidence for the drill, and the drill's conclusion ("infra clean, the break is downstream") is a finding stated under the error verdict.

**Domain drill (the investigation):** per domain, min 500-1,000 sends on that domain:
1. **Bounce + reason split.** Sender bounce >= 80% = the accounts are fried: delete and replace. Hard bounces concentrated = data problem: pause the affected campaign and clean the list. Catch-all/public campaigns are judged on looser bounce bars; grading them like SMTP-verified kills good campaigns early.
2. **Per-domain genuine reply rate.** Under 1% while sibling domains are healthy = rest/kill that domain.
3. **Trend — only once signs fired.** A domain under 1% for 3-4 weeks, or 40% below the 30-day workspace average = aging infra: rest/kill. Prior daily audit logs are the history.
4. **Copy-vs-infra tiebreaker** when unclear: run the copy through a fresh-infra placement test. Lands clean = the problem is sending reputation, not the words.

**Output of the drill:** named domains to rest, kill, or replace — or "infra clean, the break is downstream."

## 3. List — gated: 5k+ sent AND deliverability clean

**Investigation, broken per campaign:**
1. Rank campaigns by positive rate against the workspace average; name the laggards.
2. **Pull the company ICP** (client's onboarding/assets). Check both alignments: is the **list** aligned with the ICP, and is the **copy** speaking to that ICP? A misalignment on either side is a finding.
3. **Profile the actual positives** — title, company size, vertical, segment. This is the ICP that demonstrably resonates; state it explicitly.
4. **Read the negative replies verbatim** and classify: "not relevant / wrong person" = ICP miss, resegment. "We already have / use X" = saturated segment, new vertical. Mixed noise = list probably fine, look downstream.
5. Data hygiene: times-contacted (over-mailed), list age and source, hard-bounce concentration by segment.

The investigation concludes in the Action Tree, with everything it learned attached as context.

## 4. Copy & Offer — gated: 10k+ sent AND deliverability + list clean

**This is about the quality of the copy and the offer, not errors in it.** Keep it simple: what gets replies works, what does not, does not.

1. Split genuine replies and positives **per campaign and per variant** against the workspace average. Above average = working. Below = not.
2. The action is deciding **what the next campaign is built from**: carry the best CTAs, angles, and copy forward; kill everything else.
3. Do not over-diagnose. No rewriting exercises inside a dying variant, no agonizing. Winners propagate, losers die.

## 5. Booking

**Stick:** booked / positives (labels are live in PlusVibe: meeting booked / completed / no-show, operator-maintained).

**Investigation — stays inside this skill:**
1. **Positives by CTA:** which CTA produces positives that book, and which produces positives that stall. A CTA can pull positive replies and book nothing — that is a leak, name it.
2. **Reply speed:** thread timestamps, time from the positive reply to our first response. Slow answers kill bookings.
3. **Slot mechanics:** were concrete times offered, how many, how many touches to booked.
4. **Aging:** interested-not-booked leads sitting unanswered or stalled, listed by name with days.

The analyzer diagnoses; fixing the threads is another session, another skill.

## 6. Show

**Stick:** completed / (completed + no-show).

**Investigation — stays inside this skill:**
1. No-shows by campaign and CTA origin.
2. **Booking gap:** days between booking and the call date; far-out bookings no-show more.
3. Pre-call protection audit: reminders, touches, and assets present in the thread or absent.
4. No-show recovery status per lead: recovered, in recovery, abandoned.

## The Action Tree

Every investigation concludes in one or more of **six actions**. There are not many actions — there is much context. The actions are deliberately big and generic; the analyzer reaches the right one on its own, from what the investigation found, and never from a pre-mapped use case. What makes the conclusion valuable is the **context paragraph** that rides every action: the why, the how, and the recommendations, grounded in the real numbers and names the investigation produced. This is the continuation of the measuring sticks: stick -> band -> investigation -> action, one mechanical tree.

1. **Build a lead list.** Concluded whenever the analysis finds that leads are the constraint or the loaded leads are not the right ones. The context paragraph states the direction and its evidence. Which list tool, which source, which build path is **not this skill's mission** — the handoff session owns that. Whenever the new list will not be identical to the current targeting, pair this action with **Write a new campaign**, because the existing copy will not surely fit it.
2. **Fix infrastructure.** Concluded from deliverability findings. The context names the domains and accounts, their numbers, and which sign fired.
3. **Pause and clean a list.** Concluded when the findings point at a data problem in loaded leads. The context names the campaign and segment, the numbers, and what clears it.
4. **Write a new campaign.** Concluded whenever the way forward is different copy going out — a fresh build, a switched CTA, or minor modifications; all three are this one action, and the context paragraph says which case it is, carrying the why, the how, the recommendations, and the winners to keep.
5. **Fix the offer.** The deep one. Concluded only when the investigation has ruled everything else out. The escalation is honest: tell the client where things stand and work out what else can be offered.
6. **Follow up harder.** Concluded when threads show too little pursuit — a judgment call made after investigation, always with the leads named.

## Closing discipline and boundary

Every audit closes in its band; every fired investigation closes in named findings and one or more Action Tree actions, each carried by its context paragraph (see the Next Steps block in the Output Interface). The analyzer concludes from the sending workspace's data and the client's vault logs **only** — it does not check lead tools, does not open external systems, and does not execute anything. The operator decides; the handoff session acts; the log closes the loop.
