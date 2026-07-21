---
type: SOP
vertical: [list-building]
mode: Co-op
description: Build the lead side of a campaign through the waterfalls - load the client and the base, pick the waterfall, prepare and fire it, validate titles before enrichment, enrich, run any specialized passes, segment, and export into campaign folders. Operator owns the pick, the spend, the forms, and the exports; Claude owns the preparation, the validation, the passes, and the segmentation.
---

# List

> Run through the **sop-runner** skill - load it first (with obsidian-cli), one step at a time, never run ahead. Each step names its owner; in Co-op only the Operator advances the run.

## When to do it
You need the lead side of a campaign. A build starts from a brief: the client, who to reach, the campaign it feeds.

## What we get
A segmented, verified list in the client [[clayroots]] base with a view per campaign, exported into campaign folders with a handoff to copy. Nothing paid runs without approval.

## Process at a glance

| # | Step | Owner | Output |
|---|------|-------|--------|
| 1 | Gather the brief and context | OPERATOR + CLAUDE | The context read |
| 2 | Pick the waterfall | OPERATOR | The chosen waterfall |
| 3 | Prepare the waterfall | CLAUDE | The form values |
| 4 | Spend gate and fire | CLAUDE + OPERATOR | Build tables in the base |
| 5 | Validate the titles | CLAUDE | Keep / cut / review as view filters |
| 6 | Enrich | OPERATOR | Campaign-ready rows |
| 7 | Specialized passes (optional) | CLAUDE | Derived fields on the rows |
| 8 | Segment | CLAUDE | Segmentation preview table |
| 9 | Cut, export, hand off | OPERATOR + CLAUDE | Folders + handoff |

## Process

### STEP 1 — Gather the brief and context

**Owner:** OPERATOR + CLAUDE · **Tool:** [[clayroots]], the client vault

The Operator hands the brief: the client, who to reach, the campaign this feeds. Claude resolves the client row in the Hub Clients registry and reads the client base as it stands, then plays the build back.

**Output:** the context read, closed by the base as it stands:

```
| Table | Kind | Rows | Campaign-ready | Views |
|-------|------|------|----------------|-------|
| {name} | Contacts / Domains / Intent | ~{n} | {n done} | {cut views} |
```

Then wait for the go and any context you want to add.

---

### STEP 2 — Pick the waterfall

**Owner:** OPERATOR · **Tool:** the `waterfall` tools

The Operator picks the waterfall for this build; its file is the operating manual from here.

**Output:** the chosen waterfall, loaded. Then wait for the go.

---

### STEP 3 — Prepare the waterfall

**Owner:** CLAUDE · **Skill:** list-builder · **Tool:** the chosen waterfall

Run the waterfall file Before the form. Then read the live form per [[n8n]] and write every form value.

**Output:** the pre-work deliverables and the form values, field by field. Then wait for the go.

---

### STEP 4 — Spend gate and fire

**Owner:** CLAUDE + OPERATOR · **Tool:** the chosen waterfall and its sources

Claude estimates the cost of the prepared run through each source Spend gate and states the ceiling. On the yes, the Operator submits the form. When the run lands, Claude reads its Hub AUTOMATIONS RUNS row and reports what actually happened.

> [!warning] Nothing paid runs without a yes.
> State the ceiling plainly and get an explicit approval before firing. Never call the spend small.

**Output:** the build tables in the client base, read back from the log. Then wait for the go.

---

### STEP 5 — Validate the titles

**Owner:** CLAUDE · **Skill:** title-validator · **Tool:** [[clayroots]]

Before anything is spent on enrichment, run the Contacts table through title-validator: keep the real decision-makers, cut the noise, flag the borderline for a human call.

**Output:** keep / cut / review, the cut and review as their exact view filters. Then wait for the verdict on the flagged and the go.

---

### STEP 6 — Enrich

**Owner:** OPERATOR · **Tool:** [[clayroots]]

The Operator runs the email waterfall on the kept rows, in chunks. Nothing past this runs until rows are campaign-ready: Status done and Final Email populated; catch-alls resolve on their own.

**Output:** campaign-ready rows. The Operator confirms and hands it forward.

---

### STEP 7 — Specialized passes

**Owner:** CLAUDE · **Skill:** the specialized skill the build calls for · **Tool:** [[clayroots]]

Optional; skip when the build needs none. When the market or the copy calls for it, deploy the specialized skills that derive what the rows are missing - a greeting token, a classification, a written variable - each working through the base. New fields land here, before the segments are drawn.

**Output:** the derived fields on the rows, with anything flagged for review. Then wait for the go.

---

### STEP 8 — Segment

**Owner:** CLAUDE · **Skill:** segmentor · **Tool:** [[clayroots]]

Read the real distribution of the done rows and draw the segment set.

**Output:** the segmentation preview table, so every segment proves its size before a view is cut:

```
| Segment (campaign) | Airtable filters | Size | Notes |
|--------------------|------------------|------|-------|
| {audience} | {field = value, AND/OR ...} | ~{done rows} | personalisation available, cautions |
```

Then wait for approval of the segmentation.

---

### STEP 9 — Cut, export, hand off

**Owner:** OPERATOR + CLAUDE · **Skill:** conventions-manager · **Tool:** [[clayroots]]

The Operator cuts a view per approved segment - the segment filters composed with campaign-ready and the per-company cap - and exports the CSVs. Claude builds the campaign folders under the naming conventions, places each list, and writes the handoff to copy: the segmentation and why, the true personalisation per segment, the context the copywriter needs.

**Output:** the campaign folders + the handoff to copy, shown before it goes. Then wait for approval.