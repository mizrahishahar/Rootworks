Teaches: the tag standard that names the sending pools, the SURBL check behind the gateway pool, and why tags describe the fleet while campaigns still carry their own sender lists.

# Inbox management

Inboxes are the sending fleet. Tags are how we **describe** that fleet: which inboxes are live, which are clean, which wave they came from. They are the map, and the map is a standard.

They are not the wiring. A campaign holds its own explicit list of accounts, and no tag operation changes it (see below). So the tags are what you read to decide, and the campaign sender lists are what you write to act. Keeping the two in agreement is the job.

## The tag standard

A tag names a pool with a meaning. The first three nest inside each other; the language tags cut across them:

| Tag                                | Meaning                                                                         | Relation                       |
| ---------------------------------- | ------------------------------------------------------------------------------- | ------------------------------ |
| `active`                           | The current live sender pool. Every production campaign's full set              | the root pool                  |
| `gateway`                          | The deliverability-clean subset that gateway campaigns send from                | strict subset of `active`      |
| `{clientname}-{x}` (e.g. `dave-2`) | Rotation label: which provisioning wave an inbox came from, numbered per client, kept for history and rotation moves | subsets of `active` or retired |
| `English` / `Hebrew` | **Only when a client sends in more than one language.** The language an inbox sends in. An inbox belongs to exactly one | crosses `active`, does not nest in it |
| `internal` | The one sanctioned **campaign** label, for campaigns that are ours rather than a client's. Carries no inboxes | not a sender pool |

Names are lowercase, always: `dave-1`, not `Dave-1`. The language tags are the exception and stay capitalised, as language names.

**The language convention, in full.** Most clients never need it and must not have it. Reach for it only when the client's copy is genuinely written in two languages, because then an inbox cannot serve both: the signature, the sender name and the reply handling are all language-bound. Adelante is the live case, 40 `English` and 6 `Hebrew`. When it applies:

- The two tags **partition the workspace**: every inbox carries exactly one, none carries both, and together they account for all of them.
- They cross `active` instead of nesting inside it. `active ∩ English` is the English sending pool; `active ∩ Hebrew` is the Hebrew one. Neither language tag is itself a statement about whether an inbox is live.
- Language is not geography. A market is not a language: `UK` and `US` are not this convention, they are the mistake below.

**What is never allowed is a second name for a set that already has one.** Adelante's `UK` held exactly the same 40 inboxes as `adelante-2`, so the workspace carried three names for two ideas and stopped being readable. If a proposed tag would have identical membership to an existing one, it is not a new dimension, it is a synonym. Delete it.

Rules that keep it coherent:

- Every subset stays a subset: an inbox leaving `active` leaves `gateway` in the same move.
- A rotation is a tag reassignment **plus** a hand-rewrite of every live campaign's sender list. The tags alone do nothing (see below).
- Retired or single-purpose tags are deleted, not left around; a tag with no meaning attracts wrong attachments.
- One namespace, two jobs, so never let a campaign label look like a sender pool. `internal` is the only campaign label we keep.
- Tag names mean the same thing in every workspace. The convention travels; the members are per client.

## Tags never move senders. Campaigns hold their own list.

**Tested directly on 2026-08-23 and settled: a campaign's sender list is an explicit set of accounts, and no tag operation changes it.** An inbox was unassigned from Adelante's `UK` tag while 18 live campaigns carried that tag; every one of them kept all 40 accounts, the unassigned inbox included. Emptying `UK` to zero members changed nothing either.

So read `camp_count` on a tag correctly: it is how many campaigns **wear the tag as a label**, not how many draw their senders from it. A tag with `camp_count: 18` still drives nothing.

What this means in practice:

- Tag work is **safe** around live sends. Create, rename, reassign, empty, delete: no campaign loses or gains a sender.
- Tag work is also **inert**. A rotation is not done when the tags are right. Every live campaign's sender list must be rewritten by hand, one at a time, and read back.
- Do not trust an inbox's `cmps` array as a campaign membership record; it goes stale and reads empty for accounts that are demonstrably in four live campaigns.

