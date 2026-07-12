---
vertical: list-building
type: contact-source
owner: Operator
handler: contacts ingest (see clayroots tool)
---

# ContaGen

## Description
Open-web contact generation (DiscoLike bring-your-own-key): finds people the indexed databases miss, in owner-operated, local, and blue-collar niches. Names reliably, role inboxes more than direct emails. Runs only on the gap domains from a prior DiscoLike pull.

## Query
The set of gap domains: the companies that came back with no contact.

## Claude actions (MCP)
None. Claude chooses the highest-value gap domains; it does not run the generation.

## Owner actions
Run `generate-contacts` (BYOK, multi-pass) on the chosen domains; upload the result to the handler.

## To know
Exhaustion is real: if a domain set returns nothing, it is below scraping visibility, so do not re-run it. A real name with a guessable email pattern still powers personalisation.

## Automations
Its contacts join the parent pull and land through `SEGMENT DISCOLIKE CONTACTS`.
