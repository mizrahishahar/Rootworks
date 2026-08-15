# initialize-clayroots-table

Bring a ClayRoots table to the standard: the fields the machines rely on, and the view chain everything downstream reads from.

Loads `views-poweruser`. The table itself is born by a builder machine (see `n8n/INDEX.md`); this brings it to standard afterwards.

## Fields

Confirm the spine exists before anything else: `Contact Key`, `Domain`, `first_name`, `last_name`, `Company`, `Email`, the waterfall set (`MV P0`, the finder tiers, `BB`, `Final Email`, `Status`, `Source`), `Build Date`, `Tag`. Missing spine means the builder wrote wrong; stop and say so rather than patching by hand.

Add `manually_approved` (checkbox) if absent. It is the rescue hatch for rows a filter cuts but a human keeps.

## The view chain, in this order

1. **Grid view** - default, untouched.
2. **Relevant** - built by `filter-by-relevance`, not here.
3. **Cut review** - the exact complement of Relevant.
4. **Relevant + Found** - Relevant AND `Status` is done AND `Final Email` is not empty. Everything downstream reads this one.
5. **Segment views** - built by `segment`, not here.

The API cannot create views. Deliver each view as an exact condition list for the Operator to build in the UI, in order, and say which ones already exist.

## Done when

The three counts are stated and checked: table total, Relevant + Cut review summing to it, and Relevant + Found. If they do not sum, the filters have a hole and the table is not initialized.
