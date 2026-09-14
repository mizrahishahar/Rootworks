Teaches: the Alta surface by job, and every trap already paid for.

# The surface, and the lessons

## By job

| Job | How |
|---|---|
| The reply queue | `list_linkedin_messages(type: received)`, filter by campaign or rep |
| A dossier | `get_prospect`, `get_person`, then the full thread |
| Reply | `send_linkedin_message(prospectId, body)`, 2,000 characters, one call per message |
| Hold or release | `pause_prospect` / `resume_prospect`; `assign_tags` to flag |
| Opt out | `add_communication_opt_outs([{identifier, identifierType: email or linkedin or phone or domain}], pauseActiveProspects: true)`. Global across every campaign; domain-level kills the whole company |
| Numbers | `ask_alta_agent("campaign X, last 14 days: sent, accepted, replied, positive, booked")`, or walk `list_prospects(campaignId)` and `list_*_messages(type: received)`. `get_campaign` is metadata only |
| Reps | `list_reps` / `get_rep` for connected accounts, health and ownership |

## Sequencing traps

- **Sequences fire on top of manual replies.** *31 Jul 2026.* Sending by hand pauses nothing; step 2 landed on eleven threads a human had just answered. Pause the campaign before working its threads.
- **Sequence copy is invisible to the MCP, both ways.** *31 Jul 2026.* `get_campaign` returns metadata only, and no tool writes a sequence. A campaign's copy is built and edited in the UI; to learn what a campaign says, reconstruct it from `list_linkedin_messages(type: campaign)`.
- **The feed needs the Pull-in URL on the Hub Campaigns row.** Alta hands out one audience webhook per campaign and no API exposes it; the deploy refuses a campaign whose row has none. Paste it from the campaign's audience settings when the campaign is created.
- **A paused campaign swallows pull-ins.** *Sep 2026.* The pull-in answers 200 and creates no prospect. Unpause before enrolling; verify by `list_prospects`.
- **A completed campaign will not accept a feed.** `resume_campaign` first. Evergreen builds need "skip prospects already in campaigns" on.
- **Enrollment drops leads quietly.** *30 Jul 2026.* `add_leads` answers "try spacing your requests out" and fails a chunk; sixteen of forty-eight in one run. Check the enrolled count, never assume it.
- **Pull-ins are paced at one request per 8 seconds.** Faster bursts draw IP-level 429s after about 20 requests. The pull-in never reports a duplicate: it answers "Prospect uploaded successfully" for a new person and a member alike.
- `customFields` accepts only defined prospect-field keys and 400s the whole prospect on an unknown one. *1 Sep 2026:* one bad key rejected all 260. Values visible on the prospect card render blank in the copy until the defined field carries them.
- The source locks at draft; an active campaign is relaunched, not re-sourced. The native hiring condition is unreliable.
- The MCP build chain (`create_draft_campaign`, `build_campaign_pitch`, `preview_campaign_workflow`, `match_campaign_rep`) exists; `preview_campaign_workflow` does not persist and must be followed by `update_campaign({workflow})` the same turn.

## Record and inbox traps

- **Person records lie.** *31 Jul 2026.* `get_person` returned a Berlin M&A contact for a US thread; two prospects were messaged about a company they had left. Never merge a company name from a record into copy.
- **One retry, never a loop.** *31 Jul 2026.* `get_person` and `get_prospect` throw transient connector errors and succeed once retried. Two failures means stop and ask the Operator to reconnect.
- Hebrew scrambles in the editor. Save with `dir=rtl` and let the Operator send.
- Most email replies through Alta are out-of-office; email here is auxiliary.

## Rep limits

- 25 connection requests a day per rep; the weekly ceiling floats 100 to 150 by the account's SSI.
- Acceptance is read per rep. One restricted profile drags the pool; rest or warm it, never push it.
- Never mix heavy manual activity with automation on one profile.
- A blank connection request converts best and is safest; a personalized note raises risk and is the first thing to cut.
