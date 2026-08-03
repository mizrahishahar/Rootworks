---
name: conventions-manager
description: The folder and naming conventions for fulfillment - the client folder itself and the campaign artifacts inside it (campaign folders, lead lists, sending-tool campaigns), plus the Airtable view chain every build table carries. Use when scaffolding a client folder or naming any campaign folder, exported list, sender campaign, or Airtable view.
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
| Sending-tool campaign | `{YYYY-MM-DD} - {Market / Niche} - {Segment descriptor}` - the parent folder and subfolder joined, so the campaign name alone says which build and which segment | `2026-07-07 - Moving Companies US CA - Home Movers - Owner-Operators` |

## View naming

Every build table carries the same working chain of views, always named the same way, so any build reads identically regardless of client or vertical:

| View | Name | Filter |
|---|---|---|
| Default | `Grid view` | none |
| Relevant | `Relevant` | the relevance conditions, OR `manually_approved` is checked - composed by [[views-poweruser]] |
| Cut review | `Cut review` | the exact complement of Relevant: every relevance condition negated, AND `manually_approved` unchecked |
| Found | `Relevant + Found` | Relevant AND `Status` done AND `Final Email` set |
| Segment | `{Segment descriptor}` - matches the campaign subfolder name it feeds | Relevant + Found's filters, plus the segment's own |

The chain reads top to bottom and each view narrows the one above it. `Relevant` and `Cut review` are exact complements and together they are the whole table - that is what makes the cut reviewable rather than invisible, and rescuing a row through `manually_approved` moves it from one to the other. Every segment view sits on top of `Relevant + Found` and only splits it, per [[segmentor]]; the segments must sum back to it exactly.

## Lead source: ready list or live intent

A campaign subfolder is fed one of two ways, and it carries the artifact that names its source:

- **Ready list** (static): an exported `{lead list}.csv`. Leads are pulled, enriched, and dropped in once.
- **Live intent** (standing): an `Intent Trigger.md` descriptor in place of the CSV. No static list; a Trigify search listens and a relay feeds qualified leads to the campaign continuously. The descriptor names the search, the relay, the gate, and the sending-tool campaign it maps to.

| Artifact | Convention | Example |
|---|---|---|
| Ready-list export | `{Niche} - {pull descriptor} - {YYYY-MM-DD}.csv` | `Movers - Residential Named - 2026-07-07` |
| Live-intent descriptor | `Intent Trigger.md` in the campaign subfolder | names the Trigify search, relay, gate, and campaign id |

## Shared/ mirrors

When a build's lead lists or email sequences need a client-facing surface (not every build does), mirror the Campaigns date-stamped parent under `Shared/`, one level up from segment - a single dated folder per build, not one per segment. Both `Lead Lists/` and `Email Sequences/` follow the identical dated-folder pattern; a build with both gets a matching folder in each.

```
Clients/{Client}/Shared/
  Lead Lists/
    {YYYY-MM-DD} {Market / Niche}/    same date + descriptor as the Campaigns parent, one folder per build
      {exported lead list}.csv       every list from that build's segments, flat inside the dated folder
  Email Sequences/
    {YYYY-MM-DD} {Market / Niche}/    same date + descriptor, mirrors the same build
      {Sequence}.docx                one per campaign in the build
```

Example: `Shared/Lead Lists/2026-07-15 US GC-CMAR/` and `Shared/Email Sequences/2026-07-15 US GC-CMAR/` both mirror `Campaigns/Email/2026-07-15 US GC-CMAR/`.

**Dates here are `YYYY-MM-DD` too, same as Campaigns - never `D.M.YY`.** This sits inside `Shared/`, so normally don't restructure or rename once share links point at it; only fix a pre-existing violation (wrong date format, or files never sorted into their build folder) with the client's explicit go-ahead, since files may already be linked from wherever they currently sit.
