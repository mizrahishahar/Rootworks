---
type: architecture
vertical: [list-building, intent]
owner: Operator
status: live 2026-09-01 (Signals standard; plays and enrollers retired)
---

# The Intent Standard

Intent is the standard list machine with a signal in front. Signals only LAND rows; every filter, segment, and send decision happens in the Airtable, per the ClayRoots standard. Contacts are pulled WIDE; relevance and the views cut in the base.

## The pieces

| Piece | Where | Job |
|---|---|---|
| **Signals** table | Hub `tblDtJeqkUB2JFga1` | One row per signal: what to scrape for whom, the config the handler reads |
| **Handler** (`Handle Hiring Intent Signal`) | n8n, webhook `/intent-signal` | Scrape dataset -> hard lines -> ICP -> wide contact pull -> upsert -> waterfall |
| **Intent table** | Client's ClayRoots base | A standard contacts table plus the signal's payload columns |
| **Views** | On the table | The standing chain plus one live queue per campaign |
| **Campaigns** rows | Hub `tblbVPakE4n16ob7Y` | Carry `Signal` link (the feed switch), `Signal View` (queue view id), `Pull-in URL` (Alta) |
| **Doors** | `Deploy View to Campaign` (PV), `Deploy View to Alta Campaign` | Deploy a queue view into a campaign; stamp membership; write receipts |
| **Feeds** | Schedule triggers inside the doors | Daily 13:30 IL (PV) / 13:35 IL (Alta): every Signal-linked campaign drinks from its Signal View |

## The Signals row

Name · Signal Type (select) · Roles (titles counted as already-in-role) · Target Table (tbl id) · Country · Max Employees · ICP (the qualification sentence, staffing/agency/posting-for-clients exclusion included) · Client (link) · Campaigns (link = the feed switch).

The Apify task's webhook posts `{ "play": "<Signals row id>", "resource": {{resource}} }` to `/webhook/intent-signal`. The handler resolves the row by id, with a legacy fallback to the single `Signal Type = hiring` row (flagged in the log).

## The run funnel (every drop counted in the run log)

