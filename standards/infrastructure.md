# Infrastructure

The infrastructure is what a client's cold email is sent from: inboxes, and the domains they sit on.

An inbox provider creates the inbox on a domain we registered. The sender, the platform that runs campaigns, connects to it and sends through it. Everything below is a decision about those inboxes: how many a client holds, what each is set to, what gets flagged when one goes wrong, and what is corrected without asking.

## Where inboxes live

- every client has one workspace on the sender. All of that client's inboxes sit in it, and nothing else does
- we also keep one workspace of our own, the **pool**. It holds warmed inboxes that belong to no client and have never sent a cold email
- the sender lets us put **tags** on inboxes. A tag is a label; it groups inboxes so they can be picked by name. The tags we use are listed under Tags below

## Active and not active

- **active** is a tag. An inbox carrying the `active` tag is one the client's campaigns send from today
- **not active** is every inbox in the client's workspace without that tag: warming up, resting, or waiting as reserve
- an inbox is put into `active` or taken out of it only by the Operator (Shahar), never by a machine
- every running campaign sends from all of the client's active inboxes. A campaign that must not reach companies behind a secure email gateway is kept from them by its own sender setting, which the campaigns standard holds

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
- warmup is on, and never turns off, before or after the inbox starts sending
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

The signature lives on the inbox, and it is spun, so the close of an email changes from one send to the next.

- a campaign body calls it with `{{sender_signature}}` and never writes its own
- every inbox of one sender carries the same signature. A client whose inboxes send under more than one name has one signature per name
- the signature is not added to warmup emails

It is four lines, each one spin slot, `{{random|...|...}}`, with five options wherever five natural ones exist. Lines are separated by `<br>` in the stored signature.

- **sign-off:** `Thanks,` `Cheers,` `Best,` `Thanks for reading,` `Either way, thanks,`
- **name:** the sender's first name alone, or first and last. Written as text, never as the sender's name variables: a variable inside `{{random}}` has never run on our sender
- **identity:** the company written so it cannot become a link (`Acme(.)io`, never `Acme.io`, because a link in every email hurts delivery), the bare brand (`Acme`), or the company with the sender's title or background (`CRO, Acme(.)io`, `CRO at Acme`, `ex-Google, now building Acme`). A title or background goes in only when it is true of that sender and the Operator confirmed it. A sender name that came from the pool carries the company only
- **address:** the company's mailing address, one real address written five ways: as written, the street word shortened, the state spelled out, a comma dropped, the country added. Every option is still a complete address a letter would reach

Nothing else: no link, no phone, no image.

One sender, as stored:

```
{{random|Thanks,|Cheers,|Best,|Thanks for reading,|Either way, thanks,}}
{{random|Sam|Sam Levi}}
{{random|Acme(.)io|Acme|CRO, Acme(.)io|CRO at Acme|ex-Google, now building Acme}}
{{random|1 Main Street, Austin, TX 78701|1 Main St, Austin, TX 78701|1 Main Street, Austin, Texas 78701|1 Main St., Austin TX 78701|1 Main Street, Austin, TX 78701, USA}}
```

## Tags

- **`active`:** the inboxes sending today, as above
- **`{client}-{n}`:** the batch tag, such as `acme-3` for Acme's third batch. Kept for history
- **`English`, `Hebrew`:** only for a client whose campaigns are written in two languages. Each inbox carries exactly one
- **`internal`:** the one tag used on campaigns rather than inboxes, marking our own campaigns
- tag names are lowercase, except the language tags
- two tags holding exactly the same inboxes are one too many: one is deleted

## Flags

A flag is a line in the Inbox Manager's report naming a domain and the problem. It never kills, never moves an inbox, never buys; the Operator reads it and decides. Every domain is checked, active or not, with its inboxes counted together.

A reply always means a reply from a person. Out-of-office and other automatic replies never count.

- **Disconnected:** the sender cannot connect to one of the domain's inboxes
- **Drift:** one of the domain's inboxes is off one of these settings:
  - daily limit
  - minutes between sends
  - sending ramp on, its start and its daily step
  - warmup on
  - warmup daily, its start and its daily step
  - warmup reply rate
  - warmup randomize on, and its share
  - warmup weekday only off
  - warmup on the tracking domain off
  - signature not added to warmup
  - no custom tracking domain
  - no reply-to
  - a signature present, whose company name is not written as a live domain
