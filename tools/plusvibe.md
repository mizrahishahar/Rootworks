---
channel: email
type: sender
---

# PlusVibe

The email sender. One workspace per client; the workspace id lives on the client's registry row.

## Actions (MCP)

- **Read a campaign:** `list_campaigns(campaign_id)` for config, `get_campaign_variations` for the live copy, `get_campaign_detailed_stats` / `get_analytics_stats` for numbers, `get_campaign_emails` for sent mail.
- **Build / edit:** `create_campaign` (draft), `patch_campaign_update` (sequences + accounts), `set_campaign_schedule`, `launch_campaign`, `pause_campaign`.
- **Leads:** `add_leads_to_campaign` with `skip_if_in_workspace:true`; backfill a variable on existing leads with `update_lead_variables`. Bulk lead loads go through the Deploy automation, not hand uploads.
- **Inbox:** `get_emails`, `reply_to_email`, `save_email_as_draft`.

## Gotchas, paid for

- `patch_campaign_update` requires `first_wait_time` whenever you send sequences or accounts (`0` for a normal parent).
- Sequence `wait_time` is in DAYS, not minutes. Body must be HTML. Schedule day keys are 1-7 (Mon=1), only active days as `true`.
- Custom variables store with a `custom_` prefix: upload `site_detail`, reference `{{custom_site_detail}}`, or it renders blank.
- `is_overwrite:true` has no skip guard and re-contacts excluded leads; on a backfill, `leads_uploaded` should be ~0.
- **Variants are not locked tracks.** Each step draws its variation independently (a lead can get 1B then 2A), so a real angle test needs one campaign per angle, never A/B variants.
- The sender does not dedup across campaigns: the same person in two campaigns is mailed twice. `ws_last_sent_at` reads null on a freshly loaded lead, so it is never a dedup check.
- `{{sender_signature}}` renders the inbox's signature field, blank if empty.
- The reply editor scrambles Hebrew (no RTL control): save Hebrew replies as `dir=rtl` drafts for the Operator to review and send.
- Read-backs are the only proof: the API returns success while silently dropping accounts that no longer exist.
- On any MCP error, stop and ask the Operator to refresh; never retry in a loop.
