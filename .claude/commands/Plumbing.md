---
type: SOP
vertical: [infrastructure]
mode: Co-op
description: Fix one piece of infrastructure. Point at a single component that lays something down - an automation, the sending infra, a webhook, the base wiring, the CRM sync - read how it is actually wired against how it should be, diagnose the fault, fix it, and verify the symptom is gone. Client-scoped or machine-scoped. Same context phase to start with.
---

# Plumbing

> Run through the **sop-runner** skill - load it first (with obsidian-cli), one step at a time, never run ahead. Each step names its owner; in Co-op only the Operator advances the run.

## When to do it
One infrastructure component is broken, suspect, or needs a change: an n8n automation, the sending infrastructure, a webhook, a ClayRoots waterfall, the Close sync. Not a whole rebuild - one piece, worked to a clean fix.

## What we get
The component read against how it should work, the fault named, the fix applied and verified, and the change logged - the symptom gone, nothing else disturbed.

## Process at a glance

| # | Step | Owner | Output |
|---|------|-------|--------|
| 1 | Gather the context | CLAUDE | Context read |
| 2 | Read the component | CLAUDE | Wiring read |
| 3 | Diagnose | CLAUDE | Diagnosis table |
| 4 | Fix | CLAUDE or OPERATOR | Change applied |
| 5 | Verify | CLAUDE | Verification |
| 6 | Log | CLAUDE | Fix logged |

## Process

### STEP 1 — Gather the context

**Owner:** CLAUDE · **Tool:** the client vault + Rootworks/tools/infrastructure`

Establish the run: which single component this is, where it lives (which client, or the shared machine), what it is supposed to do, and the symptom that opened this. Read the component's tool file and any Overrides that bend it. Read only to know what we are fixing - do not touch it yet.

**Output:** the context read - the component, its owner (client or machine), its job, the symptom. Then wait for the go and any context you want to add.

---

### STEP 2 — Read the component

**Owner:** CLAUDE · **Tool:** the component's platform, read-only

Pull the live component and map how it is actually wired against how it should be. Read-only - you are looking, not changing.

**Output:** the wiring read.

```
| Part | Should be | Actually is | Status |
|------|-----------|-------------|--------|
| {node / field / route} | {expected} | {observed} | OK / OFF |
```

---

### STEP 3 — Diagnose

**Owner:** CLAUDE

Name the fault from the wiring read: what is broken, why, the fix, and the blast radius of that fix.

**Output:** the diagnosis. Then wait for approval of the fix before anything changes.

```
| Fault | Cause | Fix | Risk / blast radius |
|-------|-------|-----|---------------------|
| {what is wrong} | {root cause} | {the change} | {what it touches} |
```

---

### STEP 4 — Fix

**Owner:** CLAUDE or OPERATOR · **Tool:** the component's platform

Apply the approved fix. Claude makes the changes it owns and is asked to (a platform edit via MCP, a vault or base change); the Operator does the platform, credential, and external changes by hand.

> [!warning] Never touch a live automation unless the Operator authorizes this exact change.
> One component, the approved fix only. No adjacent "while I'm here" edits. If the fix turns out bigger than the diagnosis, stop and re-diagnose - do not improvise on a live flow.

**Output:** the change applied - what was changed, by whom.

---

### STEP 5 — Verify

**Owner:** CLAUDE · **Tool:** the component's platform (test / dry-run where the tool allows)

Re-run or test the component and confirm the symptom is gone, not just the code changed. Never call it fixed on the edit alone.

**Output:** the verification.

```
| Test | Expected | Result |
|------|----------|--------|
| {what you ran} | {expected} | PASS / FAIL |
```

---

### STEP 6 — Log

**Owner:** CLAUDE · **Tool:** the vault (`Clients/{client}/Logs` for a client component, the machine's infra log otherwise)

Log the fix: the symptom, the fault, the change, and the verification.

**Output:** the fix logged. This closes the run.
