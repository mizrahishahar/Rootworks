# segment

Cut a campaign-ready population into segments, one per campaign.

Loads `list-builder` (what makes a segment worth existing) and `views-poweruser` (the mechanics).

## The rule that decides a segment

A segment exists only if the copy can say something new to it. If two segments would receive the same email, they are one segment. Splitting for tidiness produces campaigns that dilute each other and a report nobody can read.

## Build

- Cut from **Relevant + Found**, never from the raw table.
- Gate by the per-company cap (`RankInCompany` <= N) when the client wants breadth over depth.
- Each segment's conditions written out exactly, for the Operator to build in the UI.

## Done when

**Every segment count sums exactly to Relevant + Found.** No row missed, none counted twice. State the numbers and the arithmetic. Orphans hide inside views that each look healthy on their own; the sum is the only thing that finds them.
