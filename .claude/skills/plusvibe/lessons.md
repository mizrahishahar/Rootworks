Teaches: the MCP surface by job, and every PlusVibe trap already paid for.

# The MCP, and the lessons

## The surface, by job

| Job | Tools |
|---|---|
| Read a campaign | `list_campaigns(campaign_id)` for config and the full sequences with live spintax; `get_campaign_variations` for per-step variation stats; `get_campaign_detailed_stats` / `get_analytics_stats` for numbers by date; `get_campaign_emails` for sent mail |
| Build / edit | `create_campaign` (draft), `patch_campaign_update` (sequences, accounts, the advanced schedule, the flags), `launch_campaign`, `pause_campaign` |
| Leads | `add_leads_to_campaign` with `skip_if_in_workspace:true`; `update_lead_variables` to backfill a variable. Bulk loads go through the Deploy, never a hand upload |
| Inbox | `get_email_threads(workspace_id, lead)`, `reply_to_email`, `save_email_as_draft` |
| Accounts | `list_email_accounts`, `bulk_update_email_accounts`, `bulk_assign_tags`, `check_email_account_health`, `get_warmup_stats` |

## Campaign traps

- `patch_campaign_update` requires `first_wait_time` whenever sequences or accounts are sent (`0` for a normal parent).
- Sequence `wait_time` is in DAYS, not minutes. Body must be HTML. Schedule day keys are 1-7 (Mon=1), only active days as `true`.
- `create_campaign` takes `camp_name`, not `name`.
- Spintax is `{{random|option one|option two|option three}}`, and it works in the subject line as well as the body (Operator confirmed 2026-09-14). Not `{a|b}`.
- Custom variables store with a `custom_` prefix: upload `site_detail`, reference `{{custom_site_detail}}`, or it renders blank.
- `{{sender_signature}}` renders the inbox's signature field, blank if empty.
- `is_overwrite:true` has no skip guard and re-contacts excluded leads; on a backfill, `leads_uploaded` should be ~0.
- **Variants are not locked tracks.** Each step draws its variation independently (a lead can get 1B then 2A).
- The sender does not dedup across campaigns: the same person in two campaigns is mailed twice. `ws_last_sent_at` reads null on a freshly loaded lead, never a dedup check.
- **`unsub_blocklist` resets to 0 on any `patch_campaign_update` that omits it.** *1 Sep 2026.* Re-send `"yes"` on the last patch of a build and confirm it in the read-back. Flag params on patch are the strings "yes"/"no", not 1/0; `use_adv_schedule` on patch is a real boolean.
- **`unsub_blocklist: "yes"` sent in the same patch as `sequences` is dropped.** *14 Sep 2026, Dave.io SOC 2 drafts:* one full build patch carried it and read back 0 on both campaigns; a second patch carrying only `unsub_blocklist: "yes"` read back 1. Send it alone, as the last patch of the build, and read it back.
- **The advanced schedule lands only through `patch_campaign_update`**: `use_adv_schedule: true` and `adv_schedule: {timezone, daily_limit, daily_limit_new_lead, windows: {Monday: [{from,to}], ...}}`, key `timezone` not `tz`, both limits required, weekday names. `set_campaign_schedule` accepts the same keys and silently drops them.
- **`send_seg_email` (the gateway fence, 1 = send to gateway-protected domains, 0 = skip) lands through `patch_campaign_update` as the string "no"/"yes".** *14 Sep 2026, Adelante:* patched "no", read back 0. Earlier it was dropped by every write tool; the MCP now carries it. A new campaign still defaults to 1. Read it on every campaign before launch.
- Turning the fence on destroys no leads: skipped leads stay enrolled, so gateway exposure reads for free as `lead_count` minus `lead_contacted_count`.
- `is_max_lead_domain_per_day` defaults to 0; a contacts-table deploy lands several people from one company in one morning without it.
- **A COMPLETED campaign does not start again when leads land in it.** *12 Sep 2026, Adelante: 74 leads sat uncontacted after completion.* The PlusVibe deploy door activates it after an upload; a hand upload into a COMPLETED campaign must be followed by `launch_campaign`.
- **Never edit a sequence body in the UI's source view.** `ctrl+a` does not select inside it; typed text is appended, undo does not reverse it. Close the tab and discard. Copy edits go through `patch_campaign_update` with the full sequences array.
- Open counts mean nothing unless tracking was on, and scanners inflate them even then.
- There is no hourly send breakdown. `get_campaign_detailed_stats` is daily; `email_sent_today` on the campaign object is the live counter.
- **Two markets on one inbox pool starve each other by clock order.** PlusVibe round-robins fairly between campaigns on a pool; what starves a market is a window that opens later. Compare windows in one converted timezone, never by campaign order.
- **The window length is the only throttle that self-reallocates.** Throughput is inboxes × (window minutes ÷ sending gap). A per-campaign daily limit is a static slice that dies with the campaign; a window is shared by every campaign in it. Never raise inbox daily limits to buy capacity.

