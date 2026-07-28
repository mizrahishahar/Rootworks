---
type: SOP
vertical: [list-building]
mode: Co-op
description: Build the lead side of a campaign through the waterfalls - load the client and the base, define the list(s), pick the waterfall, prepare and fire it, filter to relevant before enrichment, enrich, run any specialized process, segment, and export into campaign folders. Operator owns the pick, the spend, the forms, and the exports; Claude owns the preparation, the filtering, the process, and the segmentation.
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
| 2 | Define the list(s) | OPERATOR + CLAUDE | The list(s) for this build |
| 3 | Pick the waterfall | OPERATOR | The chosen waterfall |
| 4 | Prepare the waterfall | CLAUDE | The form values |
| 5 | Spend gate and fire | CLAUDE + OPERATOR | Build tables in the base |
| 6 | Filter to relevant | CLAUDE | The Relevant view |
| 7 | Enrich | OPERATOR | The Relevant + Found view |
| 8 | Specialized process (optional) | CLAUDE | Derived fields on the rows |
| 9 | Segment | CLAUDE | The segment set |
| 10 | Cut, export, hand off | OPERATOR + CLAUDE | Folders + handoff |
| 11 | Log the session | CLAUDE | Session logged |

## Process

### STEP 1 — Gather the brief and context

**Owner:** OPERATOR + CLAUDE · **Tool:** [[clayroots]], the client vault

The Operator hands the brief: the client, who to reach, the campaign this feeds. Claude resolves the client row in the Hub Clients registry, reads the client base as it stands, and reads the client's recent List sessions and waterfall runs in the Hub SESSIONS and AUTOMATIONS tables - what was built before, how the runs went, what failed. Then plays the build back.

**Output:** the context read, closed by the base as it stands:

```
| Table | Kind | Rows | Campaign-ready | Views |
|-------|------|------|----------------|-------|
| {name} | Contacts / Domains / Intent | ~{n} | {n done} | {cut views} |
```

Then wait for the go and any context you want to add.

---

### STEP 2 — Define the list(s)

**Owner:** OPERATOR + CLAUDE · **Skill:** list-builder · **Tool:** the client vault

Read the brief and name the list(s) this build pulls.

**Output:** the list(s) for this build, named and sized per `scoping`. Then wait for the go.

---

### STEP 3 — Pick the waterfall

**Owner:** OPERATOR · **Tool:** the `waterfall` tools

The Operator picks the waterfall for this build; its file is the operating manual from here.

**Output:** the chosen waterfall, loaded. Then wait for the go.

---

### STEP 4 — Prepare the waterfall

**Owner:** CLAUDE · **Skill:** list-builder · **Tool:** the chosen waterfall

Run the waterfall file Before the form. Then read the live form per [[n8n]] and write every form value, one query per list from Step 2.

**Output:** the pre-work deliverables and the form values, field by field. Then wait for the go.

---

### STEP 5 — Spend gate and fire

**Owner:** CLAUDE + OPERATOR · **Tool:** the chosen waterfall and its sources

Claude estimates the cost of the prepared run through each source Spend gate and states the ceiling. On the yes, the Operator submits the form. When the run lands, Claude reads its Hub AUTOMATIONS row and reports what actually happened.

> [!warning] Nothing paid runs without a yes.
> State the ceiling plainly and get an explicit approval before firing. Never call the spend small.

**Output:** the build tables in the client base, read back from the log. Then wait for the go.

---

### STEP 6 — Filter to relevant

**Owner:** CLAUDE · **Skill:** list-builder + views-poweruser · **Tool:** [[clayroots]]

Before anything is spent on enrichment, decide who's worth reaching (list-builder) and turn that into one verified filter (views-poweruser).

**Output:** the Relevant view, presented per views-poweruser's format. Cut is its plain complement, never built or held separately. Then wait for the go.

---

### STEP 7 — Enrich

**Owner:** OPERATOR · **Tool:** [[clayroots]]

The Operator runs the email waterfall on the Relevant view, in chunks. Nothing past this runs until rows are found: Status done and Final Email populated; catch-alls resolve on their own.

**Output:** the Relevant + Found view. The Operator confirms and hands it forward.

---

### STEP 8 — Specialized process

**Owner:** CLAUDE · **Skill:** discogen-prompter, or a ClayRoots automation for anything standing (an AI field, an n8n pass) · **Tool:** [[clayroots]]

Optional; skip when the build needs none. When the market or the copy calls for a variable the rows don't carry yet, either write the research prompt through discogen-prompter, or hand it to a standing automation when the derivation should run on its own from here on. Prefer whichever touches every row on its own over live row-by-row judgment in the session; when a classification applies at the company level, verify it landed on every contact row at that company before calling it done.

**Output:** the derived fields on the rows, with anything flagged for review. Then wait for the go.

---

### STEP 9 — Segment

**Owner:** CLAUDE · **Skill:** list-builder + views-poweruser · **Tool:** [[clayroots]]

Off the Relevant + Found view, list-builder reads the real distribution and draws the segment set; views-poweruser composes and verifies each one's filter.

**Output:** the segment set, presented per views-poweruser's format, reconciled to sum exactly to Relevant + Found. Then wait for approval of the segmentation.

---

### STEP 10 — Cut, export, hand off

**Owner:** OPERATOR + CLAUDE · **Skill:** conventions-manager · **Tool:** [[clayroots]]

The Operator cuts a view per approved segment - the segment filters composed with Relevant + Found and the per-company cap - and exports the CSVs. Claude builds the campaign folders under the naming conventions, places each list, and writes the handoff to copy: the segmentation and why, the true personalisation per segment, the context the copywriter needs.

**Output:** the campaign folders + the handoff to copy, shown before it goes. Then wait for approval.

---

### STEP 11 — Log the session

**Owner:** CLAUDE · **Tool:** [[clayroots]]

Log the session to the Flowroots Hub SESSIONS table, one record, fields in this order: Session ("{Client} - {build}"), Type "List Build", Client (linked), Date, Log, Deliverables (the build tables, the cut views, the exported campaign folders). The Log carries the build record: the waterfall fired and its counts from the AUTOMATIONS row, the relevance filter, the segments and their sizes, and what was exported where.

**Output:** the session logged. This closes the run.
