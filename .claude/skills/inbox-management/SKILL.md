---
name: inbox-management
description: Owns the sending fleet for every client. Capacity, provisioning, warmup, allocation, the weekly health report and its flags, the kill procedure, domains and providers. Use for any question or action on inboxes, domains, warmup, capacity or a client's sending infrastructure. Calls the plusvibe skill for the platform mechanics.
---

# Inbox management

The fleet is a client's mailboxes and domains. This skill says how much of it a client needs, how a mailbox is set up, how the fleet is watched, and what happens when a domain stops landing. The sender platform is an instrument: `plusvibe/inbox-management.md` holds the tag standard, the SURBL procedure and the API traps, and this skill points there instead of repeating them.

Written 2026-09-06 out of the Dave.io recovery: 60 mailboxes, 40 disconnected, 0.24% reply, no rules. Every rule below was used that day.

## Definitions

| Term | Meaning |
|---|---|
| `active` | Mailboxes sending right now: the ones carrying the `active` tag |
| Not active | Every other mailbox in the client's workspace: allocated, warming, in no campaign |
| Capacity | The sum of the mailboxes' own daily limits. Provider-agnostic: a Google mailbox carries 25, a Microsoft one 3, the sum is the number |
| Batch | One purchase or allocation, tagged `{client}-{n}` in order |
| Pool | The Flowroots workspace: warmed mailboxes with zero cold sends |
| Siblings | A client's other `active` domains, sending the same campaigns in the same window |

## Capacity

1. Not active capacity is at least 50% of active capacity, always, outside onboarding. Below it the health report says how many mailboxes short.
2. Capacity is counted in mailboxes and their daily limits, never in domains. A client can mix providers.
3. Provider rates: Google 25 cold a day per mailbox, 2 mailboxes per domain. Microsoft 3 cold a day per mailbox, 49 mailboxes per domain.
4. Short on reserve = buy the next batch that week. Warmup is 14 days, so the order goes the week the gap appears.
5. When kills push `active` down, the campaign sends less. Nothing killed comes back. Refill comes from the client's own not-active mailboxes, then the pool, then a purchase.
6. Leads are the scarce resource, not sends. Not sending beats sending on a flagged domain.

## Allocation

7. A mailbox is allocated to one client once. It stays in that client's workspace until killed. Never reassigned.
8. The pool is emergency only: used when a client cannot fill `active` from their own batches at that moment. Everything else is bought.
9. Pool allocation follows the pool's own TLD split, so the pool keeps its shape.
10. Pool mailboxes move with their identity. No renaming. The signature carries the client, the name stays the mailbox's.
11. Every allocation is a batch: workspace move, `{client}-{n}` tag, the provisioning standard applied, read back. `active` only when Shahar puts it there.
12. Tags move no senders. After any `active` change, run the MCP tool `allocate_inboxes_by_tag` for that client and `active`, and read the diff.

## Provisioning standard

Mailboxes always exist on the sender platform already; the provider creates them. Init is: move to the client workspace if needed, apply the standard in one bulk update, tag the batch, check SPF DKIM DMARC, read back, diff.

| Setting | Google | Microsoft |
|---|---|---|
| Cold a day per mailbox | 25 | 3 |
| Sending gap | 13 min | 60 min |
| Sending ramp | On. Starts at 5, +5 a day, 25 on day 5 | On, +1 a day |
| Warmup before the first cold send | 14 days | 14 days |
| Warmup daily | 25 | 8 |
| Warmup ramp | Starts at 5, +3 a day | Starts at 1, +1 a day |
| Warmup reply rate | 35% | 90% |
| Warmup randomize | On, 30% | On, 30% |
| Warmup after launch | Never off | Never off |
| Weekday only | Off | Off |
| Warm the tracking domain | Off | Off |
| Signature in warmup | Off | Off |
| Custom tracking domain | Empty | Empty |
| Reply-to | Empty | Empty |
| Signature | The standard below | The standard below |
| Tags at creation | `{client}-{n}` | `{client}-{n}` |
| SPF, DKIM, DMARC | Green before `active` | Green before `active` |

Sources: InboxKit warmup guide and Inboxing guidelines, compared 2026-09-06. The Microsoft numbers are Inboxing's until we own them.

**Randomize everything that can be randomized.** Identical settings across a fleet are a fingerprint. Per mailbox within a batch, jitter: warmup daily 20 to 30, warmup reply rate 30 to 40%, randomize 25 to 40%, sending gap 11 to 15 min, ramp start 4 to 6. Two mailboxes on one domain never share the exact same numbers. The health report's drift check allows these ranges.

**What the API sets and what it does not.** Daily limit, gap, ramps, every warmup field, signature, reply-to and tags go through one bulk update. The custom tracking domain cannot be cleared by the API; a provider export writes it on every import, and only the platform UI removes it. Never use the single-account update for a partial edit, it overwrites the whole account (see the PlusVibe traps).

### The signature

One shape for every mailbox on a client:

```
Thanks,
{{sender_first_name}} {{sender_last_name}}
Dave(.)io
251 Little Falls Drive, Wilmington, DE 19808
```

- Name variables only, so the one signature fits every identity in the fleet. No role line.
- The company line is never a live domain. `Dave.io` renders as a clickable link, which puts a link in every cold email. Write it with the dot broken, `Dave(.)io`.
- The address stays.

### Copy variation

