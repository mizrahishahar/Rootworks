Teaches: composing, verifying and reconciling one Airtable view so it is correct the first time, and what the tools genuinely can and cannot do.

# Views

A filter that is subtly off silently drops the wrong rows, or zeroes a segment with a clean-looking count. Everything here exists to catch that before the hand-over.

## What the tools do

- **Read the table's real schema** before any select-field filter, for the field's actual choice ids.
- **Sample real rows** (small page, scoped fields) before drafting any text-field condition.
- **Exact count for any filter:** the records tool with `pageSize: 1`, reading the total. Real, server-side, cheap.
- **List existing views by name** before proposing a new one.

## What no tool does

- **No view is created, edited or deleted through the API.** Every view is a filter handed over to be built in the UI.
- **No field is deleted through the API.** A field that should not exist is named for removal.
- **A view's own count cannot be read off the view.** "How many rows are in Relevant" is the same filter, run fresh.
- **No adjudication field is minted to make a view work.** A segment view filters on native fields the machines fill, so every future row self-sorts when it lands. A hand-stamped Verdict or Keep field freezes the segment: new rows arrive blank and vanish. If a split cannot be expressed on native fields, say so and hand over the choice.

## Composing and verifying, in order

1. The schema, once per table, for every select field the filter touches.
2. Sample actual text before writing a condition. A keyword list drafted from what titles "usually look like" is how a law society, a university and a parts supplier pass a title-only filter untouched.
3. Draft the filter as its true nested shape, as deep as the logic needs.
4. Decompose it for verification only: the query tool runs one flat level of AND/OR, so count each flat layer, and count an OR-group by its complement when it cannot be reached directly.
5. Spot-check real rows on both sides: 5 to 10 the filter keeps, 5 to 10 it drops, read for real.
6. For a set, sum every view's exact count against the parent's, exactly, before handing over.
7. Hand over in the SKILL.md format, verified count beside each row, the paste-ready sentence under it.

## The traps

- **Never match a select-field condition on typed text.** The stored value from the schema is what matches, exactly as written; typing what a label "should" say returns zero rows with no error.
- **Never sweep blank rows in by accident.** A `doesNotContain` condition matches blank rows too; state what happens to them.
- **Never treat a clean count as proof.** The spot-check exists because a count can be exactly wrong.
- **Never use `isNotEmpty` on a select field.** A select whose choice list carries a blank-named choice reads as non-empty on every row that holds it, so `isNotEmpty` returns the whole table with no error; it has killed a segment axis across 29,000 rows. Gate on explicit choice ids with `isAnyOf` / `isNoneOf`.
- **Never trust a stale table listing.** Re-read the schema before asserting a table or field does not exist.
- **Reuse a verified layer's count** instead of re-querying it.

## How a view is previewed

Every view is previewed twice, every time: once as a table row a person reads, once as a prompt Airtable's AI view builder executes. The two say the same thing in the same words.

**1. The table.** One row per view, the view's own parts as the columns, a real markdown table, never inside a code fence:

| Table | View | Who is in it | Filter | Sort | Fields shown | Size |
|---|---|---|---|---|---|---|
| People | CTOs at funded SaaS | technical decision-makers at software companies that raised money, with a verified email, never contacted | Where ALL of the following are true: `relevance` = 1. `Status` is done. `Messages Sent` is empty OR `Messages Sent` = 0. `Employees` is any of 51-200, 201-500. And where ANY of the following are true: `Title` contains CTO. `Title` contains Chief Technology. `Title` contains VP Engineering | Build Date, newest first | Name, Title, Company, Employees, Final Email, LinkedIn URL, Tag, Campaigns, Messages Sent, Last Contacted | 412 |

Under the table, one line per view when something needs saying: what it deliberately excludes (blanks in `Employees` are out), what it does not do yet.

- **Who is in it** is one plain sentence, so the reader knows what the view means without reading the filter.
- **Filter** is the tree as it is: "Where ALL of the following are true: A. B. And where ANY of the following are true: C. D." Subgroups in nesting order, exactly as the builder will hold them; never flattened into a comma list. Every row complete and standalone, never "same as above, plus".
- **Size** is the exact count from the method above.
- A set that partitions a pool closes with its reconciliation line under the table: the sum of the views against the parent's exact count.

**2. The prompt.** Under the table, one block per view, paste-ready, the view's name as its heading. It names the table, the view, the filter tree in the same words as the cell, the sort, and the fields to show:

> Create a grid view on the People table named "CTOs at funded SaaS".
> Show only records where ALL of the following are true: relevance is 1; Status is "done"; Messages Sent is empty or Messages Sent is 0; Employees is any of "51-200", "201-500"; and where ANY of the following are true: Title contains "CTO"; Title contains "Chief Technology"; Title contains "VP Engineering".
> Sort by Build Date, newest first.
> Show these fields: Name, Title, Company, Employees, Final Email, LinkedIn URL, Tag, Campaigns, Messages Sent, Last Contacted.

The builder rewrites a whole filter roughly one time in three: after it applies, read the tree it produced against the table row before trusting the count.
