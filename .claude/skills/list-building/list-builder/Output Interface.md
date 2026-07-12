# Output Interface

What a finished list-build produces: the lead side of a campaign, assembled and handed to copy.

## The deliverable

1. **One merged CSV per major pull** in the client's `Reports/` folder - the contacts for that ICP or domain list, company data attached, ready to ingest. Interim; the operator feeds it to the ingest automation.
2. **The segment filter table** - a formatted table naming each segment and the base filters that select it, read off the ingested table. The operator cuts the views from it.
3. **The campaign folder structure** - a date folder, one subfolder per campaign, each holding its exported segmented list.
4. **The handoff log** - the session logged as a handoff to the copywriter.

## The per-pull CSV

One CSV per major pull (one ICP or one domain list), in `Prospects/{Client}/Reports/`. Internal batching is merged away. On a discovery-origin pull, the discovery infographics are joined on `domain` and win on company fields; every contact-level field from the contacts database is kept. A contacts-only pull carries its own company data and needs no join. Keep the columns the segments and copy will use; the ingest automation does the final cleaning and field normalization.

## The segment filter table

The segmentation output the operator reads to cut the views. One row per segment:

| Segment (campaign) | Base filters | Size est. | Notes |
|---|---|---|---|
| {audience descriptor} | {field = value, AND/OR ...} | ~{rows} | personalization available, cautions |

Design rule: a variable either personalizes copy or splits a campaign. A different audience is a different campaign; a value that only changes a word stays a merge field. Flag any filter that needs a field not yet on the rows.

## The campaign folder structure

Date folder at the top, campaigns as subfolders. The subfolder carries no date and no index; it is named for the audience it targets.

```
{Campaigns root}/
  {D.M.YY} {Market / Niche}/            <- parent, date-stamped
    {Segment descriptor}/               <- one per campaign; no date, no index
      {exported lead list}.csv          <- the leads; copy lands here next
```

- **Campaigns root:** `Flowroots/Campaigns/` for our own campaigns; `Prospects/{Client}/Campaigns/` for a client or prospect.
- One subfolder per campaign, named for its audience. Subfolders equal campaigns equal segments.

## The handoff log

The build ends by logging the session as the handoff to the copywriter, in `Prospects/{Client}/Logs/`. It carries what he needs to write well:

- **The segmentation** - the segments and how they map to the campaign folders.
- **Why it was cut that way** - the reasoning behind the split.
- **Personalization available per segment** - the true, populated fields the copy can merge, per segment.
- **Context** - offer-angle notes, cautions, anything that helps him write.

## The lead list itself

The rows from a segment's view, carrying only fields that are true and useful to copy. Keep the merge set small and rock-solid: a wrong or missing merge value burns worse than no variable. Validate every merge token against the sending tool before it ships. Typical reliable set: first name (a localized token for non-English markets), company name, and only the optional fields (city, title) that are genuinely populated and correct.

## Naming conventions

| Artifact | Convention | Example |
|---|---|---|
| Parent campaign folder | `{D.M.YY} {Market / Niche}` | `7.7.26 Moving Companies US CA` |
| Campaign subfolder | `{Segment descriptor}` (no date, no index) | `Home Movers - Owner-Operators - Direct Contact` |
| Per-pull CSV | `{Niche} - {pull descriptor} - {date}` | `Movers - Residential Named - 2026-07-07` |
| Sending-tool campaign | `{D.M.YY} - {Segment descriptor}` | `7.7.26 - Home Movers - Owner-Operators - Direct Contact` |
