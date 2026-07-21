---
channel: email
type: sender
owner: Claude
vertical:
  - analysis
  - inbox-management
  - infrastructure
---

# PlusVibe

The default email sender. Deploy is clone-based (no true duplicate): read a source campaign's config, create a draft, patch the sequence and accounts, set the schedule, add the leads, launch.

## Actions (MCP)
- **Deploy:** `list_campaigns(campaign_id)` to read a source config, `create_campaign` (draft), `patch_campaign_update` (sequences + accounts), `set_campaign_schedule`, `add_leads_to_campaign`, `launch_campaign`.
- **Add leads:** `add_leads_to_campaign` with `skip_if_in_workspace:true`; to backfill a field on existing leads use `update_lead_variables`.
- **Stats:** `get_campaign_detailed_stats`, `get_analytics_stats`, `get_campaign_emails`.
- **Manage:** `pause_campaign`, `patch_campaign_update`.

## Gotchas
- `patch_campaign_update` requires `first_wait_time` whenever you send sequences or accounts (`0` for a normal parent).
- Sequence `wait_time` is in DAYS, not minutes.
- Body must be HTML. Schedule day keys are 1-7 (Mon=1), only active days as `true`.
- Custom variables store with a `custom_` prefix: upload `site_detail`, reference `{{custom_site_detail}}`, or it renders blank.
- `is_overwrite:true` has no skip guard and re-contacts excluded leads; on a backfill `leads_uploaded` should be ~0.
- `{{sender_signature}}` renders the inbox's signature field, blank if empty.
- Spintax `{{random|a|b}}` varies function words only, never the offer, proof, or CTA.
- On any MCP error, stop and ask the Operator to refresh; never retry in a loop.
