---
type: SOP
vertical: [onboarding]
mode: Co-op
description: Stand up a signed client for live outreach. The automation scaffolds the workspace and opens the channel, the Operator dresses it and starts warmup, then the onboarding form is read into filled Overrides, populated Assets, the client's live automations, and a handoff the first list and campaign run off. Contract and first invoice paid is the trigger. Co-op, the Operator owns the human touches and the infra, Claude owns the build.
---

# Onboarding

> Run through the **sop-runner** skill - load it first (with obsidian-cli), one step at a time, never run ahead. Each step names its owner; in Co-op only the Operator advances the run.

## When to do it
The moment a prospect becomes a client: contract signed and first invoice paid.

## What we get
A client fully stood up: the Drive workspace in the house structure with Shared shared to their team, the Slack channel live and dressed, warmup running, the onboarding form read, Overrides filled, Assets and Reports populated, the client's n8n automations live, the daily routines on, and a handoff the first list build and first campaign run off. Nothing invented, nothing left half open.

## Process at a glance

| #   | Step                         | Owner    | Output             |
| --- | ---------------------------- | -------- | ------------------ |
| 1   | Gather the context           | CLAUDE   | Context read       |
| 2   | Scaffold the workspace       | CLAUDE   | Scaffold checklist |
| 3   | Dress the channel and invite | OPERATOR | Channel ready      |
| 4   | Welcome the client           | OPERATOR | Sent               |
| 5   | Start the infrastructure     | OPERATOR | Warmup running     |
| 6   | Wait on the onboarding form  | OPERATOR | Form in hand       |
| 7   | Read the form                | CLAUDE   | Intake table       |
| 8   | Populate Assets and Reports  | CLAUDE   | File-to-folder map |
| 9   | Write the Overrides          | CLAUDE   | Overrides draft    |
| 10  | Initialize the automations   | CLAUDE   | Automation plan    |
| 11  | Hand off the first campaign  | CLAUDE   | Handoff brief      |
| 12  | Turn on the routines         | CLAUDE   | Routines enabled   |

## Process

### STEP 1 — Gather the context

**Owner:** CLAUDE · **Tool:** close, `Rootworks/Clients`

**Purpose:** know exactly which client this is and where onboarding already stands, so we start at the right step and never redo a done one.

Read the Close lead: the signed deal, the contacts, the team. Check whether a client folder, a channel, or infra already exists. Establish the situation: a fresh signup, or a jump in partway through. Read only what tells you *where we are* - not the form, not any later step's material.

**Output:** the context read - client, deal terms, what already exists, the step we start from. Then wait for the go.

---

### STEP 2 — Scaffold the workspace

**Owner:** CLAUDE · **Tool:** n8n (Onboard Client automation)

**Purpose:** lay the client folder down in the house structure, drop the Overrides stub, open the bare channel, and hand the client their shared surface, in one run.

Fire the Onboard Client automation with the Close lead id. It creates `Clients/{Client}/` with the full anatomy (Overrides.md stub, Reports, Content, Campaigns/Email, Campaigns/LinkedIn, Logs, Assets, Shared), shares Shared with the lead's contacts, and opens the private `{slug}-private` channel.

**Output:** the scaffold checklist - each folder and the stub created, who Shared was shared with, the channel opened. Then wait for confirm.

---

### STEP 3 — Dress the channel and invite the members

**Owner:** OPERATOR · **Tool:** slack

**Purpose:** the automation opens a bare channel; the template (Launch Checklist, General Resources) can only be applied by hand, and the invite is a human moment.

Apply the channel template and invite the client into the channel. The Operator does this and marks it done.

**Output:** channel ready.

---

### STEP 4 — Welcome the client

**Owner:** OPERATOR

**Purpose:** the first human touch carries the relationship, not the system, so it stays in your hands.

Send the personalized welcome message. The Operator does this and marks it done.

**Output:** sent.

---

### STEP 5 — Start the sending infrastructure

**Owner:** OPERATOR

**Purpose:** start the warmup clock as early as possible; it runs in parallel while we wait on the form, so we lose no days.

Set up the sending infrastructure to begin warmup. The Operator sets it up and reports back.

**Output:** warmup running.

---

### STEP 6 — Wait on the onboarding form

**Owner:** OPERATOR

**Purpose:** everything downstream is built from their operation; without the form there is nothing true to build on.

Nothing past this runs until the client has filled the onboarding form. The Operator confirms it is filled and hands it over.

**Output:** form in hand.

---

### STEP 7 — Read the form and learn their operation

**Owner:** CLAUDE · **Tool:** the onboarding form (`Reports`)

**Purpose:** turn the raw form into a clean read of who they are and how they sell, the base every later step draws from.

Read the filled form. Extract their offer, ICP, proof, sender identity, constraints, and how their operation runs.

**Output:** the intake table - one row per field, the read played back. Then wait for confirmed or fix-these.

---

### STEP 8 — Populate Assets and Reports

**Owner:** CLAUDE · **Skill:** conventions-manager · **Tool:** `Rootworks/Clients`

**Purpose:** put the deployable ammo and the reference on file where the copywriters and the inbox-manager already look.

Drop the relevant files into place: the form and internal client info into Reports; the proof, case studies, sendable links, and DNC into Assets.

**Output:** the file-to-folder map - a two-column table of what landed where. Then wait for confirm.

---

### STEP 9 — Write the Overrides

**Owner:** CLAUDE · **Skill:** conventions-manager · **Tool:** `Overrides.md`

**Purpose:** capture the per-client deltas every job reads, the one file that bends the machine to this client.

Fill the Overrides stub from the intake, sectioned by job (sequencer, inbox, scheduler, copy, automations, communication).

**Output:** the Overrides draft in full, shown before saving. Wait for approval, then save.

---

### STEP 10 — Initialize the client automations

**Owner:** CLAUDE · **Tool:** n8n (client automation templates)

**Purpose:** give the client their standing automations by duplicating the templates and swapping in their specifics, never hand-built per client.

Duplicate each `for (client)` template and swap the client-specific values (Slack channel, sender ids, Close tag, folder ids): the new-lead qualifier, the Slack log sync, and the intent-trigger router.

**Output:** the automation plan - each automation to be created and the values swapped in, shown before anything is created. Wait for approval, then build and confirm live.

---

### STEP 11 — Hand off the first campaign

**Owner:** CLAUDE · **Tool:** `Logs`, the `List` and `Campaign` commands

**Purpose:** the first lists, copy, intent campaigns, and onboarding call each run in their own session; onboarding's last job is to hand them off well.

Write the handoff brief: what we learned about their operation, the first lead list to build (source, segment, filters), the intent triggers to set, and what the onboarding call still needs to settle. Save it to `Clients/{Client}/Logs/{date} - Onboarding.md`. This is the brief the first List and Campaign runs open from.

**Output:** the handoff brief. Then wait for confirm.


