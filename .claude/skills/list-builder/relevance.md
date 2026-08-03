---
type: knowledge
---

# Relevance

Every pull carries everyone the query could plausibly return; this is the judgment that decides who's actually worth reaching. The verdict is two views that are exact complements: relevant, and the cut you can still rescue from. Composing and verifying both is [[views-poweruser]]'s job; this is the judgment about who belongs on the relevant side.

## Score each contact

- **Title** against the offer buyer: economic buyer, champion, or noise.
- **Company size.** At firms under ~10 employees, keep both contacts when the second title is not entry-level - both are plausibly decision-makers there. At larger firms, hold to the buyer persona.
- **Relevance.** Does this person, and the company they sit in, plausibly own or influence the problem the offer solves? Title alone misses company-level noise - a perfect title at the wrong kind of company (wrong industry, wrong business model) is still not relevant, and needs a company-level condition alongside the title one.

## Overshoot, then cut cheaply

Same law as the pull itself: broad in, narrow in the base. A borderline contact belongs on the relevant side by default - the cost of one irrelevant row in a segment is far lower than the cost of losing a real target to an over-tight filter.

## The rescue lane

Judgment on native fields is never perfect, and an over-tight filter loses real buyers silently - the failure you cannot see, because the row simply is not there. So the table carries a `manually_approved` checkbox, and it enters the relevance filter as an extra OR: a checked row is relevant whatever its title says.

It only ever widens. A hand-stamped field used to NARROW makes every future row arrive blank and vanish from the view; this one leaves the native conditions doing the work and only adds to them, so nothing silently disappears. That asymmetry is the whole reason it is allowed.

## The two views

Relevance lands as two views, exact complements of each other:

- **Relevant** - the relevance conditions, OR `manually_approved` is checked.
- **Cut review** - every relevance condition negated, AND `manually_approved` is unchecked.

`Cut review` exists so the cut can be read and rescued from, not archived. Ticking a row moves it out of `Cut review` and into `Relevant`, so the queue drains as it is worked and the Operator can stop when the remainder stops paying. It is a working view for the relevance pass, not part of the table's standing chain.

This reverses an earlier rule that the cut is never built. That held while the cut was a dead artifact; with a rescue lane it is a two-way surface, and nobody can rescue what they cannot see.

## When a cut genuinely can't be expressed

Say so and name what it would take, rather than inventing a field for it silently. A gap in the fields the table carries is a gap to name, not a shortcut to build around.
