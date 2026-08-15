# spintax

Add spintax to an approved sequence, without touching its meaning.

Loads `cold-email-copywriter`. Runs on a campaign, after the copy is approved and before it deploys.

## The shape

- **Three options to a slot.** Two is thin, one is a pin (see below).
- **two (min) to four slots per email.** One spin is decoration: the body still lands byte-identical on every send.
- **Phrase-level, never function-word.** `Hey|Hi|Hello` and `fast|quickly` are junk and have been rejected before. Spin clauses, not particles: the result, the reason, the ask, the qualifier.
- **Name every slot for what it does** - `the build`, `the ask`, `the negation`, `the qualifier`, `the result`, `the CTA`. The Operator edits slots by name, so an unnamed slot is an unreviewable slot.
- **A pinned slot is one option.** When the Operator says a line stays fixed, it leaves the table and joins the never-spun list. Do not argue it back to three.

## Never spin

Numbers. Names. The guarantee. The offer sentence's meaning. The meaning of the CTA. Any P.S. Any phrase carrying a term being tested this round. Anything the Operator pinned.

A spin that shifts meaning is worse than no spin.

## The checks - every option, before it is offered

This is the contract. An option that has not passed all six has not been written yet.

1. **Substitution.** Render the option inside its full sentence and read the whole sentence. Not the option alone.
2. **Grammar lock.** If the host sentence sets up a construction, every option must satisfy it. `If we could X, would this be worth sharing more?` is a conditional - so every option in that slot begins with *would*. `open to hearing more about it?` reads fine alone and is broken English in the slot.
3. **Antecedent.** No option introduces a pronoun with nothing to point at. `teams without a full infra team on it` - on what?
4. **Repetition.** No option doubles a noun already in the sentence. `teams carrying production infra without a full team on it` reads as team-team.
5. **Register.** Same plainness as the base. Do not reach for a fancier verb to manufacture difference - `send it across`, `send it through` are worse than `send it over`, not different from it.
6. **Distinctness.** Genuinely another way of saying it, not a synonym swap. If options 2 and 3 are option 1 with a word moved, the slot has one option.

Where a word is load-bearing, it appears in **all three** options. If the ask is for feedback, every option says feedback.

## Merge variables

**Never nest a merge variable inside `{{random}}`.** No campaign on our senders does it and it has never been tested. If every option for a slot contains a variable, that slot does not get spun - restructure the sentence so the variable sits outside the spin, or leave the slot fixed and say so.

## How to show it

Four blocks, in this order. The Operator reviews copy and spintax separately, so never mix them.

**1. The sequence, clean.** No spintax inline. Where one body runs against several subjects, stack the variant lines above the body they share:

```
**Variant A**  ·  *body A*  ·  *Subject:* your cloud costs
**Variant C**  ·  *body A*  ·  *Subject:* {{first_name}} <> Sean

> the body, once
```

**2. A slot table per email.** Base first, so the default read is obvious:

```
| Slot | Option 1 (base) | Option 2 | Option 3 |
|---|---|---|---|
| the build | ... | ... | ... |
| the ask | ... | ... | ... |
```

**3. The never-spun list.** One line, everything fixed, named.

Add a **spam check** line when the copy was revised for it: which trigger words are gone, confirmed absent from bodies, P.S. lines *and* every spintax option.

**4. The deploy-ready sequence, spintax inline.** `{{random|a|b|c}}` in place, one block per variant, ready to paste. This is the handover artifact: `deploy-to-plusvibe` never invents copy, so whatever this block says is what sends. Blocks 1-3 are for review, block 4 is for the sender, and they must say the same thing.

## Done when

The sequence is shown clean, every slot is tabled and named, the never-spun list is stated, the deploy-ready block is produced, and every option has been substituted into its sentence and read. If an option was not rendered, it was not offered.