1. **Hard lines, free:** wrong country · staffing words in name/poster/industry · body-shop post (never names its own company) · over Max Employees · no domain · **hosted-platform subdomain** (vercel.app, github.io, netlify.app and kin are not companies) · duplicate · already in table.
2. **BizData** (DiscoLike, net-new only): facts on the row; closed companies drop.
3. **ICP check** (DiscoLike validate/icp, BYOK): the Signals row's ICP sentence, verdict + reason written to `ICP Reason`. `no` drops, `partial` kept and marked.
4. **Existing In Role** (free counts on the Roles list): a number when a source knows the company, blank when none does. Never rejects.
5. **Contacts, wide, no people gate:** ContaGen (Technology/Executive, decision levels, cap 12/company) + **AI-Ark people** (the broad leadership title list; identity authority, its URL is the person's own). Supersoniq is banned from intent (mispaired URLs).
6. Clean Fields -> DNC -> upsert (by Email, else Name+Domain) -> **waterfall batch fired**.

The table decides everything after this point. `relevance` (formula: buyer branches minus never-terms; `manually_approved` only widens), `linkedin_name_match` (URL-identity fence), and the views do all filtering.

## Table + views

Table setup, fields, the standing chain, and the campaign-queue anatomy live in the **clayroots-tables skill** (`table-setup.md`, Intent tables section). The short of it: standard contact fields + the signal payload columns + the machine fields (`relevance`, `manually_approved`, `linkedin_name_match`, `Deploy Error`, `Campaigns` link, `Channel (from Campaigns)` lookup). Chain: `Grid view` / `Relevant` / `Cut review` / `Relevant : Campaigns` (the client window, share link in the table description). Then **one live queue view per campaign**: floor (relevance OR manually_approved) + channel identity + segment axis (cascade, blanks stated, catch-all) + **Channel drain** (`Channel (from Campaigns)` has none of this channel, Multi) + not-empty gates on every var the copy uses.

## Feeds and doors

- **The switch is the `Signal` link on the Campaigns row.** Linked = feeds daily. Removed = off. `Signal View` holds the queue view's **id**; Alta campaigns also carry their operator-pasted `Pull-in URL`.
- **PV door:** dedupe mode `None` on feeds; the **Campaigns stamp-gate** is the real dedupe (a row linked to this campaign's mirror is never re-sent). Vars = the view's visible non-machine columns as `custom_variables`; `Job `-prefixed and convention columns ride (sent when filled, never block); any other visible column is required (empty = skip, `Deploy Error` stamped).
- **Alta door:** identity = LinkedIn URL + Company (first/last name ride when present, never block). Pushes pace **1 per 8s** (the old enroller's proven interval; faster bursts 429). Verify-Landing reads fresh prospects back (crash-heal resolves older members when pushed > fresh); Title-Gate re-checks the buyer rule after landing and pauses failures; stamps are written only after verified landing.
- Both doors: union `Campaigns` stamps, per-view Lead Lists receipt (`{table} - {view}` name, share link from the table description), full run report on the launch row.

## Dedupe, three layers

1. The queue view's Channel drain: anyone already in a campaign on that channel never re-enters any queue on it.
2. The door's stamp-gate: a row stamped with this campaign's mirror is skipped, whatever the sequencer says.
3. In-run duplicate-URL guard (Alta) / sequencer-side dedupe (PV, feed mode `None` on purpose: the stamps are the truth).

## Gotchas, paid for

- **The n8n instance clock is Asia/Jerusalem.** Schedule triggers are IL wall-clock. And activating an already-active workflow does NOT reload its trigger: every schedule change ships as push -> deactivate -> activate.
- **Alta ingests pull-ins asynchronously** (minutes to an hour). A read-back of zero right after a push proves nothing yet.
- **A draft (unlaunched) Alta campaign answers "uploaded successfully" and quietly holds/drops the prospect.** Launch before deploying. Rotating/arming the pull-in webhook at launch can invalidate a previously pasted Pull-in URL: re-copy it after launch.
- **Alta renders sequence variables only from defined prospect fields**; `extraInfoData` is a display blob the copy never reads. The door ships vars as `customFields` (Alta system keys mapped top-level: title -> jobTitle and kin). `customFields` 400s the whole prospect on any unknown key, so **campaign setup law: every variable the copy uses must exist as a defined prospect field on the account** (`create_prospect_field`, once; the key is snake_case of the label and must equal the column's snake name). Prospects loaded before their fields existed render blank; the clean fix is a fresh campaign through the fixed door, not re-pushing (re-push semantics on existing prospects are undocumented).
- **Never fire two Alta deploys concurrently**: static-data race + IP rate limit. The feeds stagger launches 15 minutes apart.
- Alta canonicalizes LinkedIn slugs; membership reconciliation falls back to unique name+company match.

## Creating a new signal (the process)

1. **Signals row** (config above). Same signal type = zero code; a new type = one edit cycle on the handler's source-parse, everything downstream reused.
2. **Apify task** + webhook payload carrying the Signals row id.
3. **Table** in the client's ClayRoots base per the skill's Intent section (sessions create it via API; the share link is the one Chrome click).
4. **Views**: standing chain + one queue per campaign, counts closed.
5. **Campaigns**: create + launch in the sequencer; after the sync mirrors them to the Hub: paste `Signal View` (view id) and `Pull-in URL` (Alta), then link `Signal`. That link turns the feed on.
6. **Prove**: one scraper run, funnel read, rows spot-checked both sides; first feed cycle verified by values (stamps, sequencer read-back, receipt).

## Retired (delete on sight)

Play KB rows and the play grammar. `Add Intent Leads to Alta` / `to PlusVibe` (off). The routing fields: `Intent Status`, `Target Campaign`, `routed_at`, `Enroll Confirmed/Error`, `LinkedIn/Email Campaign`, `LinkedIn/Email Routed At`, `Signal Detail`, `Event Type`, `First Hire`, `Campaigns (old text)`.
