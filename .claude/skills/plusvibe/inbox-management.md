Teaches: the tag standard that names the sending pools, the SURBL check behind the gateway pool, why tags describe the fleet while campaigns still carry their own sender lists, and the API traps. The rules for capacity, provisioning, flags and kills live in the `inbox-management` skill; this file is the platform mechanics it runs on.

# Inbox management on PlusVibe

Inboxes are the sending fleet. Tags are how we **describe** that fleet: which inboxes are live, which are clean, which batch they came from. They are the map, and the map is a standard.

They are not the wiring. A campaign holds its own explicit list of accounts, and no tag operation changes it (see below). So the tags are what you read to decide, and the campaign sender lists are what you write to act. Keeping the two in agreement is the job, and the MCP tool `allocate_inboxes_by_tag` does it.

## The tag standard

A tag names a pool with a meaning:

| Tag                                | Meaning                                                                         | Relation                       |
| ---------------------------------- | ------------------------------------------------------------------------------- | ------------------------------ |
| `active`                           | What sends right now. Every production campaign's full set              | the root pool                  |
| `gateway`                          | The SURBL-clean set of the client's domains, active or not. Gateway campaigns send from `active ∩ gateway` | crosses `active` |
| `{clientname}-{x}` (e.g. `dave-2`) | Batch label: which purchase or allocation an inbox came from, numbered per client, kept for history | subsets of the workspace |
| `English` / `Hebrew` | **Only when a client sends in more than one language.** The language an inbox sends in. An inbox belongs to exactly one | crosses `active`, does not nest in it |
| `internal` | The one sanctioned **campaign** label, for campaigns that are ours rather than a client's. Carries no inboxes | not a sender pool |

Names are lowercase, always: `dave-1`, not `Dave-1`. The language tags are the exception and stay capitalised, as language names.

**The language convention, in full.** Most clients never need it and must not have it. Reach for it only when the client's copy is genuinely written in two languages, because then an inbox cannot serve both: the signature, the sender name and the reply handling are all language-bound. Adelante is the live case, 40 `English` and 6 `Hebrew`. When it applies:

- The two tags **partition the workspace**: every inbox carries exactly one, none carries both, and together they account for all of them.
- They cross `active` instead of nesting inside it. `active ∩ English` is the English sending pool; `active ∩ Hebrew` is the Hebrew one. Neither language tag is itself a statement about whether an inbox is live.
- Language is not geography. A market is not a language: `UK` and `US` are not this convention, they are the mistake below.

**What is never allowed is a second name for a set that already has one.** Adelante's `UK` held exactly the same 40 inboxes as `adelante-2`, so the workspace carried three names for two ideas and stopped being readable. If a proposed tag would have identical membership to an existing one, it is not a new dimension, it is a synonym. Delete it.

Rules that keep it coherent:

- A change to `active` is a tag move **plus** a rewrite of every live campaign's sender list, through `allocate_inboxes_by_tag`. The tags alone do nothing (see below).
- `gateway` is re-derived by the health report from SURBL every week; it is never edited by hand.
- Retired or single-purpose tags are deleted, not left around; a tag with no meaning attracts wrong attachments.
- One namespace, two jobs, so never let a campaign label look like a sender pool. `internal` is the only campaign label we keep.
- Tag names mean the same thing in every workspace. The convention travels; the members are per client.
- The tag description on the platform is the living log of the last change: what moved, when, why.

## Tags never move senders. Campaigns hold their own list.

**Tested directly on 2026-08-23 and settled: a campaign's sender list is an explicit set of accounts, and no tag operation changes it.** An inbox was unassigned from Adelante's `UK` tag while 18 live campaigns carried that tag; every one of them kept all 40 accounts, the unassigned inbox included. Emptying `UK` to zero members changed nothing either.

So read `camp_count` on a tag correctly: it is how many campaigns **wear the tag as a label**, not how many draw their senders from it. A tag with `camp_count: 18` still drives nothing.

What this means in practice:

- Tag work is **safe** around live sends. Create, rename, reassign, empty, delete: no campaign loses or gains a sender.
- Tag work is also **inert**. A change is not done when the tags are right. Every live campaign's sender list must be rewritten and read back. `allocate_inboxes_by_tag` does exactly that for one tag on one client and returns the diff.
- Do not trust an inbox's `cmps` array as a campaign membership record; it goes stale and reads empty for accounts that are demonstrably in four live campaigns.

Rewriting a campaign's senders by hand: `set_campaign_email_accounts` **merges, it never replaces** (confirmed again 2026-09-06), so removals go one at a time through `remove_campaign_email_account`, then `get_campaign_email_accounts` to confirm the exact set. Accounts in status ERROR reject campaign edits with "Email not found"; reconnect first.

**The failure this prevents.** Dave.io rotated on 2026-08-17: tags were reassigned correctly, and five of six live campaigns were repointed by hand. The sixth was missed and kept sending from the rested `dave-1` wave. Nobody noticed because the tags looked right. When you move tags, the proof is the campaign read-back, never the tag counts.

## What the platform can and cannot tell you

**Nothing tells you where the mail landed.** There is no placement score, no API field, no dashboard that separates the inbox from the promotions tab from spam. Every check available to us, SURBL included, is a narrow proxy on one axis. `7d_overall_warmup_health` is PlusVibe's blended warmup score and PlusVibe does not document what it computes; we use it as the warmup flag threshold because on Dave's fleet it separated the collapsed domains from the working ones, not because we know what it measures.

The practices that are ours to hold, always:

