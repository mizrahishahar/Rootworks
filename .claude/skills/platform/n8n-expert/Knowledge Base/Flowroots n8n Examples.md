# Flowroots n8n Examples

These are examples of how Flowroots uses n8n — context for pattern recognition, not a maintenance inventory.

---

## Example 1: Research Prospect (Initialization)

The flagship pattern. Triggered manually with an Airtable ID. Runs a full prospect enrichment pipeline unattended:

Form Trigger (Airtable record ID)
→ Airtable: read company record
→ Google Drive: create prospect folder
→ HTTP Request: Brandfetch API for branding (logo, colors, social links)
→ Code node: extract and reshape branding fields
→ AI Agent (gpt-5.1, no tools): research basics — what they sell, their ICP, delivery confidence, sales call line in Hebrew and English
→ Wait
→ AI Agent (gpt-5, web search) + Structured Output Parser: contact research — find 3 contacts with email, LinkedIn, confidence rating
→ Code node: flatten structured output
→ Airtable: create contact records linked to company
→ Wait
→ AI Agent (gpt-5.1, web search): sales asset research — case studies, demo videos, press links
→ Airtable: update company record with all enrichment data

Why this is n8n: the trigger is explicit (a form with an ID), every step is deterministic, and all outputs write to a system. No judgment calls — the AI agents produce structured output, not decisions.

---

## Example 2: Sync emails to Airtable

Scheduled trigger. Polls inbound emails and syncs replies into the right Airtable CRM records based on sender matching. Fully unattended.

---

## Example 3: Create Prospect/Meeting from Calcom

Calcom webhook fires on every new booking. Creates an Airtable prospect record and meeting entry automatically. Zero human involvement needed.

---

## Example 4: Sync Airtable record to vault crm-record.md

Airtable webhook fires when a CRM record changes. Writes the updated record as a markdown file into the Obsidian vault. Keeps vault in sync with live CRM without Shahar doing anything.

---

## What these examples have in common

- Every one has an unambiguous trigger
- None require Shahar to make a decision mid-run
- All outputs land in a system: Airtable, Drive, or Obsidian
- AI Agents inside them produce structured data, not judgment calls