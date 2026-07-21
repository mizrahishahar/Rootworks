---
channel: email+linkedin
type: sender
owner: Claude
vertical:
  - analysis
  - inbox-management
  - infrastructure
---

# Alta

AI-SDR sequencer, LinkedIn-first with intent email on the side. Katie writes, Luna critiques. For us Alta is a **sequencer and inbox**, not a sourcing tool: leads arrive from Trigify through n8n, Alta runs its own 18-provider waterfall enrichment and the touchpoint sequence. Driven by Claude through the Alta MCP; fed by n8n through the REST API.

## Access
- **Claude:** the Alta MCP - `list_*` / `get_*` / `search_prospects` to read, `send_*` to reply, `assign_tags`, `*_communication_opt_outs`, the campaign-build chain, `pause_*` / `resume_*`, and `ask_alta_agent` for account data.
- **n8n:** REST at `https://api.altahq.com/v1`, header `Authorization: Bearer <token>` (Alta -> Account Settings -> Generate Token). Ingestion is **Path A**: add prospects to a campaign by ID, one automation switching the ID per segment. Read live IDs with `list_campaigns`.

## Campaign anatomy
Built in a fixed order: Audience, Pitch, Touchpoints, Preferences, Launch. The source locks at draft; an active campaign is relaunched, not re-sourced. For us the Audience is the n8n feed, so build evergreen campaigns that accept a by-ID push.

## Deploy (MCP)
The builder chain, in order:
- `search_prospects(filters)` - preview an audience and its count (job title, seniority, department, industry, size, revenue, domain, location).
- `create_draft_campaign(campaignName)` - returns `campaignId` + builder URL.
- `build_campaign_pitch(campaignId, pitchBrief)` - drafts the pitch from what the client sells, enriched with site/Compass context.
- `preview_campaign_workflow(campaignId, channels, instructions)` - streams the sequence. **Does not persist; follow with `update_campaign({workflow})` the same turn or it is lost.**
- `match_campaign_rep(campaignId, repName)` - bind the Katie sender.
- `launch_campaign_builder(campaignId)` - mark ready, then launch.
- **Touchpoints:** view-profile / like-post warm-ups, connection request (blank note), LinkedIn message (gated on acceptance), voice note (post-connection only), email/SMS/WhatsApp, AI/custom conditions to branch.
- **Copy form:** templated (the exact message) or personalized (a Role / Context / Task / Format / Constraints prompt Katie writes from; sliders set tone and length, never the prompt).
- **Run mode:** Co-Pilot (approve each touch) to validate, then Auto-Pilot.
- **Evergreen:** turn on **skip prospects already in campaigns**. A completed campaign will not accept a feed - `resume_campaign` first.

## Analysis (MCP)
`get_campaign` returns metadata only. Numbers come two ways:
- **`ask_alta_agent(task)`** - queries the account CRM / Postgres / Snowflake. The stats call: ask the quantitative question directly, e.g. "campaign <id>, last 14 days: requests sent, accepted, replied, positive, booked."
- **Walk it** - `list_prospects(campaignId)` for volume in, `list_linkedin_messages` / `list_email_messages` (`type: received`) and `list_calls` for outcomes, `get_prospect` for state.
Feeds the `linkedin-analyzer` cascade (send pulse -> account health -> audience -> copy -> booking/show). Account health is read per rep (see Infrastructure). A social-signal campaign should out-reply cold two to three times; if it reads like cold the signal is stale or the opener did not lead with their context.

## Inbox management (MCP)
- **Queue:** `list_linkedin_messages(type: received, unread: true)` and `list_email_messages` for new replies; filter by campaign or rep.
- **Read:** `get_prospect` + `get_person` for the dossier (role, company, signal), the `list_*_messages` for the full exchange.
- **Reply:** `send_linkedin_message(prospectId, body)` (max 2000 chars) or `send_email_message(prospectId, emailMessageIdToReplyTo, body)` as a threaded reply. Draft-and-ask before every send.
- **Book:** Calendly is wired to the rep - real slots only, never a link, no invented duration (inbox-manager rules).
- **Housekeeping:** `assign_tags(entityId, entityType: emailThread|linkedinConversation)` to label; `pause_prospect` / `resume_prospect` to hold or release a lead.
- **Hebrew:** the editor scrambles RTL - save/format `dir=rtl` and let the Operator send.

## DNC, the three-way (MCP + native)
The decision logic lives in the n8n automation; these are the Alta actions per branch:
- **Said no / unsubscribed** -> `add_communication_opt_outs([{identifier, identifierType: email|linkedin|phone|domain}], pauseActiveProspects: true)`. Domain-level kills the whole company; the opt-out is global, so Alta suppresses across every campaign. Do not add.
- **In a live conversation / booked** -> do not touch; ping the Operator in Slack. Detect via `search_prospects` + `list_*_messages` on the Alta side and Close for the cross-channel truth. `assign_tags` for a visual flag.
- **Nobody talking** -> add to the segment's campaign (Path A, by ID). Alta enriches and sequences.
`list_communication_opt_outs` reads the list (search by email/linkedin/domain). Belt-and-suspenders: skip-already-in-campaign on every campaign.

## Infrastructure (MCP)
- **Reps** are the Katie senders, each a LinkedIn account plus provisioned inboxes. `list_reps` / `get_rep` for connected accounts, health, ownership.
- **LinkedIn safety:** max 25 connection requests/day per rep; the weekly ceiling floats ~100-150 by account SSI. Alta paces and enforces cooldowns; never mix heavy manual activity with automation on the same profile. Read acceptance **per rep** - one fried profile drags the pool; rest or warm a flagged rep, never push a restricted one.
- **Email** here is warm/aux for intent plays only, never the primary email sender (that is PlusVibe); most email replies are OOO.

## To know
- Alta is a **sequencer** for us; sourcing is Trigify -> n8n -> Alta by ID. Do not lean on Alta's native AI hiring condition, it is unreliable - which is why the hiring campaigns are the **(Manual)** ones.
- Social Signals is the highest-converting motion (~10-15% reply vs ~3-5% cold): one signal per campaign, refreshed weekly, open with their context.
- A blank connection request converts best and is safest; a personalized note raises risk and is the first thing to cut.
- On any MCP error, stop and ask the Operator to refresh, never retry in a loop.