Rewriting a campaign's senders: `set_campaign_email_accounts` **merges, it never replaces**, so removals go one at a time through `remove_campaign_email_account`, then `get_campaign_email_accounts` to confirm the exact set.

**The failure this prevents.** Dave.io rotated on 2026-08-17: tags were reassigned correctly, and five of six live campaigns were repointed by hand. The sixth was missed and kept sending from the rested `dave-1` wave. Nobody noticed because the tags looked right. When you rotate, the proof is the campaign read-back, never the tag counts.

## SURBL, and the gateway pool

**What SURBL is:** a DNS-based reputation blocklist of domains that have appeared in spam. Mail receivers query it during filtering; when a sending domain (or a domain in the body's links) is listed, deliverability drops hard regardless of how healthy the inbox itself looks. Listing happens to a DOMAIN, not an inbox, so one listed domain taints every inbox on it.

**How to check:** query DNS for `{domain}.multi.surbl.org`. No record (NXDOMAIN) = clean; an A record resolving (127.0.0.x) = listed, and the last octet encodes which internal list. `127.0.0.64` is ABUSE and is what our domains come back as. Check the SENDING domain of every inbox in the fleet; a spot-check is not an audit, the whole fleet is checked in one pass. The whole estate is only ~130 unique domains (inbox counts are much larger; domains are what SURBL lists), so a full pass takes one command:

```bash
for d in domain-a.com domain-b.com; do r=$(host -t A "$d.multi.surbl.org" 2>&1); case "$r" in *"has address"*) echo "LISTED  $d  ${r##* }";; *) echo "clean   $d";; esac; done
```

**Always run controls in the same pass.** A resolver that is being refused by SURBL can answer positively for everything, and a wall of identical hits looks exactly like a real mass listing. `surbl-org-permanent-test-point.com` must come back listed (127.0.0.254) and `google.com` / `microsoft.com` must come back clean. If the controls are wrong, the results are worthless.

**A clearance tag is not a gateway pool.** Piper's `info-ok` marks .info inboxes that earned a genuine reply and were cleared for reuse. Every single one of its domains is SURBL-listed. Reputation-with-us and reputation-with-receivers are different axes; never map one onto the other.

**Where the fleet stood on 2026-08-23** (clean domains within each client's `active`): Dave.io 7 of 20 · Adelante 2 of 23 · Piper AI 4 of 20 · Move PLNR 3 of 7. Adelante's entire English sending pool, all 20 `adelante-2` domains, is listed. Treat this as the baseline to re-measure against, not as a fact that stays true.

**What the result governs:** the `gateway` tag holds only inboxes whose domains came back clean. When a check turns up a newly listed domain, its inboxes leave `gateway` (and the gateway campaigns' sender lists with it); when a domain delists or new clean domains arrive, they can join. The gateway pool is a living output of the last check, never a fixed roster.

## The API traps specific to this work

- **`set_campaign_email_accounts` merges; it does not replace.** A "swap" through it leaves the old accounts attached. Real removals go through `remove_campaign_email_account`, then a read-back.
- **`update_email_account` is a full overwrite, not a patch.** Any field omitted is wiped: it has erased a signature, a last name, and all tags in one call. Never use it for a partial edit; `bulk_assign_tags` is the safe path for tag work.
- **Rampup fields do not persist while slow-rampup is off.** `rampup_daily_limit` / `rampup_daily_inc` are ignored by the API when `is_slow_rampup` is no; mismatched values there are cosmetic, not a defect to fix.
- Inbox limits, warmup, and health read through `list_email_accounts` / `check_email_account_health` / `get_warmup_stats`; the campaign daily limit stays high on purpose, the inbox is where limits live (see the deployment standard).
