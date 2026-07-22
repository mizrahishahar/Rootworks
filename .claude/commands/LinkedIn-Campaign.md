---
type: SOP
vertical: [copywriting]
mode: Co-op
description: Write and deploy the copy for a LinkedIn campaign. Take a ready campaign folder - the leads and the vars they carry - present the offer, choose the LinkedIn playbook, write a clean connection-gated sequence, export it for client review, and take it live through the client's LinkedIn sender. LinkedIn only; cold email campaigns are their own command.
---

# LinkedIn Campaign

> Run through the **sop-runner** skill - load it first (with obsidian-cli), one step at a time, never run ahead. Each step names its owner; in Co-op only the Operator advances the run.

## When to do it
A LinkedIn campaign folder is ready: the leads (the audience or the signal) and the vars they carry, the offer defined, and the campaign context in hand. Copy through launch happens here; cold email campaigns run their own command.

## What we get
A clean LinkedIn sequence, deployed live through the client's sender - the approved offer and touch plan behind it, the copy exported for client review, personalization validated, the launch verified and logged. Nothing invented ships, nothing unapproved goes live.

## Process at a glance

| # | Step | Owner | Output |
|---|------|-------|--------|
| 1 | Gather the brief and context | OPERATOR + CLAUDE | Context read |
| 2 | The offer table | CLAUDE | Offer table |
| 3 | Recommend from history (optional) | CLAUDE | History recommendation |
| 4 | Choose the playbook | OPERATOR | Playbook named |
| 5 | Lock the plan | CLAUDE | Touch plan |
| 6 | Approve the plan | OPERATOR | Plan approved |
| 7 | Write the sequence | CLAUDE | Sequence file |
| 8 | Approve the copy | OPERATOR | Copy approved |
| 9 | Export for client review | CLAUDE | Client-review export |
| 10 | Deploy | CLAUDE | Draft campaign built |
| 11 | Upload the leads | OPERATOR | Audience loaded |
| 12 | Validate personalization | CLAUDE | Validation report |
| 13 | Launch | OPERATOR | Campaign live |
| 14 | Verify and log | CLAUDE | Launch verified, logged |

## Process

### STEP 1 — Gather the brief and context

**Owner:** OPERATOR + CLAUDE · **Tool:** the client vault

The Operator hands the brief: the campaign folder, the segment or signal, the offer, the context (new or evergreen, which pass, past results). Claude reads the folder - the leads loaded into it and the real vars they carry - and the client Overrides, which name the client's LinkedIn sender and any deltas from the defaults. Then Claude plays back what this campaign actually is.

**Output:** the context read - the campaign, the segment or signal, the offer, the leads and their real vars, the sender named in Overrides. Then wait for the go and any context you want to add.

---

### STEP 2 — The offer table

**Owner:** CLAUDE · **Skill:** offer-builder

Present the offer sharpened, the pillar assessment, the verdict.

> [!warning] If the offer is not viable, stop.
> Flag it here, before any copy is written. A weak offer is not fixed by copy.

**Output:** the offer table - offer, pillars, verdict. Then wait for the go.

---

### STEP 3 — Recommend from history

**Owner:** CLAUDE · **Skill:** linkedin-analyzer

Optional. Read the workspace's past campaigns and surface what they say to run - the playbooks and signals that have pulled here, and the ones that have not. Claude proposes: run this read, or jump straight to choosing the playbook.

**Output:** the history recommendation, or a skip. Then wait for the go.

---

### STEP 4 — Choose the playbook

**Owner:** OPERATOR · **Tool:** `Rootworks/tools/linkedin-playbooks`

The Operator names the LinkedIn playbook the campaign runs on. Claude reads it in full - its angle, touches, and examples.

**Output:** the playbook named and read. Then wait for the go.

---

### STEP 5 — Lock the plan

**Owner:** CLAUDE · **Skill:** linkedin-copywriter

Show the playbook's touch plan, adjusted to this campaign and the real vars the leads carry. Cells are intent, not copy.

**Output:** the touch plan. Then wait for approval.

---

### STEP 6 — Approve the plan

**Owner:** OPERATOR

Approve the plan as a batch before any prose is written.

**Output:** plan approved.

---

### STEP 7 — Write the sequence

**Owner:** CLAUDE · **Skill:** linkedin-copywriter, conventions-manager

Write to the playbook's templates and examples: clean copy and personalization placeholders only, built on the vars the leads actually carry. Save the sequence into the campaign folder per conventions-manager (it owns the path and naming) - the connection request and the gated messages, no sending mechanics (those belong to deploy). A rewrite replaces the file in place; no version numbers.

- **Header** - one line: the Audience, the exact segment or signal.
- **Body** - the connection request, then the messages in order, variants labeled by number + letter. No subject lines.
- **Placeholders** - the real vars the leads carry (`{{first_name}}`, `{{company_name}}`, and any signal token the list populates).

**Output:** the sequence file, shown in full. Then wait for approval.

---

### STEP 8 — Approve the copy

**Owner:** OPERATOR

The gate before anything is exported or deployed. Refine against the plan, then approve.

**Output:** copy approved.

---

### STEP 9 — Export for client review

**Owner:** CLAUDE · **Tool:** the client vault

Export the approved sequence as a docx and the audience as a CSV into `Clients/{client}/Shared/` - the artifacts the client reviews and comments on.

**Output:** the client-review export - the sequence docx and the audience CSV in `Shared/`. Then wait for the go.

---

### STEP 10 — Deploy

**Owner:** CLAUDE · **Skill:** linkedin-deployer · **Tool:** the client's LinkedIn sender

Take the approved sequence live as a draft through the sender named in Overrides. The deployer builds the draft with its standing defaults - blank connection request, message gated on accept, account caps, Co-Pilot first; the approved essence never changes.

**Output:** the draft campaign built. Then wait for the go.

---

### STEP 11 — Upload the leads

**Owner:** OPERATOR · **Tool:** the client's LinkedIn sender

The Operator loads the audience into the draft campaign.

**Output:** audience loaded.

---

### STEP 12 — Validate personalization

**Owner:** CLAUDE · **Skill:** personalization-validator

Read every loaded lead and check each token against its real value: mapped, populated, true, no literal tag left to render. Clean what is broken in place.

**Output:** the validation report - every token OK or fixed. Then wait for the go.

---

### STEP 13 — Launch

**Owner:** OPERATOR · **Tool:** the client's LinkedIn sender

Claude presents readiness with honest flags. The Operator flips the campaign live.

**Output:** the campaign live.

---

### STEP 14 — Verify and log

**Owner:** CLAUDE · **Skill:** linkedin-deployer · **Tool:** the client's LinkedIn sender

Read the campaign back and confirm it is live - status and settings by read-back, never the response code. Log the deploy to `Clients/{client}/Logs`.

**Output:** the launch verified and logged. This closes the run.
