---
channel: linkedin
type: sender
owner: Claude
vertical: shared
---

# HeyReach

LinkedIn sender for classic connection-plus-message sequences, run from a pool of rep profiles.

## Actions (MCP)
- **Deploy:** `create_campaign` or `create_campaign_from_template`, `update_campaign_sequence`, `update_campaign_accounts` (the sending profiles), `update_campaign_schedule`, `add_leads_to_campaign_v2`, `start_campaign`.
- **Add leads:** `add_leads_to_campaign_v2` / `add_leads_to_list_v2`.
- **Stats:** `get_campaign`, `get_overall_stats`.
- **Manage:** `pause_campaign`, `resume_campaign`, `stop_lead_in_campaign`.

## To know
- No company concept: same-company suppression is an n8n sweep, not native.
- A blank connection request is safest and converts best; a personalized note raises risk.
- A reply on any channel stops the lead; `stop_lead_in_campaign` is how the DNC cascade reaches it here.
