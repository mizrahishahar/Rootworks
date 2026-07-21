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

- **Every token maps to a real field** on the loaded leads. A `{{token}}` the data does not carry is a break.
- **Every mapped field is populated** across the list, or a fallback is defined. Read the real fill-rate; do not assume it.
- **Values are true, not just present** - spot-check that `{{city}}` is their city, `{{company_name}}` is clean, a research token resolved to a real detail.
- **No literal tags leak** - no raw `{{token}}` or `{token}` reaches a send.

## What you output

A report per token: OK, or the gap (unmapped, low fill-rate, wrong value) and the fix, blank the token, add a fallback, or drop the variant that depends on it. Nothing sends until every token clears or is consciously blanked.
