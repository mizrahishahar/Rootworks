Teaches: the MCP surface by job, and the lessons already paid for.

# The MCP, and the lessons

## Actions (MCP)

| Job | Tools |
|---|---|
| Read a campaign | `list_campaigns(campaign_id)` for config AND the full sequences with live spintax; `get_campaign_variations` for per-step variation stats (no bodies); `get_campaign_detailed_stats` / `get_analytics_stats` for numbers; `get_campaign_emails` for sent mail |
| Build / edit | `create_campaign` (draft), `patch_campaign_update` (sequences + accounts), `set_campaign_schedule`, `launch_campaign`, `pause_campaign` |
| Leads | `add_leads_to_campaign` with `skip_if_in_workspace:true`; `update_lead_variables` to backfill a variable on existing leads. Bulk loads go through the Deploy automation, never hand uploads |
| Inbox | `get_emails`, `reply_to_email`, `save_email_as_draft` |

## Gotchas, paid for

- `patch_campaign_update` requires `first_wait_time` whenever sequences or accounts are sent (`0` for a normal parent).
- Sequence `wait_time` is in DAYS, not minutes. Body must be HTML. Schedule day keys are 1-7 (Mon=1), only active days as `true`.
- Custom variables store with a `custom_` prefix: upload `site_detail`, reference `{{custom_site_detail}}`, or it renders blank.
- `is_overwrite:true` has no skip guard and re-contacts excluded leads; on a backfill, `leads_uploaded` should be ~0.
- **Variants are not locked tracks.** Each step draws its variation independently (a lead can get 1B then 2A), so a real angle test needs one campaign per angle, never A/B variants inside one.
- The sender does not dedup across campaigns: the same person in two campaigns is mailed twice. `ws_last_sent_at` reads null on a freshly loaded lead, so it is never a dedup check.
- `{{sender_signature}}` renders the inbox's signature field, blank if empty.
- Hebrew ships wrapped in a `dir='rtl'` container. The reply editor scrambles Hebrew (no RTL control): save Hebrew replies as `dir=rtl` drafts for the Operator to review and send.
- Open counts mean nothing unless the campaign had open tracking on, and scanners inflate them even then.
- The unibox lead list is workspace-wide by default; filter by campaign or a lead read can belong to a different campaign than assumed.
- Read-backs are the only proof: the API returns success while silently dropping accounts that no longer exist.
- On any MCP error, stop and ask the Operator to refresh; never retry in a loop.
- **The stringified-args fault, and how to read it.** The MCP transport intermittently stringifies every non-string argument, so `patch_campaign_update` rejects `sequences` ("expected array, received string") and `first_wait_time` ("expected number, received string"). Reads with string-only args keep working the whole time, which makes the connection look healthy. Cheapest probe: `list_campaigns` with `limit` as a number; if it comes back "expected number, received string", every write that carries an array or a number is dead. An Operator refresh clears it. It clears per server, not globally: PlusVibe came back while Airtable stayed broken in the same minute, and Airtable's version of the failure reads `Input validation error` (local, pre-dispatch) rather than `MCP error -32602` (server-side).
- **Never edit a sequence body in the PlusVibe UI's source view.** `ctrl+a` does not select inside that code area; the typed text is appended to the existing body instead of replacing it. The character counter is the tell (952 → 1917). Undo does not reverse it. Nothing reaches the server until "Save All", so the escape is to close the tab and discard the unsaved state. Copy edits belong in `patch_campaign_update` with the full sequences array, always.
- **The gateway fence has a native switch: `send_seg_email` (SEG = Secure Email Gateway).** It reads back on the campaign object, 1 = send to gateway-protected domains, 0 = skip them. Adelante's UK campaigns run it at 0 and hold 1.1-1.2% lifetime bounce. **It is NOT settable through the MCP**: it is absent from `patch_campaign_update`, `create_campaign` and `update_workspace_settings`, and passing it to `patch_campaign_update` anyway returns `{"status":"success"}` while silently dropping it. UI only. Read the flag on every campaign before launch; a new campaign defaults to 1.
- **Turning the fence on destroys no leads.** `send_seg_email: 0` skips gateway leads at send time; they stay enrolled. So the skip is measurable for free after the first run as `lead_count` minus `lead_contacted_count`, which is the cheapest way to size gateway exposure when the list table carries no MX column.
- **A contacts table can carry `MX Provider` and have it empty on every row**, which makes the deploy-view gateway fence unbuildable without anyone noticing. `USA DTC - Contacts` had it blank across all 29,177. Prove a field is present-but-empty rather than absent by filtering `isNotEmpty` on it: an absent column errors with "Unknown column name or id", an empty one returns 0 cleanly.
- **Two markets on one inbox pool starve each other by CLOCK ORDER, not by campaign.** PlusVibe already round-robins fairly between campaigns sharing a pool: three UK campaigns on the same 40 inboxes split a saturated day 350 / 353 / 292. What starves a market is that its window opens later. Adelante's UK campaigns ran 07:00-14:00 Europe/London (02:00-09:00 ET) against US campaigns on 07:00-10:00 + 15:00-18:00 ET, so UK had a five-hour head start and seven hours to drain the pool's whole 1,000/day before US opened. Diagnose by comparing windows in one converted timezone, never by campaign order.
- **The window length is the throttle, and it is the only one that self-reallocates.** Max throughput is `inboxes × (window minutes ÷ sending_gap)`. At 40 inboxes on an 8-minute gap: 60 min ≈ 300 sends, 90 ≈ 450, 120 ≈ 600. Above the crossover (here ~7 hours) the mailbox daily limit binds instead and the window stops governing anything. Shrinking the window rations a shared pool WITHOUT per-campaign daily limits, which matters because a per-campaign limit is a static allocation: when one campaign ends its slice dies with it and nobody picks it up. A window is shared by every campaign in that market, so a campaign ending frees its share to its siblings the same day. Never raise inbox daily limits to buy capacity; the inbox limit is the rest mechanism.
- **There is no hourly send breakdown in the MCP.** `get_campaign_detailed_stats` is daily granularity. To calibrate a window, read `email_sent_today` off the campaign object (`list_campaigns`) at the window close: it is a live running counter, per campaign.
- **Check the per-domain cap before activating.** A contacts-table deploy routinely lands several people from one company in the same campaign (3 at one domain, 2 at another, in a single build). `is_max_lead_domain_per_day` defaults to 0, so they can all be mailed the same morning. Stop-on-reply does not save you: it only fires after someone replies. Set `is_max_lead_domain_per_day: "yes"` and `max_lead_domain_per_day: 1` as part of the pre-launch check.
