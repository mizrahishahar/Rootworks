# segment

Split one ready pool into the campaigns it will actually be sent as, and build those views.

Loads `list-builder` (whether to split at all, and on what axis) and `views-poweruser` (mechanics, exact counts, reconciliation) and `conventions-manager` (naming).

## Start from the brief, not the fields

**Listen to the context the Operator gives you** - the offer, the angle being tested, which campaigns already exist, what they want to learn. A segment set drawn from field values alone produces slices nobody can write copy for.

If the brief does not say, ask before slicing. The count of campaigns is emergent, never preset.

## Two conditions for any split, both required

- **Size** - big enough to stand as its own campaign and read a real signal. Fold thin slices into a broader one rather than starve them.
- **A reason** - the copy can now say something genuinely new to that audience. **If you cannot state the reason in a sentence, it is not a segment.**

The test for any field: does its value change the *angle* or just a *word*? Changes a word - it is a merge field inside one campaign. Changes the angle - it is a different audience, and it gets its own campaign.

## Where the angles hide

Read both, and expect the answer to come from the second more often than people assume.

**Titles** - persona and decision-maker type. Founder or owner status dominates functional title. Persona call-outs land at larger firms; below that, industry language lands harder.

**Company fields** - `Industry Groups`, `Employees`, `Revenue Est Monthly`, `Plan`, `Tech Stack`, `Business Model`, `Store Age Years`, `Trustpilot Rating`, `Country`, `Infra Employees`. This is usually where the sharp angle is, because it is what lets a first line be *specifically* true. The subcategory one level below the obvious category is the cheapest high-leverage split there is.

Group by a candidate field and read its real distribution before proposing a split on it. A field with 80% blanks is not an axis.

## The gateway fence - optional, and never a segment

**Check first: does this table carry `MX Provider`, and is it populated?** No field, or mostly blank - skip the fence entirely and say so. It is an option, not a step.

If it is there, the fence splits by *where a send can safely go*, not by what the message says:

- **Gateway** - `contains` any of: `proofpoint`, `barracuda`, `mimecast`, `sophos`, `mailroute`, `spamhero`, `appriver`, `spamexperts`. Verified in real data; the canonical list lives in `list-builder/segmentation`.
- **Sendable** - **NOT gateway.** Never an allow-list of known-good providers: `office365.us`, `amazon`, `fastmail`, `infomaniak`, `hostinger` and self-hosted MX are all real sendable values, and an allow-list silently drops every provider it has not heard of.

Rules that make it a fence rather than an audience:

- Drawn **per segment**, not once over the pool. Every segment gets its gateway slice and its exact complement.
- **Same copy on both sides.** Different copy means a deliverability fence has been confused with an audience.
- The gateway slice gets its own sending-tool campaign so its bounce rate reads in isolation and only it gets paused when bounces climb.
- Suffix ` - Gateway`, always last, after the playbook.
- **A slice under roughly 2-5% is too thin to read a bounce signal.** Raise it, do not quietly cut it - whether it earns the split is the Operator's call.

## Naming

`{YYYY-MM-DD} {A|B|C} - {Segment descriptor}` - the date of the build, a letter, and a descriptor that matches the campaign subfolder and the sending-tool campaign it feeds. Every segment carries the date; an undated segment reads as standing infrastructure when it is one build's deploy unit.

## Done when it reconciles

**Every segment's exact count must sum to the parent exactly.** An overlap is a double-send; a gap is a qualified lead that ships nowhere. State every count and the parent's, and show the sum.

Build the set so it closes by construction rather than by luck:

- One lane carries the positive test, the last carries its exact negation.
- The final bucket on a splitting axis is a **catch-all** - `is not 0 AND is not 1`, never an enumerated `2-3, 4+` - so a value nobody anticipated, or a blank, still lands somewhere.
- Use the same field list in both directions. Two lists that are merely similar produce orphans: rows that pass the parent on a token the segments do not recognise, land nowhere, and are never sent. Three hid in a 662-row feed until the sum was checked.

When it does not close, the gap is nearly always one of three things: a segment gated on a field the parent does not gate on, a bucket that excluded blanks, or two lists that were supposed to be one list.

Report the set as a `views-poweruser` hand-over table - every condition spelled out in full per row, never "same as above, plus" - with each exact count beside it.
