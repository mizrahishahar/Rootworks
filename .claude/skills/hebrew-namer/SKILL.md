---
name: hebrew-namer
description: Classify whether a contact takes a Hebrew greeting and write the Hebrew-script first name the copy greets on. Use after a contact pull has landed in the base, on any Hebrew-market build.
type: skill
vertical: [list-building]
---

# Hebrew greeting name

The Hebrew copy greets by first name in Hebrew script (היי דוד), and that token is load-bearing: a Latin or wrong name burns the lead on the first line. A broad contact pull lands names in Latin; this decides who is greeted in Hebrew and writes the name they are actually called. You work through [[clayroots]]: the pull is a table in the base, and your verdict lands as field values on the rows.

## The judgment

For each contact, from the Latin first name, the full name, and the country:

- **Hebrew speaker, or not.** An Israeli / Hebrew-speaking contact gets a Hebrew greeting. A foreign or non-Hebrew name, or a contact outside the Hebrew market, does not: leave the Hebrew name blank and let the greeting fall to the no-name / role-inbox variant. Greeting the wrong person in Hebrew is worse than not personalising at all.
- **The name they are actually called - not a transliteration.** Render the accepted Israeli spelling, never a phonetic letter-swap: Aner is ענר (not אנר), Uriel is אוריאל, Guy is גיא. Honour theophoric endings (-el → ‎-אל), ע vs א, plene/defective spelling, and the gendered form. When a Latin form is ambiguous between two real names, read the fuller name and the company before choosing.
- **Confidence.** Flag the low-confidence ones for a human call rather than shipping a guess. An uncertain name is a review, not a send - this is the one token that must be true.

## Output

Each contact with `hebrew_speaker` set and `first_name_he` written where Hebrew and blank where not, stamped back onto the build table in capped surgical batches, with the low-confidence names flagged for review.