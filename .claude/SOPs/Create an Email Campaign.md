---
type: SOP
mode: Co-op
description: Write and ship a campaign with the cold-email-copywriter. Take the campaigns and context in, read the lead fields, plan each campaign's variants as a strategy table, write the clean copy, deploy it to PlusVibe (cloned from an existing campaign, variables mapped, spintax and signature added), and mirror the approved copy and lead lists into the client's shared vault. The Operator owns the context and the variant/touch call, the table and copy approvals, and the PlusVibe launch; Claude owns reading the craft, the lead fields, the tables, the writing, the PlusVibe build, and the vault mirror.
---

## When to do it
You have campaign folders with lead lists ready for copy (from Build a Lead List, or a rewrite / recycle of an existing campaign), plus the context for what to write.

## What we get
Each campaign's approved sequence written clean into its folder, built and launched in PlusVibe under the naming convention, and mirrored into the client's shared vault (lead lists as CSVs, sequences as docx) so the client can see it in their own Obsidian.

## Process

### 1. Hand over the campaigns and context
**Owner:** Operator

Give the copywriter everything: the campaigns to write (folders + lead lists + the list-builder handoff), the situation and context (first-ever sequence, a feedback-driven overhaul, doubling down on a winning angle, a recycle, prior results, client direction, proof on hand, the offer), and decide how many variants and touches each campaign gets. The variant/touch call is the Operator's.

### 2. Ready up
**Owner:** Claude · **Skill:** cold-email-copywriter

Invoke cold-email-copywriter and **read it in full** - the skill and its entire knowledge base, end to end, plus its interfaces. This is a dedicated phase, not a warm-up: understand it deeply, understand the dedication that went into it, and carry it through the whole build. Do not skim, do not work from memory of a prior run; the whole skill is read fresh every time. Nothing is planned or written before this is done.

### 3. Read the lead fields
**Owner:** Claude · **Skill:** cold-email-copywriter

Open each campaign's exported lead CSV and read its columns to establish exactly which fields exist and are populated for personalization (name, company, city, title, any description-derived detail). Note the fill rate, and which fields differ by channel (named lists carry first name and title; role inboxes do not). The plan tables and the openers are built only on fields that actually exist on the rows.

### 4. Plan the variant tables
**Owner:** Claude · **Skill:** cold-email-copywriter

Read the situation per campaign. For each, produce its variant plan table per the Sequence Interface: one row per variant, each cell a short strategic description of what that part does (opener angle, offer as outcome + mechanism, proof / risk reversal, price / value, CTA). Strategy, not copy; personalization drawn only from the fields found in step 3. Output the full set of tables together.

### 5. Approve the tables
**Owner:** Operator

Review and approve the full set of tables, iterating until they are right. This is pre-approval of intent; the copy can still move afterward. No prose is written before this gate clears.

### 6. Write the copy
**Owner:** Claude · **Skill:** cold-email-copywriter

Write each campaign into its `Cold Email Sequence.md` in the campaign folder, per the Sequence Interface: clean copy, personalization placeholders only, no sender signature, no spintax. Iterate per campaign.

### 7. Approve the copy
**Owner:** Operator

Review the written sequences and approve, iterating per campaign. The copywriting job ends at this gate.

### 8. Build in PlusVibe
**Owner:** Claude · **Skill:** cold-email-copywriter

Per the Campaign Deployment reference: clone an existing campaign as the base (verify its live settings first), apply the changes this build needs, and upload the copy. Map every placeholder to a real, populated PlusVibe variable; add spintax that varies the surface wording without changing the essence of the approved copy; place the signature in the standard spot. Name each campaign per the convention.

### 9. Verify and launch
**Owner:** Operator

Review each PlusVibe campaign (variables render, spintax reads clean, signature placed, schedule / accounts / leads correct), approve, and launch. If the PlusVibe MCP errors, stop and refresh it before continuing.

### 10. Mirror to the client vault
**Owner:** Claude · **Skill:** cold-email-copywriter

Duplicate each campaign's lead-list CSV into the client's `Shared/Lead Lists/`, and export each clean sequence to the client's `Shared/Email Sequences/` as docx via Pandoc. Same naming convention on both. The shared copy is always the clean vault version, never the PlusVibe-rendered one.

### 11. Review
**Owner:** Operator

Confirm the shared mirror matches the built campaigns. Done.