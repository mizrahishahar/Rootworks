---
type: SOP
vertical: [list-building]
mode: Co-op
description: Stand up a new intent play - an Apify scraper that detects a buying signal and feeds the shared intent machine, which qualifies, verifies, and enrolls the contacts into a campaign that already exists. Choose the scraper, configure the scrape, create the intent table to the standard shape, then wire the task and its webhook. One Apify task and one table per play; no new automation, no clone.
---

# Intent

> Run through the **sop-runner** skill - load it first (with obsidian-cli), one step at a time, never run ahead. Each step names its owner; in Co-op only the Operator advances the run.

## When to do it
A campaign wants a live signal feed instead of a static list. This runs **after** that campaign exists: an intent-list playbook was chosen and the campaign was already written and deployed, so it has a Target Campaign (the sender endpoint or campaign ID) for the play to route into. `Intent` never creates the campaign; it feeds one.

## What we get
A running intent play: one Apify scraper on a schedule, one intent table in the client's base to the standard shape, one webhook into the shared intent machine. Verified contacts enroll into the existing campaign on their own from here. No new automation.

## Process at a glance

| # | Step | Owner | Output |
|---|------|-------|--------|
| 1 | Gather the brief and context | OPERATOR + CLAUDE | Context read |
| 2 | Choose the Apify scraper | OPERATOR + CLAUDE | Scraper chosen |
| 3 | Configure the scrape | CLAUDE | Input JSON + cadence |
| 4 | Create the intent table | CLAUDE | Intent table in the base |
| 5 | Create the task and wire the webhook | OPERATOR | The play live |
| 6 | Log the session | CLAUDE | Session logged |

## Process

### STEP 1 — Gather the brief and context

**Owner:** OPERATOR + CLAUDE · **Tool:** [[clayroots]], the client vault

The Operator hands the brief: the client, the signal to detect, and the **Target Campaign this play feeds** - the sender endpoint or campaign ID of a campaign that already exists. Claude resolves the client's Hub row, confirming the Clayroots Base ID and, if the campaign enrolls via PlusVibe, the Workspace ID, reads the base and any intent plays already running, and plays back what this play is.

> [!warning] No campaign, no play.
> The play routes into an existing campaign. If the Target Campaign does not exist yet, stop - run `Campaign` first, then come back.

**Output:** the context read - the client, the signal, the Target Campaign, the Base ID and Workspace ID confirmed. Then wait for the go and any context you want to add.

---

### STEP 2 — Choose the Apify scraper

**Owner:** OPERATOR + CLAUDE · **Skill:** list-builder · **Tool:** [[apify]]

Claude searches the Apify store for the actor that detects this signal and reads the input schema of the strongest candidates. The Operator picks the actor to run.

**Output:** the chosen actor and its input schema. Then wait for the go.

---

### STEP 3 — Configure the scrape

**Owner:** CLAUDE · **Skill:** list-builder · **Tool:** [[apify]]

Write the actor's input against its schema - the audience and the trigger it scrapes, the filter knobs that deviate from the defaults (country, headcount, blocklists), and the schedule cadence that fits how often the signal changes. This is the sourcing judgment; get it right here.

**Output:** the input JSON and the cadence. Then wait for approval.

---

### STEP 4 — Create the intent table

**Owner:** CLAUDE · **Tool:** [[clayroots]]

Create the play's intent table in the client's base to the standard shape - the four column groups, each owned by exactly one machine, and nothing else.

**Output:** the intent table created, columns by group:

```
| Group | Owner | Holds |
|-------|-------|-------|
| Who | scraper | person + company identity, cleaned at write |
| Signal | scraper | what was detected, when, and the Target Campaign it routes into |
| Verification | waterfall | Status, Final Email, the email hunt's working state |
| Enrollment | enrollers | Intent Status, Enroll Confirmed, Enroll Error, routed_at |
```

Then wait for the go.

---

### STEP 5 — Create the task and wire the webhook

**Owner:** OPERATOR · **Tool:** [[apify]]

The Operator creates the scheduled Apify task with the approved input, and sets its webhook to the shared intent-signal endpoint. The payload just carries the play's identity, every value already in hand: `{client, table, campaign, eventType, resource}` - the client and Target Campaign from step 1, the table from step 4, `eventType` and `resource` the Apify webhook variables. The play is live from here; the shared machine qualifies, verifies, and enrolls on its own.

**Output:** the play live - the task scheduled, the webhook pointed. Then wait for the go.

---

### STEP 6 — Log the session

**Owner:** CLAUDE · **Tool:** [[clayroots]]

Log the session to the Flowroots Hub SESSIONS table, one record, Type "Intent List": Session ("{Client} - {signal} intent play"), Client (linked), Date, Log, Deliverables (the Apify task, the intent table, the campaign it feeds). The Log carries the play record: the signal, the actor chosen, the cadence, the filter knobs, and the Target Campaign it routes into.

**Output:** the session logged. This closes the run.
