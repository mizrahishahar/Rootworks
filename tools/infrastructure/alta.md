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

AI-SDR sequencer and inbox, LinkedIn-first with intent email on the side. **For us it is a sequencer and an inbox, never a sourcing tool.** Leads arrive from n8n, Alta enriches and sequences them, and every reply comes back here to be worked by hand.

## What it owns

| Owns | Does not own |
|---|---|
| Sending the sequence | Sourcing, that is Trigify into n8n |
| Holding every LinkedIn conversation | CRM truth, that is [[flowroots-hub]] |
| The client's real LinkedIn accounts and their send limits | Primary email, that is [[plusvibe]] |
| Global opt-out suppression | |

## Access

- **Claude:** the Alta MCP. `list_*` / `get_*` to read, `send_linkedin_message` / `send_email_message` to reply, `assign_tags`, `*_communication_opt_outs`, `pause_*` / `resume_*`, and `ask_alta_agent` for numbers.
- **n8n:** REST at `https://api.altahq.com/v1`, `Authorization: Bearer <token>` (Alta → Account Settings → Generate Token). Enrollment is by campaign ID, one automation switching the ID per segment. Read live IDs with `list_campaigns`.

## Working the inbox

The main job.

- **Queue:** `list_linkedin_messages(type: received)`, filter by campaign or rep.
- **Read:** `get_prospect` and `get_person` for the dossier, then the full thread.
- **Reply:** `send_linkedin_message(prospectId, body)`, 2000 char max, one call per message.
- **Pause the campaign before working its threads.** See limits.
- **Draft and ask before every send.** No exceptions.
- **Booking:** the client's scheduler, per their Overrides. Real slots only, never an invented duration.
- **Housekeeping:** `assign_tags` to flag, `pause_prospect` / `resume_prospect` to hold or release.

## Campaigns

Built and edited **in the UI**. The MCP can create and launch one, but it cannot read or write sequence copy, so every copy change is a UI job.

- Anatomy: Audience, Pitch, Touchpoints, Preferences, Launch. The source locks at draft, so an active campaign is relaunched, not re-sourced.
- Evergreen builds need **skip prospects already in campaigns** on. A completed campaign will not accept a feed, `resume_campaign` first.
- A blank connection request converts best and is safest. A personalized note raises risk and is the first thing to cut.

## Numbers

- `ask_alta_agent(task)` queries the account data directly. Ask the quantitative question plainly: "campaign X, last 14 days: sent, accepted, replied, positive, booked."
- Or walk it: `list_prospects(campaignId)` for volume in, `list_*_messages(type: received)` for outcomes.
- `get_campaign` is metadata only.

Feeds the `linkedin-analyzer` cascade: send pulse → account health → audience → copy → booking and show.

## Opt-outs and DNC

The decision logic lives in the n8n automation. In Alta:

- **Said no or unsubscribed** → `add_communication_opt_outs([{identifier, identifierType: email|linkedin|phone|domain}], pauseActiveProspects: true)`. Global across every campaign. Domain-level kills the whole company, so do not reach for it casually.
- **Live conversation or booked** → do not touch, flag to the Operator. Cross-check the Hub Prospects table for the truth across channels.
- **Nobody talking** → enroll by campaign ID.

`list_communication_opt_outs` reads the list. Belt and braces: skip-already-in-campaign on every campaign.

## Reps and safety

Reps are the client's real people, each a LinkedIn account plus provisioned inboxes. `list_reps` / `get_rep` for connected accounts, health and ownership.

- **25 connection requests per day per rep.** The weekly ceiling floats 100 to 150 by account SSI.
- Read acceptance **per rep**. One fried profile drags the pool. Rest or warm a flagged rep, never push a restricted one.
- Never mix heavy manual activity with automation on the same profile.
- Email here is warm and auxiliary, for intent plays only. Most email replies are out-of-office.

---

## Limits and lessons

*Dated so we know how current they are.*

**Sequences fire on top of manual replies.** *31 Jul 2026.* Sending by hand does not pause anything. Thirty hand-written messages went out and the campaign's step 2 landed on eleven of those same threads within hours, so the prospect saw a human and then a bot. **Pause the campaign before working its threads.**

**Sequence copy is invisible to the MCP.** *31 Jul 2026.* `get_campaign` returns metadata only. To find out what a campaign is actually saying, reconstruct it from `list_linkedin_messages(type: campaign)` mapped prospect to campaign. Slow, and the only way.

**Person records lie.** *31 Jul 2026.* `get_person` returned a Berlin M&A contact for a thread addressed to a man at a US company. Stale employers are routine: two prospects were messaged about a company they had already left, and one said so in his first reply. Never trust a name or company from the MCP without the thread text, and never merge a company name into copy.

**One retry, never a loop.** *31 Jul 2026.* `get_person` and `get_prospect` throw transient connector errors and succeed on a single retry. A run should not halt on a blip, but two failures means stop and ask the Operator to reconnect.

**Enrollment drops leads quietly.** *30 Jul 2026.* `add_leads` returns "try spacing your requests out" and fails a chunk. Sixteen of forty-eight in one run. Check the enrolled count, never assume it.

**The native hiring condition is unreliable.** Which is why the hiring campaigns are the manual ones.

**Social signals is the strongest motion.** Roughly 10 to 15 percent reply against 3 to 5 percent cold. One signal per campaign, refreshed weekly, and the opener has to lead with their context. If a signal campaign reads like cold, the signal is stale or the opener did not lead with their context.

**Hebrew scrambles.** The editor mangles RTL. Save with `dir=rtl` and let the Operator send.

---

## Appendix: the MCP campaign-build chain

Kept for reference. We build in the UI, so this is rarely used.

- `search_prospects(filters)` previews an audience and its count.
- `create_draft_campaign(campaignName)` returns `campaignId` and a builder URL.
- `build_campaign_pitch(campaignId, pitchBrief)` drafts the pitch.
- `preview_campaign_workflow(campaignId, channels, instructions)` streams the sequence. **Does not persist**, follow with `update_campaign({workflow})` the same turn or it is lost.
- `match_campaign_rep(campaignId, repName)` binds the sender.
- `launch_campaign_builder(campaignId)` marks ready, then launch.

Touchpoint types: view-profile and like-post warm-ups, connection request, LinkedIn message gated on acceptance, voice note after connection, email, SMS, WhatsApp, and AI or custom conditions to branch. Copy is either templated (the exact message) or personalized (a Role / Context / Task / Format / Constraints prompt). Run mode is Co-Pilot to validate, then Auto-Pilot.
