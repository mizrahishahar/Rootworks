---
type: SOP
vertical: [onboarding]
mode: Co-op
description: Stand up a signed client for live outreach on the Hub registry model. The automation scaffolds Drive, Slack, Close, ClayRoots, and the Clients registry row; the Operator dresses the channel and starts warmup; the form is read into Assets, Overrides, the Qualification Prompt, the email workspace, the DNC, and the client's automation clones; ends in a handoff the first list and campaign run off. Contract signed and first invoice paid is the trigger.
---

# Onboarding

> Run through the **sop-runner** skill - load it first (with obsidian-cli), one step at a time, never run ahead. Each step names its owner; in Co-op only the Operator advances the run.

## When to do it
The moment a prospect becomes a client: contract signed and first invoice paid.

## What we get
A client fully stood up: the Drive workspace shared to their team, the Slack channel live and dressed, warmup running, the Hub Clients row complete (Drive, Slack, ClayRoots, Close view, PlusVibe, Qualification Prompt), Close configured for the client, Assets and Overrides populated, the DNC loaded everywhere it protects, the two automation clones live off the registry row, and a handoff the first list build and first campaign run off. Nothing invented, nothing left half open.

## Process at a glance

| #   | Step                               | Owner             | Output                      |
| --- | ---------------------------------- | ----------------- | --------------------------- |
| 1   | Gather the context                 | CLAUDE            | Context read                |
| 2   | Scaffold the workspace             | CLAUDE            | Scaffold checklist          |
| 3   | Dress the channel and invite       | OPERATOR          | Channel ready               |
| 4   | Welcome the client                 | OPERATOR          | Sent                        |
| 5   | Start the sending infrastructure   | OPERATOR          | Warmup running              |
| 6   | Wait on the onboarding form        | OPERATOR          | Form in hand                |
| 7   | Read the form                      | CLAUDE            | Intake table                |
| 8   | Populate Assets and Reports        | CLAUDE            | File-to-folder map          |
| 9   | Write the Overrides                | CLAUDE            | Overrides draft             |
| 10  | Create the email workspace         | OPERATOR + CLAUDE | Workspace live, row updated |
| 11  | Author the Qualification Prompt    | CLAUDE            | Prompt on the row           |
| 12  | Clone the client automations       | CLAUDE            | Clones live                 |
| 13  | Design the sending workspace + DNC | CLAUDE            | Workspace configured        |
| 14  | Hand off the first campaign        | CLAUDE            | Handoff brief               |
| 15  | Log the session                    | CLAUDE            | Session logged              |

## Process

### STEP 1 - Gather the context

**Owner:** CLAUDE · **Tool:** close, the Hub Clients registry, `Rootworks/Clients`

**Purpose:** know exactly which client this is and where onboarding already stands, so we start at the right step and never redo a done one.

Read the Close lead: the signed deal, the contacts, the team. Check what already exists: a client folder, a channel, a Clients registry row, infra - and any prior sessions or automation runs for this client in the Hub SESSIONS and AUTOMATIONS tables ([[clayroots]]), which tell you exactly what already ran. Establish the situation: a fresh signup, or a jump in partway through. Read only what tells you where we are - not the form, not any later step's material.

**Output:** the context read - client, deal terms, what already exists, the step we start from. Then wait for the go.

---

### STEP 2 - Scaffold the workspace

**Owner:** CLAUDE · **Tool:** n8n (Onboard Client automation)

**Purpose:** lay the client down across every system in one run: the folder anatomy, the bare channel, the Close configuration, the ClayRoots base, and the registry row every automation resolves from.

Fire the Onboard Client automation with the Close lead id. It creates `Clients/{Client}/` with the full anatomy (Overrides.md stub, Reports with its Leads Overflow subfolder, Content, Campaigns/Email, Campaigns/LinkedIn, Logs, Assets, Shared), shares Shared with the lead's contacts, opens the private `{slug}-private` channel and invites the Operator, appends the client to the Close `Client` field choices, clones the client's Prospects smart view, creates the `{Client} Clayroots` base with its DNC Domains table, and writes the Hub Clients row: Client, driveMainFolderID, Slack Channel ID, Clayroots Base ID, Close Smart View ID.

**Output:** the scaffold checklist - every artifact confirmed against the live systems, the registry row shown. If the ClayRoots base failed on scope, flag it for hand-creation before any list build. Then wait for confirm.

---

### STEP 3 - Dress the channel and invite the members

**Owner:** OPERATOR · **Tool:** slack

**Purpose:** the automation opens a bare channel; the template (Launch Checklist, General Resources) can only be applied by hand, and the invite is a human moment.

Apply the channel template and invite the client into the channel. If the channel was made by hand rather than by the automation, also `/invite @Marvin` - the bot posts every lead card and can only post into private channels it is a member of (automation-created channels carry it from birth). The Operator does this and marks it done.

**Output:** channel ready.

---

### STEP 4 - Welcome the client

**Owner:** OPERATOR

**Purpose:** the first human touch carries the relationship, not the system, so it stays in your hands.

Send the personalized welcome message. The Operator does this and marks it done.

**Output:** sent.

---

### STEP 5 - Start the sending infrastructure

**Owner:** OPERATOR

**Purpose:** start the warmup clock as early as possible; it runs in parallel while we wait on the form, so we lose no days.

Set up the sending infrastructure - domains and inboxes - to begin warmup. The Operator sets it up and reports back.

**Output:** warmup running.

---