## Inbox and thread traps

- Hebrew ships wrapped in a `dir='rtl'` container. The reply editor scrambles Hebrew: save Hebrew replies as `dir=rtl` drafts for the Operator to send.
- The unibox lead list is workspace-wide by default; filter by campaign or a lead read belongs to a different campaign than assumed.
- `reply_to_email` requires `reply_to_id`, `subject`, `from` (the thread's eaccount), `to`, and an HTML `body`. Read the thread back and find the returned message id; that is the proof.
- **A thread whose sending inbox was deleted cannot be replied to.** *14 Sep 2026, Move PLNR:* `reply_to_email` answers "Email Account has been deleted" for every thread on a retired persona domain (moveplnrteam.com, moveplnrpro.com and the rest of the old fleet). Before drafting into an old thread, `list_email_accounts(email=<the thread's eaccount>)`; an empty answer means the thread is dead. The move is `compose_new_email` with the lead's `lead_id` and `camp_id`, from the SAME persona name on the live fleet (sarahjohnson.c@hellomoveplnr.com for Sarah), subject "Re: <original>", so the reader sees the same person from a new address. A fleet rotation orphans every open conversation this way; the inbox queue should be swept the day it happens.

## Account and tag traps

- **Tags never move senders.** *23 Aug 2026.* A campaign's sender list is an explicit set of accounts and no tag operation changes it; `camp_count` on a tag is how many campaigns wear it as a label. Tag work is safe around live sends and inert: after any `active` change, every live campaign's sender list is rewritten and read back (`allocate_inboxes_by_tag` does this per client per tag and returns the diff). Do not trust an inbox's `cmps` array; it goes stale.
- **`set_campaign_email_accounts` merges; it does not replace.** Removals go one at a time through `remove_campaign_email_account`, then `get_campaign_email_accounts`. Accounts in ERROR reject campaign edits with "Email not found"; reconnect first.
- **`update_email_account` is a full overwrite.** Any omitted field is wiped: it has erased a signature, a last name and all tags in one call. `bulk_update_email_accounts` and `bulk_assign_tags` are the safe paths.
- `warmup_reply_rate` on the bulk update is a fraction 0 to 1; send 0.35, the account reads back 35. Rampup fields do not persist while slow-rampup is off.
- **`custom_domain` (the tracking domain) cannot be cleared by the API.** A provider export writes it on import; only the UI removes it.
- Deleted accounts come back with their old ids, tags and campaign memberships when a provider re-exports them, into whichever workspace the provider integration is bound to. Read back after every import.
- `bulk_reconnect_email_accounts` holds only while the provider side is paid and live. *6 Sep 2026:* forty reconnects flipped to ACTIVE and fell back to ERROR within a minute.
- `move_email_accounts_to_workspace` works within one organisation and carries tags across as foreign ids; unassign the source workspace's tags before moving back.
- **An inactive workspace refuses every call, reads and moves out included.** *15 Sep 2026, CaaB:* Flowroots X Piper AI was deactivated to free a slot for the new CaaB workspace while CaaB's 60 inboxes still sat in it; the move and even `list_tags` answered "Workspace is inactive. Operation not allowed." Move every inbox out before a workspace is deactivated.
- **Nothing on the platform tells you where mail landed.** No placement field, no dashboard. `7d_overall_warmup_health` is a blended, undocumented score. Every check is a proxy on one axis.
- `total_reply_count` on the email-stats endpoint already excludes OOO; subtracting `total_ooo_reply_count` again goes negative. *6 Sep 2026.*

## Transport traps

- **The stringified-args fault.** The MCP transport intermittently stringifies every non-string argument: `patch_campaign_update` rejects `sequences` ("expected array, received string"), `first_wait_time` ("expected number"). Reads with string-only args keep working, so the connection looks healthy. Probe: `list_campaigns` with `limit` as a number. An Operator refresh clears it, per server, not globally.
- **PlusVibe is not the MCP server named `emailbison`.** *1 Sep 2026.* That is a different EmailBison instance holding only DuoDiv; it silently ignores `workspace_id` and `search`. The real PlusVibe MCP is the one whose `get_workspaces` returns shahar@flowroots.com with the `Flowroots X {client}` workspaces. Probe with `get_workspaces` first.

## Fleet checks

- **SURBL is checked by DNS, the whole fleet in one pass.** `dig +noall +answer @8.8.8.8 a.com.multi.surbl.org b.com.multi.surbl.org surbl-org-permanent-test-point.com.multi.surbl.org google.com.multi.surbl.org`. No record is clean; `127.0.0.x` is listed.
- **Run the controls in the same pass.** The test point must come back listed (`127.0.0.254`) and google.com clean. A refused resolver can answer listed for everything.
- **Query 8.8.8.8 or 9.9.9.9, never the default resolver.** *25 Aug 2026.* The machine's own resolver and 1.1.1.1 fail SURBL, and the failure reads as clean.
- **A clearance tag is not a gateway pool.** A tag marking inboxes that earned replies says nothing about SURBL; Piper's `info-ok` domains were all listed.
- **`updated_at` on an account is not a status history.** *10 Sep 2026.* It moves on any edit. The API carries no error text and no error date; the time an account went to ERROR is read from when its campaigns stopped sending.
- **`update_email_account` resets every field you do not send.** Paid for 2026-09-14 on Dave.io: an update carrying only the required fields plus a new signature wiped the inbox's tags and switched slow ramp off, while returning success. Every call sends the inbox's full current state (tags, `is_slow_rampup` with `rampup_daily_limit` and `rampup_daily_inc`, last name, signature) read from `list_email_accounts` immediately before the call, never from an earlier dump, and the read-back diffs every field, not just the one you meant to change. Never `apply_all_sign: yes` unless every inbox on that domain should get the same signature.
- **To set a campaign sender list exactly, use `patch_campaign_update` with `email_accounts` (account ids).** It replaces the list. Paid for 2026-09-14 on Dave.io: `set_campaign_email_accounts` only appends despite saying it overwrites, and `remove_campaign_email_account` returns 404 "Email not found" for an inbox that was deleted, so deleted inboxes stay stuck on a campaign until the list is patched. Read back with `get_campaign_email_accounts`.
- **Blank lines around the signature come from wrappers, not from the words.** Paid for 2026-09-14 on Dave.io, checked on real sent emails with `get_campaign_emails`: `<p>&nbsp;</p>` spacers around `<p>{{sender_signature}}</p>` rendered four empty lines before the signature and three before the P.S.; removing the spacers still left three on each side, because the inbox signature is stored as a `<div>` and the body wrapped it in a `<p>`, and plain-text sending turns each block edge into line breaks. Every body paragraph is its own `<p>` (one blank line apart, verified); `{{sender_signature}}` sits bare between the last `</p>` and the P.S. `<p>`, with no spacer and no wrapper. Verified on 4 real sends across both Dave Sept 1 campaigns and both senders: exactly one blank line before the signature and before the P.S. Still check the first send after any body change.
