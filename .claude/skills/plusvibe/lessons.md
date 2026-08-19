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
