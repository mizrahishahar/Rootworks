# modify-knowledge-base

The Operator drops something in - a file, a pasted text, a call takeaway, a ruling, a correction, anything - and you work out what the knowledge base should look like now.

$ARGUMENTS or the attached content is the input.

## Understand first

Read what was dropped and answer for yourself: what is this, who is it about, and what does it change? Then say your read back in one line before touching anything.

## Route it to where it lives

- **About one client** → their KB Files rows. New document → new row with the right Type (`onboarding-form`, `overrides`, `qualification-prompt`, `product`, `research`, `intel`, `asset`). Updates an existing document → update that row, never a duplicate. An asset with a URL carries it in `Link`, full text in `Content`.
- **A behavioral delta for a client** → merged into their `overrides` row, not appended as a contradiction. If the new ruling conflicts with what is written, the new one wins and the old line is removed.
- **A fact or trap about a system** → appended to that system's file in `tools/`.
- **Expertise or a way of working** → the relevant skill or command file, edited directly (guided capability edits are allowed).
- **Numbers and claims**: only the Operator's confirmation marks a KB row `Verified`. If the dropped material contains numbers that contradict a Verified row, stop and ask which is true - never keep both.

One piece of knowledge, one home. If it seems to belong in two places, the substance goes to the primary home and the other gets a pointer.

## Done when

You state what was created, updated, or removed, where, and read back the key lines as they now stand. If anything was ambiguous, you asked instead of guessing.