Belongs to the copywriter, stated here because it is an infrastructure cause. Google fingerprints repeated text and refuses to send it, which shows up as a bounce spike on a validated list. Floor per campaign: 20 subject line variants, 20 unsubscribe line variants, signature variation, 3 to 4 body versions with spintax every few words. Google needs it more than Outlook.

## The health report and its flags

Nothing is killed by a rule. Rules flag, Shahar decides. The machine **Create health report for inboxes** runs Monday 07:00 and on demand, reads the sender platform directly, computes per domain with both mailboxes together, writes the Hub, re-derives `gateway`, posts to #flowroots-pulse, then calls `allocate_inboxes_by_tag` for `gateway`.

| Flag | Fires when |
|---|---|
| Never landed | 0 human replies on the domain's first 500 sends |
| Gone quiet | 0 human replies on the domain's last 500 sends |
| Warmup | Warmup score under 90 and oldest mailbox over 21 days |
| Listed | SURBL hit. Governs `gateway` only, not a kill signal |
| Disconnected | Any mailbox not ACTIVE on the platform, whatever the provider cause |
| Drift | Any setting off the provisioning standard, the tracking domain included |

Flags are checked on active and not active alike. Human replies are the platform's `total_reply_count`, which already excludes OOO (measured 2026-09-06: subtracting OOO again went negative). Positives are too rare per domain to judge on. Sibling drop-offs are not a flag: the Dave case had 8 domains that passed every rule at one eleventh of their siblings' rate, and that read is the one a human makes on the flag list.

The report, per client, pool last: active mailboxes and capacity, not active mailboxes and capacity, reserve ratio with OK or the shortfall, then every flag type with its domains, each domain line saying active or not active and the number behind it. Emojis on the three headings only. A flag type with nothing under it prints "none", so a missing check is never silent.

## Reading a bounce

A bounce count says nothing. The bounce reason says everything.

| Reason text | Source | Meaning |
|---|---|---|
| User unknown, address does not exist | List | Verification failed |
| Rejected, blocked, reputation, blocklist, looks like spam, from the receiving server | Domain reputation | Past spam placement and into refusal. The message lands nowhere |
| Our own provider refuses to send, suspicious content, sending limits | Copy or volume | Sender bounce. The fix is variation, not a domain |

Reputation shows in two stages: spam placement first, silent, replies fade and only siblings reveal it; refusal second, loud, bounces with a reason that names reputation. Read the reason before touching a domain.

## The kill

Only after Shahar says kill, on a flagged domain. Done in session with the platform and provider tools.

1. Forwarding first. Every mailbox on the domain forwards to a live mailbox of the same client that the sender platform watches, so a late reply lands in the unibox. Read back before anything else.
2. Out of `active` and `gateway`. Out of every campaign, per address, read back per campaign. The set call merges, removal is per address, and the platform refuses campaign edits on accounts in ERROR.
3. Delete from the sender platform.
4. Cancel the mailboxes at the provider at next renewal. Keep the domain registered: a lapsed client-named domain gets drop-caught.
5. Hub Domains row: Killed On set. Killed is final.

A killed domain's month is sunk. Sending on it to recover the money breaks rule 6 and is never done.

## Domains and providers

- Inbox providers are a commodity. We switch them as we need. No domain is bound to a provider, no nameserver set, no mailbox ordered, no export run, no warmup subscription added without a named provider and an explicit go.
- Domains are bought at Porkbun through the Porkbun MCP. The account holds credit first; the API pays from balance only. Availability: one check per 10 seconds, or the Verisign registry directly for bulk. Registration: one per second, fifty a day.
- Nameservers for our domains are set through the Porkbun MCP, on instruction, to whichever provider was named.
- Domain names follow the client's existing pattern and TLD. Sending domains are never the client's real domain.
- Provider mechanics, wallets, renewals, exports, live with the provider and are not this standard's concern. What the standard sees is the result: a mailbox connected or in ERROR.
- A provider's sequencer integration is bound to one platform workspace. Before any export, check which. Dave's landed in Piper's on 2026-09-06.

## Tags and SURBL

- Tags: `active`, `gateway`, `{client}-{n}`, `English` and `Hebrew` for two-language clients only. `gateway` is the SURBL-clean set of the client's domains, active or not. The standard, the synonym rule and the proof that tags never move senders are in `plusvibe/inbox-management.md`. Tag descriptions on the platform are the living log of the last change.
- SURBL: the procedure, the resolver trap and the controls are in the same file. A listing governs `gateway` membership. It does not mean burned.

## Where the standard lives

| Standard | Hub | Machine |
|---|---|---|
| Active, not active, capacity, reserve | Clients: Active Mailboxes, Active Capacity, Not Active Mailboxes, Not Active Capacity, Reserve Ratio, Last Inbox Review | Create health report for inboxes |
| Batches, flags, kills | Domains: Batch, Active, First 500 Replies, Last 500 Replies, Warmup Min, Oldest Inbox Days, SURBL, Flags, Flag Reason, Flagged On, Killed On, Last Reviewed | Create health report for inboxes |
| Provisioning, drift | Inboxes: Drift | Create health report for inboxes |
| Report | | Slack, #flowroots-pulse, Monday |
| Tags to campaigns | | MCP tool `allocate_inboxes_by_tag`, called by the report for `gateway`, by this skill for `active` |

The daily PlusVibe sync stays as it is. The health report is its own machine and reads the platform directly.
