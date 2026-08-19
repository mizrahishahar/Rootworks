Teaches: the tag standard that governs which inboxes send on which campaigns, the SURBL check behind the gateway pool, and how pools rotate without breaking live sends.

# Inbox management

Inboxes are the sending fleet. Which of them send on which campaign is never a hand-picked list; it is governed by tags, and the tags are a standard.

## The tag standard

Campaigns attach inboxes **only by tag membership**. A tag names a pool with a meaning, and the pools nest:

| Tag                                | Meaning                                                                         | Relation                       |
| ---------------------------------- | ------------------------------------------------------------------------------- | ------------------------------ |
| `active`                           | The current live sender pool. Every production campaign's full set              | the root pool                  |
| `gateway`                          | The deliverability-clean subset that gateway campaigns send from                | strict subset of `active`      |
| `{clientname}-{x}` (e.g. `dave-2`) | Rotation label: which provisioning wave an inbox came from, numbered per client, kept for history and rotation moves | subsets of `active` or retired |

Rules that keep it coherent:

- Every subset stays a subset: an inbox leaving `active` leaves `gateway` and every campaign in the same move.
- A rotation (resting a wave, bringing in a new one) is a tag reassignment on the inboxes, and the campaigns' sender lists must then reflect the new tag membership, verified by values.
- Retired or single-purpose tags are deleted, not left around; a tag with no meaning attracts wrong attachments.
- Tag names mean the same thing in every workspace. The convention travels; the members are per client.

## Propagating a tag change to live campaigns

Campaign-to-tag binding is a real platform feature, but it lives **in the UI only**; no MCP tool binds a campaign to a tag. Until a campaign is bound there by the Operator, tag changes propagate by hand:

1. Change the tags (`bulk_assign_tags` / `create_tag` / `delete_tag`; `delete_tag` itself updates affected campaigns' account lists).
2. Update each affected campaign's sender list to match the new tag membership.
3. **Verify by values:** `get_campaign_email_accounts` per campaign against `list_tags` counts. Success responses prove nothing here either.

A tag change that skips step 2 leaves resting inboxes silently still sending; that exact state has existed live and is the reason this file exists.

## SURBL, and the gateway pool

**What SURBL is:** a DNS-based reputation blocklist of domains that have appeared in spam. Mail receivers query it during filtering; when a sending domain (or a domain in the body's links) is listed, deliverability drops hard regardless of how healthy the inbox itself looks. Listing happens to a DOMAIN, not an inbox, so one listed domain taints every inbox on it.

**How to check:** query DNS for `{domain}.multi.surbl.org`. No record (NXDOMAIN) = clean; an A record resolving (127.0.0.x) = listed, and the last octet encodes which internal list. Check the SENDING domain of every inbox in the fleet; a spot-check is not an audit, the whole fleet is checked in one pass.

**What the result governs:** the `gateway` tag holds only inboxes whose domains came back clean. When a check turns up a newly listed domain, its inboxes leave `gateway` (and the gateway campaigns' sender lists with it); when a domain delists or new clean domains arrive, they can join. The gateway pool is a living output of the last check, never a fixed roster.

## The API traps specific to this work

- **`set_campaign_email_accounts` merges; it does not replace.** A "swap" through it leaves the old accounts attached. Real removals go through `remove_campaign_email_account`, then a read-back.
- **`update_email_account` is a full overwrite, not a patch.** Any field omitted is wiped: it has erased a signature, a last name, and all tags in one call. Never use it for a partial edit; `bulk_assign_tags` is the safe path for tag work.
- **Rampup fields do not persist while slow-rampup is off.** `rampup_daily_limit` / `rampup_daily_inc` are ignored by the API when `is_slow_rampup` is no; mismatched values there are cosmetic, not a defect to fix.
- Inbox limits, warmup, and health read through `list_email_accounts` / `check_email_account_health` / `get_warmup_stats`; the campaign daily limit stays high on purpose, the inbox is where limits live (see the deployment standard).
