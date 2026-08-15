---
name: title-validator
description: Validate whether each sourced contact is a real decision maker, by title, company size, and relevance to the offer. Use after a contact pull lands in the base, to cut the noise before anything is spent on it.
type: skill
vertical: [list-building]
---

# Decision-maker check

A broad contact pull carries everyone; this decides who is actually worth reaching. You work through [[clayroots]]: the pull is a table in the base, and your verdict lands as a filter the base can hold, not as a rewritten list.

## The judgment

Score each contact on three things:

- **Title** against the offer buyer: economic buyer, champion, or noise.
- **Company size:** at firms under ~10 employees, keep both contacts when the second title is not entry-level, since both are likely decision makers. At larger firms, hold to the buyer persona.
- **Relevance:** does this person plausibly own or influence the problem the offer solves?

Flag borderline fits rather than dropping them silently; a human makes the final call on the flagged, because some borderline fits are real targets.

## The verdict is a filter

Express the cut as exact Airtable view filters composed from the fields the table already carries - Title keyword conditions, Seniority values - so a view isolates the unqualified without touching a row. A "does not contain" filter also sweeps in blank rows; handle the blank case explicitly. When a cut genuinely cannot be expressed by the existing fields, say so and name what it would take; never invent a field for it silently.

## Output

The contacts split into keep, cut, and review - the cut and review as their view filters, with a one-line reason on each cut and flag.