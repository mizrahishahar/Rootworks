# Infrastructure

The infrastructure is what a client's cold email is sent from: inboxes, and the domains they sit on.

An inbox provider creates the inbox on a domain we registered. The sender, the platform that runs campaigns, connects to it and sends through it. Everything below is a decision about those inboxes: how many a client holds, what each is set to, and what gets flagged when one goes wrong.

## Where inboxes live

- every client has one workspace on the sender. All of that client's inboxes sit in it, and nothing else does
- we also keep one workspace of our own, the **pool**. It holds warmed inboxes that belong to no client and have never sent a cold email
- the sender lets us put **tags** on inboxes. A tag is a label; it groups inboxes so they can be picked by name. The tags we use are listed under Tags below

## Active and not active

- **active** is a tag. An inbox carrying the `active` tag is one the client's campaigns send from today
- **not active** is every inbox in the client's workspace without that tag: warming up, resting, or waiting as reserve
- an inbox is put into `active` only by the Operator (Shahar), never by a machine

## Capacity

- an inbox's **daily limit** is how many cold emails it may send in a day
- a client's **capacity** is the sum of the daily limits of its inboxes. Active capacity counts active inboxes; not active capacity counts the rest
- capacity is counted in inboxes, never in domains, so a client can mix Google Workspace and Microsoft inboxes
- **reserve:** not active capacity is at least 50% of active capacity. A client whose first inboxes are still warming up is exempt
- short on reserve means new inboxes are ordered that week, because a new inbox needs 14 days before it can send
- a Google Workspace domain holds 2 inboxes
- a Microsoft domain holds 49 inboxes

## Batches and allocation

- a **batch** is one group of inboxes that arrived together, bought at once or moved from the pool at once
- an inbox given to a client stays that client's until it is killed. It is never moved to another client
- when active inboxes are lost, they are replaced from the client's own not active inboxes first, then from the pool, then by buying new ones
- the pool is only for that middle case: a client who has to replace active inboxes today and has no not active ones ready
- inboxes taken from the pool keep the same mix of domain endings (.com, .io and so on) the pool holds, so the pool keeps its shape
- an inbox taken from the pool keeps its sender name. Only the signature changes, to the new client's

## A new inbox

- it warms up for 14 days before its first cold email
- SPF, DKIM and DMARC, the three DNS records that prove the domain may send, pass before it is tagged `active`
- it gets its batch tag the day it arrives
- it is set to every setting below in one pass, and the settings are read back from the sender to confirm they landed

## Settings

**Warmup** is the sender trading ordinary-looking emails between inboxes, opening and replying to them, so the providers learn to trust the inbox. The **sending ramp** starts a new inbox below its daily limit and raises it each day. **Randomize** varies the warmup volume day to day.

Google Workspace inboxes:
- daily limit 25
- 13 minutes between sends
- sending ramp on: starts at 5 a day, plus 5 a day
- warmup 25 emails a day, starting at 5, plus 3 a day
- warmup reply rate 35%
- warmup randomize on, 30%

Microsoft inboxes:
- daily limit 3
- 60 minutes between sends
- sending ramp on: starts at 1 a day, plus 1 a day
- warmup 8 emails a day, starting at 1, plus 1 a day
- warmup reply rate 90%
- warmup randomize on, 30%

Every inbox:
- warmup never turns off, before or after the inbox starts sending
- warmup runs every day, weekends included
- the signature is not added to warmup emails
- no custom tracking domain, and warmup does not warm one
- no reply-to address

## Jitter

Inboxes with identical settings look like a fleet to the providers. So within a batch every inbox gets slightly different numbers, and no two inboxes on one domain share the same ones. A value anywhere inside its range counts as in standard.

Google Workspace:
- 11 to 15 minutes between sends
- sending ramp starts at 4 to 6
- warmup 20 to 30 a day
- warmup reply rate 30 to 40%
- randomize 25 to 40%

Microsoft:
- warmup 7 to 9 a day
- warmup reply rate 88 to 92%
- randomize 25 to 40%

## Signature

Every inbox of a client carries the same signature:

- `Thanks,`
- the sender's first and last name, as the sender's name variables, so one signature fits every inbox
- the company name, written so it cannot become a link: `Acme(.)io`, never `Acme.io`, because a link in every email hurts delivery
- the company's mailing address

No job title.

## Tags

