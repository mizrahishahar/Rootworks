---
type: SOP
mode: Co-op
description: Build the lead side of a campaign with the list-builder. Scope the queries for the chosen tool handler, pull contacts into clean CSVs, ingest and segment in the base, and assemble the campaign folders with a handoff to copy. The Operator owns the tool platforms, the spend approvals, and the base execution; Claude owns the query scope, the CSV assembly, and the segmentation design.
---

## When to do it
You need the lead side of a campaign. A build starts from a handoff: a brief on who to reach and which tool handler opens it, plus any domains already in hand and any prior results.

## What we get
The campaign structure for this build: a date folder with one subfolder per campaign, each holding its exported, segmented lead list ready for copy, plus a handoff log that gives the copywriter the segmentation, its rationale, and the personalization available. Nothing paid runs without approval.

## Process

### 1. Hand over the brief
**Owner:** Operator

Give the list-builder everything: the offer and who to reach, which tool handler opens the build, any domains already in hand, prior results, anything that could matter.

### 2. Ready up
**Owner:** Claude · **Skill:** list-builder

Invoke list-builder and **read it in full** — the skill and its entire knowledge base, end to end, plus its interfaces. This is a dedicated phase, not a warm-up: understand it deeply, understand the dedication that went into it, and carry it through the whole build. Do not skim, do not work from memory of a prior run; the whole skill is read fresh every time. Nothing is scoped or pulled before this is done.

### 3. Scope the queries
**Owner:** Claude · **Skill:** list-builder

The core call. From the brief, decide how many queries it warrants, and author each one in the query form the chosen handler defines (its Query output). Note the segments the query split already implies; leave the full segmentation for step 7. Output: the query spec(s).

### 4. Run the discovery pull
**Owner:** Operator

If the build opened on a discovery tool, run it and its validation pass, and hand back the domain CSV(s). Skip if the build opened on contacts or the domains are already in hand.

### 5. Pull the contacts
**Owner:** Claude · **Skill:** list-builder

Run the pull for each query and produce the CSV the chosen contacts handler defines (its CSV output), one merged CSV per major pull, into the client's Reports folder. State the expected cost and get a yes before any paid pull. Multiple queries mean one CSV each.

### 6. Ingest
**Owner:** Operator

Feed each CSV to its ingest automation into the base, producing the ingested table(s).

### 7. Design the segmentation
**Owner:** Claude · **Skill:** list-builder

Read the base and its real distribution. Draw the full segment set now, and output a formatted table: each segment and the base filters that select it. Flag any needed field that is not already on the rows; do not rebuild what the source already provided.

### 8. Cut and export
**Owner:** Operator

Add any flagged field, cut the view per segment from the filter table, and export the segmented CSVs.

### 9. Assemble the deliverable
**Owner:** Claude · **Skill:** list-builder

Build the campaign folder structure per the convention, and place each exported CSV in its segment folder.

### 10. Hand off to copy
**Owner:** Claude · **Skill:** list-builder

Log the session as the handoff: the segmentation, the reason for it, the personalization available per segment, and any context the copywriter needs.

### 11. Review
**Owner:** Operator

Review the folders and the handoff log, approve, and hand to copy. The list-builder's job ends here.
