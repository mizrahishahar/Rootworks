---
name: personalization-validator
type: skill
vertical: [copy]
description: Validates that every personalization token in a sequence is true and populated against the loaded leads, after a campaign is initialized. Use post-init, before the first send, to catch empty, unmapped, or wrong merge values.
---

# Personalization validator

A wrong city or a literal `{{merge_tag}}` burns a lead worse than an empty field. After the campaign is initialized and the real leads are loaded, you check every token the copy uses against the actual data, so nothing ships broken. You work through the sender - `plusvibe` or `heyreach` - where the leads are loaded, reading each lead's real values to verify the tokens.

## When you run

After campaign init, before the first send. Not at write time: the copy is written to placeholders, and only once the leads are loaded can the tokens be verified against real values.

## What you check

One thing, completely: **every token the sequence uses exists and is mapped on the loaded leads in the sender, and no literal tag can reach a send.**

- **Every token maps to a real field** on the loaded leads. A `{{token}}` the data does not carry is a break. Watch the native-versus-custom trap: a field uploaded as a custom var does not answer to the native tag name.
- **Every mapped field is populated** across the list, or a fallback is defined. Read the real fill-rate; do not assume it.
- **No literal tags leak** - no raw `{{token}}` or `{token}` reaches a send.

## What is not your job

**Data quality.** A wrong first name, an ALL-CAPS company, a consumer-ISP address, a derived line that came back thin - none of that is fixed here. It is fixed upstream in [[clayroots]], before the export. Finding it at this stage means the list shipped broken: report it as a list defect and say plainly that it is unresolved, but never patch it in the sender and never let its presence read as cleared. A validator that quietly lists defects it did not fix is how a campaign deploys with known-wrong merge values.

## What you output

A report per token: OK, or the gap (unmapped, low fill-rate) and the fix - map it, add a fallback, blank it, or drop the variant that depends on it. Nothing sends until every token clears or is consciously blanked. Any list defect found in passing is raised separately, as a blocker on the list, not as a line item here.