- Limits live on the inbox, never the campaign, and the inbox limit is the rest mechanism. Never raise it to buy capacity; shorten or lengthen the sending window instead.
- Warmup stays on. Ramp slowly and leave it alone.
- One lead per domain per day (`is_max_lead_domain_per_day`), stop on reply at the domain, unsubscribes straight to the blocklist.
- The gateway fence (`send_seg_email: 0`) on, and gateway campaigns sending only from clean domains.
- Two markets never share a pool without their windows compared in one converted timezone.

**Replies are the signal, not bounces.** A bounce only catches the crude failures; a domain can bounce at zero and still be filed to spam on every send. The only thing that proves mail reached a human is a human answering. So the per-domain read is genuine replies over sends, per domain, both mailboxes together. Counting rules:

- **OOO and auto-replies are not replies.** Neither are unsubscribe requests fired by a filter. `total_reply_count` on the email-stats endpoint already excludes OOO (measured 2026-09-06 on rundaveio.com: 2 replies, 10 OOO, `reply_rate` 0.5 vs `reply_rate_with_ooo` 3). Never subtract `total_ooo_reply_count` from it; that goes negative.
- Replies are unique people, not messages.
- A rate without its volume is noise. 500 sends is the floor before a domain says anything.
- Opens never drive a verdict: unmeasured unless tracking was on, inflated by scanners even then.

The flags that turn these numbers into a weekly read, and what happens after, are the `inbox-management` skill. Nothing here decides a kill.

## SURBL, and the gateway pool

One narrow check on one axis, cheap and binary. It catches a real and fatal condition, and it is worth running on the whole fleet; it is not a deliverability verdict.

**What SURBL is:** a DNS-based reputation blocklist of domains that have appeared in spam. Mail receivers query it during filtering; when a sending domain (or a domain in the body's links) is listed, deliverability drops hard regardless of how healthy the inbox itself looks. Listing happens to a DOMAIN, not an inbox, so one listed domain taints every inbox on it.

**How to check:** query DNS for `{domain}.multi.surbl.org`. No record (NXDOMAIN) = clean; an A record resolving (127.0.0.x) = listed, and the last octet encodes which internal list. `127.0.0.64` is ABUSE and is what our domains come back as. Check the SENDING domain of every inbox in the fleet; a spot-check is not an audit, the whole fleet is checked in one pass. One `dig +noall +answer` call takes many names at once:

```bash
dig +noall +answer @8.8.8.8 domain-a.com.multi.surbl.org domain-b.com.multi.surbl.org surbl-org-permanent-test-point.com.multi.surbl.org google.com.multi.surbl.org
```

**Always run controls in the same pass.** A resolver that is being refused by SURBL can answer positively for everything, and a wall of identical hits looks exactly like a real mass listing. `surbl-org-permanent-test-point.com` must come back listed (127.0.0.254) and `google.com` / `microsoft.com` must come back clean. If the controls are wrong, the results are worthless.

**Query 8.8.8.8 explicitly; the default resolver lies in the dangerous direction.** Measured 2026-08-25: the machine's own resolver and 1.1.1.1 both fail SURBL, and the failure reads as **clean**, not as an error. 8.8.8.8 and 9.9.9.9 answer correctly; 1.1.1.1 returns SERVFAIL. The health report uses Google's DNS-over-HTTPS endpoint for the same reason.

**A clearance tag is not a gateway pool.** Piper's `info-ok` marks .info inboxes that earned a genuine reply and were cleared for reuse. Every single one of its domains is SURBL-listed. Reputation-with-us and reputation-with-receivers are different axes; never map one onto the other.

**A listing is not a burn.** Adelante's whole English pool is listed and produces. Dave's placement test A scored listed domains higher than clean ones. The listing governs `gateway` membership only.

**Where the fleet stood on 2026-09-06** (clean domains): Dave.io 7 of 15 kept · Adelante 2 of 23 · Piper AI 4 of 20 · Move PLNR 3 of 7. Treat this as the baseline to re-measure against, not as a fact that stays true; the health report re-measures every Monday.

## The API traps specific to this work

- **`set_campaign_email_accounts` merges; it does not replace.** A "swap" through it leaves the old accounts attached. Real removals go through `remove_campaign_email_account`, then a read-back.
- **`update_email_account` is a full overwrite, not a patch.** Any field omitted is wiped: it has erased a signature, a last name, and all tags in one call. Never use it for a partial edit; `bulk_update_email_accounts` and `bulk_assign_tags` are the safe paths.
- **Rampup fields do not persist while slow-rampup is off.** `rampup_daily_limit` / `rampup_daily_inc` are ignored by the API when `is_slow_rampup` is no; mismatched values there are cosmetic, not a defect to fix.
- **`custom_domain` (the tracking domain) cannot be cleared by the API.** No update call carries it. A provider export writes it on import; only the UI removes it.
- **Deleted accounts come back with their old ids, tags and campaign memberships** when a provider re-exports them, and they land in whichever workspace the provider's integration is bound to, not the one they left. Read back after every import.
- **`bulk_reconnect_email_accounts` holds only when the provider side is paid and live.** On 2026-09-06 forty reconnects flipped to ACTIVE and fell back to ERROR within a minute because the provider had suspended the accounts for a failed renewal. Fix the provider first, reconnect second.
- **`move_email_accounts_to_workspace`** works within one organisation and carries tags across as foreign ids. Unassign the source workspace's tags before moving back.
- Inbox limits, warmup, and health read through `list_email_accounts` / `check_email_account_health` / `get_warmup_stats`; the campaign daily limit stays high on purpose, the inbox is where limits live (see the deployment standard).
