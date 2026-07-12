# Sequence Interface

The copywriter works in two artifacts: a touch plan table (the strategy, approved first) and the sequence file (the clean copy or prompts, written from the approved plan). This file defines both. How to read the situation and choose the copy lives in `Knowledge Base/LinkedIn Outreach Foundations.md`; how it deploys as an Alta campaign lives in `Knowledge Base/Alta.md`.

---

## 1. Touch plan (pre-write, approved first)

Before any prose, each campaign gets one table. One row per touch. Each cell is a short strategic description of what that touch does, NOT the copy. It is the blueprint the writing is done from, approved before writing starts. The copy can still move afterward; the table is intent, not a contract.

One table per campaign, titled with the campaign (folder name + date) and its touch count. Columns:

| Touch | Step | Job | Angle / signal | Move |
|---|---|---|---|---|
| 0 | warm | earn the accept | - | view profile + like a recent post |
| 0 | connection request | get accepted | - | blank note |
| 1 | opener | earn the reply | the signal the first line leans on | a question, no pitch |
| 2 | follow-up | stay warm | the value dropped or angle shifted | value drop or clean exit |
| 3 | breakup | reopen or close | - | warm, no ask |

- **Touch** is the ordinal; **Step** names the Alta step type (view, like, connection request, message, voice, breakup).
- Cells are descriptors, not lines. "Opens off their infra hire, asks who owns it", never the written opener.
- The opener and any personalization draw only on fields and signals that actually exist and are populated for the campaign's audience. Read those before the table.

---

## 2. Sequence file (the deliverable)

`Prospects/{client}/Campaigns/{campaign}/LinkedIn Sequence.md`. No version numbers; a rewrite replaces it in place.

**Clean artifact only.** The saved sequence is the vault-clean version: the messages (or prompts) plus personalization placeholders, nothing else. No sending mechanics, no pacing, no rep assignment - those are set at Alta deploy (see `Alta.md`). This file is what a human reads and approves.

### Header
One line: **Audience** - the exact segment the sequence targets, and the **signal** it opens on if any. Nothing else.

### Body
Touches in order, each labeled by touch number and step. Warm touches (view, like) and the blank connection request are named, not written (they carry no copy). Each message touch is written in one of two forms, matching how the campaign runs:

- **Templated form** - the exact message copy, with placeholders. Used when the copy is fixed and human-written.
- **Prompt form** - the Goal and Instructions that steer the AI writer, with the slider intent noted separately (tone, length) since those are set in the panel, not the prompt. Used when the campaign is personalized by AI.

A campaign is written in one form throughout unless the plan says otherwise. Voice-message touches note the mode (personalized or one recorded clip) and the script or prompt.

The shape scales with the touch count set at handoff: a connection + opener + one follow-up + breakup is `4 touches`; a heavier sequence adds follow-ups or a voice touch.

---

## Personalization placeholders
`{{first_name}}`, `{{company_name}}`, `{{title}}`, and signal placeholders (`{{signal_detail}}`, e.g. the role they are hiring, the round they raised). Signal placeholders mark where the trigger fills in; the placeholder must resolve to something true for the row or the touch does not send.

## Scaling a winner
Iterations labeled `v1` `v2` `v3`, each with a one-line note on what was varied (the opener angle, the signal used, the follow-up move).

## Diagnosis output (when diagnosing, not writing)

A per-touch table:

| Touch | Status | What fails | What's weak |
|---|---|---|---|
| opener | keep / rewrite / kill | which principle or lane | one line |

Then a rewrite-versus-rethink recommendation, and a note if the real problem is the targeting or the offer rather than the copy (the 4% red flag), since neither is the copywriter's to fix.
