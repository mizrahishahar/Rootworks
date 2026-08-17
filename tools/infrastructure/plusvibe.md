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
- **A unibox reply comes back with no text.** `get_emails` returns the message with `body: null` and an empty `content_preview` for anything sent by hand from the unibox. The message is real and it was delivered; only its text is missing from the API. Do not read that as an empty or failed send.
- **The body lands on the Prospect row, not in PlusVibe.** The 12-hourly sync writes the full text into `Conversation Thread` on the Hub record. When an outbound looks blank in the API, re-read the record: that is where what was actually said appears, often a few hours later. Read the record before concluding a thread is unreadable.
- **A unibox reply is not a sequence step.** `get_campaign_emails` lists only sequence sends, so an outbound present in `get_emails` but absent there was sent by hand. That is the signal that a human (usually the client, in their own workspace) is working the thread alongside us.
- Spintax `{{random|a|b}}` varies function words only, never the offer, proof, or CTA.
- On any MCP error, stop and ask the Operator to refresh; never retry in a loop.