- **Warmup:** the sender's warmup score (0 to 100) is under 90, and the domain's oldest inbox is more than 21 days old
- **Never landed:** 0 replies in the domain's first 500 cold emails
- **Gone quiet:** once the domain has sent 750 cold emails, its latest 250 got fewer than half the replies of the 250 before them. At 750 sends that is sends 500 to 750 against sends 250 to 500; after that the two latest batches of 250 are compared each time
- **Reserve short:** the client's not active capacity is under 50% of its active capacity

## The daily and weekly read

**Every day:**
- Disconnected, Drift, Warmup and Reserve short are read for every client
- an **emergency** is an active inbox still disconnected after its reconnect try
- emergencies are reported the same morning; a day with no emergency is reported to no one

**Every Monday:**
- every flag is read, Never landed and Gone quiet included
- every client gets the full report: active and not active inboxes and capacity, reserve, and every flag. A flag with no domains under it still appears, as none

**To the client:**
- only for a client the Operator has switched on
- the client gets the day's emergencies and the Monday report, in client wording: counts, dates and what we are doing. Never other clients, the pool, providers, costs or flag names
- every client message is a draft, sent only when the Operator approves it

## Corrected without asking

The Inbox Manager corrects these by itself, every day, and every correction is one line in its report:

- an inbox off a setting in the Drift list is set back to standard, inside its jitter range, and read back. The custom tracking domain is the exception: the sender cannot clear it, so it is only reported
- warmup switched off is switched back on
- a disconnected inbox gets one reconnect try, and its status is read back. Still disconnected afterwards, it is flagged; on an active inbox it is an emergency
- every running campaign's sender list is set to the client's active inboxes, and read back

Nothing else changes without the Operator.

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

The sender is the record of the infrastructure. Domains and inboxes are never mirrored into the Hub: every flag is judged from the sender on the run it is reported, and nothing per domain or inbox is kept between runs. The Hub holds only, on each client row, as of the last read: active and not active inboxes, active and not active capacity, and the reserve ratio.

```json
{
  "capacity": {
    "reserve_ratio_min": 0.5,
    "inboxes_per_domain": { "google": 2, "microsoft": 49 }
  },
  "new_inbox": { "warmup_days_before_cold": 14 },
  "signature": {
    "lives_on": "inbox",
    "body_calls": "{{sender_signature}}",
    "one_per_sender_name": true,
    "in_warmup": false,
    "slots": ["sign_off", "name", "identity", "address"],
    "options_per_slot": 5,
    "sign_off": ["Thanks,", "Cheers,", "Best,", "Thanks for reading,", "Either way, thanks,"],
    "name_as_variable": false,
    "identity": ["company written unlinkable", "bare brand", "company with title or background, only if true and Operator-confirmed"],
    "pool_sender": "company only, no title or background",
    "address": "one real address written five ways, every option deliverable",
    "extras": "none"
  },
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
      "reply_to": "",
      "signature_present": true,
      "signature_live_domain": false
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
    "batch": "{client}-{n}",
    "languages": ["English", "Hebrew"],
    "internal_campaign": "internal"
  },
  "replies": "people only, never automatic replies",
  "flags": {
    "disconnected": { "status_in": ["ERROR", "ALERT"] },
    "drift": "any setting in settings, outside its jitter range",
    "warmup": { "score_below": 90, "oldest_inbox_days_over": 21 },
    "never_landed": { "first_sends": 500, "replies": 0 },
    "gone_quiet": { "from_sends": 750, "batch": 250, "below_share_of_previous": 0.5 },
    "reserve_short": { "reserve_ratio_below": 0.5 }
  },
  "read": {
    "daily": ["disconnected", "drift", "warmup", "reserve_short"],
    "monday": ["disconnected", "drift", "warmup", "reserve_short", "never_landed", "gone_quiet"],
    "emergency": "an active inbox still disconnected after its reconnect try",
    "quiet_day": "nothing is posted",
    "client": { "opt_in": true, "gets": ["emergencies", "monday"], "every_message_a_draft": true }
  },
  "corrected_without_asking": {
    "drift": "set back to standard inside jitter, except the custom tracking domain",
    "warmup_off": "switched back on",
    "disconnected": "one reconnect try, status read back",
    "campaign_senders": "every running campaign's senders are the client's active inboxes"
  }
}
```
