---
vertical: [list-building]
type: infrastructure
owner: Claude
---

# ContaGen

Contact generation over DiscoLike: for a given domain list, it pulls first from the DiscoLike contacts database (an OK source), and optionally escalates to open-web search (bring-your-own-key). Strong in owner-operated, local, and blue-collar niches the indexed databases miss. Names reliably, role inboxes more than direct emails.

## Actions (MCP)
- `generate-contacts` - contacts for a domain list; the web-search escalation is the BYOK flag, multi-pass.

## Spend gate
Runs on the Operator key; the domain selection is the cost control. State the domain count before running.

## To know
Exhaustion is real: a domain set that returns nothing is below scraping visibility, do not re-run it. A real name with a guessable email pattern still powers personalisation.