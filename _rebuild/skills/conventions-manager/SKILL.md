---
name: conventions-manager
description: The naming and folder conventions for fulfillment artifacts - campaign folders, lead lists, sending-tool campaigns. Use when creating or naming any campaign folder, exported list, or sender campaign.
type: skill
vertical: shared
---

# Conventions

## Campaign folder structure
A date-stamped parent per market, one subfolder per campaign named for its audience, no date or index on the subfolder.

```
{Campaigns root}/
  {D.M.YY} {Market / Niche}/       parent, date-stamped
    {Segment descriptor}/          one per campaign; no date, no index
      {exported lead list}.csv
```

## Naming

| Artifact | Convention | Example |
|---|---|---|
| Parent campaign folder | `{D.M.YY} {Market / Niche}` | `7.7.26 Moving Companies US CA` |
| Campaign subfolder | `{Segment descriptor}` | `Home Movers - Owner-Operators - Direct Contact` |
| Per-pull CSV | `{Niche} - {pull descriptor} - {date}` | `Movers - Residential Named - 2026-07-07` |
| Sending-tool campaign | `{D.M.YY} - {Segment descriptor}` | `7.7.26 - Home Movers - Owner-Operators - Direct Contact` |