### STEP 6 - Wait on the onboarding form

**Owner:** OPERATOR

**Purpose:** everything downstream is built from their operation; without the form there is nothing true to build on.

Nothing past this runs until the client has filled the onboarding form. The Operator confirms it is filled and hands it over.

**Output:** form in hand.

---

### STEP 7 - Read the form and learn their operation

**Owner:** CLAUDE · **Tool:** the onboarding form (`Reports`)

**Purpose:** turn the raw form into a clean read of who they are and how they sell, the base every later step draws from.

Read the filled form. Extract their offer, ICP, proof, sender identity, DNC, constraints, and how their operation runs.

**Output:** the intake table - one row per field, the read played back. Then wait for confirmed or fix-these.

---

### STEP 8 - Populate Assets and Reports

**Owner:** CLAUDE · **Skill:** conventions-manager · **Tool:** `Rootworks/Clients`

**Purpose:** put the deployable ammo and the reference on file where the copywriters and the inbox-manager already look.

Drop the relevant files into place: the form and internal client info into Reports; the proof, case studies, sendable links, and the DNC list into Assets.

**Output:** the file-to-folder map - a two-column table of what landed where. Then wait for confirm.

---

### STEP 9 - Write the Overrides

**Owner:** CLAUDE · **Skill:** conventions-manager · **Tool:** `Overrides.md`

**Purpose:** capture the per-client deltas every job reads, the one file that bends the machine to this client - including which senders this client runs, if any.

Fill the Overrides stub from the intake, sectioned by job (sequencer, inbox, scheduler, copy, automations, communication). The senders named here decide everything sender-shaped downstream.

**Output:** the Overrides draft in full, shown before saving. Wait for approval, then save.

---

### STEP 10 - Create the email workspace

**Owner:** OPERATOR + CLAUDE · **Tool:** the email sender (per Overrides)

**Purpose:** the client's sending workspace is the container every campaign runs in, and its ID makes the client resolvable to the qualifier.

The Operator creates the client's workspace on the email sender the Overrides name and connects the warmed inboxes into it. Claude then writes the workspace ID onto the Hub Clients row.

**Output:** workspace live, inboxes attached, PlusVibe Workspace ID on the registry row. Then wait for confirm.

---

### STEP 11 - Author the Qualification Prompt

**Owner:** CLAUDE · **Tool:** the Hub Clients registry

**Purpose:** the per-client ICP rubric is what the qualifier automation runs on; without it a positive reply cannot be judged.

Draft the client's qualification system prompt from the intake: who they sell to, must-haves, sweet spot, strong signals, out-of-ICP, decision-maker patterns, the pain the client fixes, and the output rules. Same shape as the standing prompts on the registry.

**Output:** the prompt in full, shown before saving. Wait for approval, then write it to the Qualification Prompt field on the client's row.

---

### STEP 12 - Clone the client automations

**Owner:** CLAUDE · **Tool:** n8n (the `[template]` workflows), the client Overrides

**Purpose:** give the client their standing automations by cloning the templates; the record ID is the only value a clone carries - everything else resolves from the registry row at runtime.

Read the Overrides automations section for any deltas, then clone per template: `[template] Qualify & Notify New Lead` (set the Clients-row record ID and the `{slug}-new-reply` webhook path) and `[template] Log slack channels` (set the record ID). Name each `... for {Client}`, publish, confirm live.

**Output:** the clone plan shown before anything is created - each clone and the record ID going in. Wait for approval, then build and confirm live.

---

### STEP 13 - Design the sending workspace and load the DNC

**Owner:** CLAUDE · **Skill:** email-deployer · **Tool:** the client's senders (per Overrides), ClayRoots (DNC Domains)

**Purpose:** make the workspace shippable before the first campaign: waves, signatures, the DNC everywhere it protects, and the reply wire into the qualifier.

Per email-deployer's workspace design: tag the inboxes into waves, set the signature on every inbox, and configure the blocklist. Load the client's DNC from the form into the ClayRoots DNC Domains table, then push it into every sender the Overrides name - the email workspace blocklist, and the LinkedIn sender's exclusions when one runs. Wire the sender's positive-reply webhook to the client's qualifier clone.

**Output:** the workspace design read back live - waves, signatures confirmed on each inbox, DNC counts in ClayRoots and each sender, webhook wired. Then wait for confirm.

---

### STEP 14 - Hand off the first campaign

**Owner:** CLAUDE · **Tool:** `Logs`, the `List` and `Campaign` commands

**Purpose:** the first lists, copy, and onboarding call each run in their own session; onboarding's last job is to hand them off well.

Write the handoff brief: what we learned about their operation, the first lead list to build (source, segment, filters), and what the onboarding call still needs to settle. Save it to `Clients/{Client}/Logs/{date} - Onboarding.md`. This is the brief the first List and Campaign runs open from.

**Output:** the handoff brief. Then wait for confirm.

---

### STEP 15 - Log the session

**Owner:** CLAUDE · **Tool:** [[clayroots]]

**Purpose:** the onboarding record every later session reads - what was stood up, and what stayed open.

Log the session to the Flowroots Hub SESSIONS table, one record, fields in this order: Session ("{Client} - onboarding"), Type "Onboarding", Client (linked), Date, Log, Deliverables (the registry row, the workspace, the clones, the handoff brief). The Log carries what was stood up and confirmed live, the ids that matter, any deltas from the standard anatomy, and what remains open for the first build.

**Output:** the session logged. This closes the run.