- **`active`:** the inboxes sending today, as above
- **`gateway`:** the client's inboxes whose domain is clean on SURBL, a public blocklist of domains seen in spam. Some companies filter mail through a secure email gateway that checks that list, so campaigns aimed at them send only from inboxes tagged both `active` and `gateway`. The tag is recalculated every week and never set by hand
- **`{client}-{n}`:** the batch tag, such as `acme-3` for Acme's third batch. Kept for history
- **`English`, `Hebrew`:** only for a client whose campaigns are written in two languages. Each inbox carries exactly one
- **`internal`:** the one tag used on campaigns rather than inboxes, marking our own campaigns
- tag names are lowercase, except the language tags
- two tags holding exactly the same inboxes are one too many: one is deleted
- a campaign keeps its own list of inboxes to send from, and tags do not change that list. When `active` changes, every running campaign's list is rewritten to match

## Flags

Once a week, and whenever asked, the Inbox Manager machine reads every client's inboxes and posts a report. A flag is a line in that report naming a domain and the problem. It never changes anything; the Operator reads it and decides.

Every domain is checked, active or not, with its inboxes counted together.

- **Never landed:** 0 replies from people in the domain's first 500 cold emails
- **Gone quiet:** 0 replies from people in the domain's last 500 cold emails
- **Warmup:** the sender's warmup score (0 to 100) is under 90, and the domain's oldest inbox is more than 21 days old
- **Listed:** the domain is on SURBL. This only decides the `gateway` tag
- **Disconnected:** the sender cannot connect to one of the domain's inboxes
- **Drift:** any setting on this page is off

Out-of-office and automatic replies are not replies from people. A flag with no domains under it still appears in the report, as none.

## Kills

To kill a domain is to stop using it for good.

- only the Operator kills, and only a domain that was flagged
- before its inboxes are deleted, each one forwards to a live inbox of the same client, so late replies are not lost
- a killed domain stays registered, so no one else can buy it
- a killed domain never comes back

## Domains

- a sending domain is never the client's real domain, so the real one is never at risk
- it follows the pattern and ending of the client's other sending domains
- a domain is connected to an inbox provider only when the Operator names the provider and says go

## The record

The Hub, our Airtable database, holds the infrastructure as of the last weekly read:

- one row per domain: its batch, whether it is active, its flags with the numbers behind them, and the day it was killed
- one row per inbox: which settings are off
- on each client row: active and not active inboxes, active and not active capacity, and the reserve ratio

```json
{
  "capacity": {
    "reserve_ratio_min": 0.5,
    "inboxes_per_domain": { "google": 2, "microsoft": 49 }
  },
  "new_inbox": { "warmup_days_before_cold": 14 },
  "settings": {
    "google": {
      "daily_limit": 25,
      "sending_gap_min": 13,
      "sending_ramp": { "on": true, "start": 5, "increment": 5 },
      "warmup": { "daily": 25, "ramp_start": 5, "increment": 3, "reply_rate": 35, "randomize": 30 }
    },
    "microsoft": {
      "daily_limit": 3,
      "sending_gap_min": 60,
      "sending_ramp": { "on": true, "start": 1, "increment": 1 },
      "warmup": { "daily": 8, "ramp_start": 1, "increment": 1, "reply_rate": 90, "randomize": 30 }
    },
    "every": {
      "warmup_on": true,
      "weekday_only": false,
      "warm_tracking_domain": false,
      "signature_in_warmup": false,
      "custom_tracking_domain": "",
      "reply_to": ""
    }
  },
  "jitter": {
    "google": {
      "sending_gap_min": [11, 15],
      "sending_ramp_start": [4, 6],
      "warmup_daily": [20, 30],
      "warmup_reply_rate": [30, 40],
      "warmup_randomize": [25, 40]
    },
    "microsoft": {
      "warmup_daily": [7, 9],
      "warmup_reply_rate": [88, 92],
      "warmup_randomize": [25, 40]
    }
  },
  "tags": {
    "active": "active",
    "gateway": "gateway",
    "batch": "{client}-{n}",
    "languages": ["English", "Hebrew"],
    "internal_campaign": "internal"
  },
  "flags": {
    "never_landed": { "window": "first", "sends": 500, "human_replies": 0 },
    "gone_quiet": { "window": "last", "sends": 500, "human_replies": 0 },
    "warmup": { "score_below": 90, "oldest_inbox_days_over": 21 },
    "listed": { "list": "multi.surbl.org" },
    "disconnected": { "status_not": "ACTIVE" },
    "drift": "any setting outside settings and jitter"
  }
}
```
