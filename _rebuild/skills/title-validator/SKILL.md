---
name: title-validator
description: Validate whether each sourced contact is a real decision maker, by title, company size, and relevance to the offer. Use after a broad contact pull, to score and cut before the list ships.
type: skill
vertical: list-building
---

# Decision-maker check

A broad contact pull carries everyone; this decides who is actually worth reaching. Run every contact through it before the list is segmented.

## The judgment

Score each contact on three things:

- **Title** against the offer's buyer: economic buyer, champion, or noise.
- **Company size:** at firms under ~10 employees, keep both contacts when the second title is not entry-level, since both are likely decision makers. At larger firms, hold to the buyer persona.
- **Relevance:** does this person plausibly own or influence the problem the offer solves?

Flag borderline fits rather than dropping them silently; a human makes the final call on the flagged, because some borderline fits are real targets.

## Output

The contacts split into keep, cut, and review, with a one-line reason on each cut and flag.
