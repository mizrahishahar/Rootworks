---
name: conventions-manager
description: The folder and naming conventions for fulfillment - the client folder itself and the campaign artifacts inside it (campaign folders, lead lists, sending-tool campaigns). Use when scaffolding a client folder or naming any campaign folder, exported list, or sender campaign.
type: skill
vertical: [list-building, copy, inbox-management]
---

# Conventions

## Client folder
Every client folder carries the same anatomy, and the fulfillment jobs run off it directly - no job gets its own sub-structure.

```
Clients/{Client}/
  Overrides.md   client root; behavioral deltas per job (sequencer, inbox, scheduler, copy, automations)
  Reports/       research outputs, onboarding form, invoices, internal client info
  Content/       web clippings, brand assets, public reference material
  Campaigns/     deliverables split by channel (Email/, LinkedIn/), one folder per campaign, each ending in a Verdict note
  Logs/          session logs, newest-first; the decision record (live comms stay in Slack)
  Assets/        deployable ammo: proof, case studies, Looms, sendable links, the DNC list, any sender KB
  Shared/        the Drive-shared client-facing surface; never restructure or rename inside it, share links depend on it
```

- **The inbox-manager needs no folder of its own.** It runs off three things already in the client folder: the **context** (Logs + onboarding), the **content** (Assets), and the **overrides** (the inbox section of Overrides.md). Given those, it derives the run.
- **Overrides.md** at the client root is the single overrides file, sectioned by job. The inbox section names the sender, the seats that send, the scheduler, and any DNC rule.
- **Assets/** holds the ammo the inbox-manager and copywriters deploy: proof numbers, testimonials, case studies, Looms, sendable links, the DNC CSV, and any per-sender knowledge base (e.g. an Alta KB). Flat, no required sub-structure.

## Campaign folder structure
Channel first, then a date-stamped parent per market, then one subfolder per campaign named for its audience.

```
Clients/{Client}/Campaigns/
  {Email | LinkedIn}/                 channel
    {YYYY-MM-DD} {Market / Niche}/    parent, date-stamped
      {Segment descriptor}/          one per campaign; no date, no index
        {exported lead list}.csv
```

**Dates are always `YYYY-MM-DD`** - the Obsidian date format the vault already uses (daily notes, meeting notes). It sorts chronologically, so the folders read in order. Never `D.M.YY`.

## Naming

| Artifact | Convention | Example |
|---|---|---|
| Channel folder | `Email` / `LinkedIn` | `Email` |
| Parent campaign folder | `{YYYY-MM-DD} {Market / Niche}` | `2026-07-07 Moving Companies US CA` |
| Campaign subfolder | `{Segment descriptor}` | `Home Movers - Owner-Operators - Direct Contact` |
| Per-pull CSV | `{Niche} - {pull descriptor} - {YYYY-MM-DD}` | `Movers - Residential Named - 2026-07-07` |
| Sending-tool campaign | `{YYYY-MM-DD} - {Segment descriptor}` | `2026-07-07 - Home Movers - Owner-Operators - Direct Contact` |

## Lead source: ready list or live intent

A campaign subfolder is fed one of two ways, and it carries the artifact that names its source:

- **Ready list** (static): an exported `{lead list}.csv`. Leads are pulled, enriched, and dropped in once.
- **Live intent** (standing): an `Intent Trigger.md` descriptor in place of the CSV. No static list; a Trigify search listens and a relay feeds qualified leads to the campaign continuously. The descriptor names the search, the relay, the gate, and the sending-tool campaign it maps to.

| Artifact | Convention | Example |
|---|---|---|
| Ready-list export | `{Niche} - {pull descriptor} - {YYYY-MM-DD}.csv` | `Movers - Residential Named - 2026-07-07` |
| Live-intent descriptor | `Intent Trigger.md` in the campaign subfolder | names the Trigify search, relay, gate, and campaign id |
