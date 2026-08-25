Teaches: composing, verifying, and reconciling Airtable views and filter sets so they are correct the first time, and what the Airtable MCP genuinely can and cannot do to a view.

# Views

A view built from this craft is correct before it is handed over: every filter verified, in the exact shape Airtable expects. Getting this wrong is expensive: a filter that's subtly off silently drops the wrong rows, or zeroes a segment outright with a clean-looking count.

## What the tools do

- **Read a table's real schema** (`get_table_schema`) before any select-field filter, for the field's actual choice IDs.
- **Sample real rows** (`list_records_for_table`, small `pageSize`, scoped `fieldIds`) before drafting any text-field condition.
- **Get an exact count for any filter** (`list_records_for_table` with `pageSize: 1`, reading `metadata.totalRecordCount`): real, server-side, cheap.
- **List existing views by name** (`list_views_for_table`) before proposing a new one.

## What no tool does, and how to act on it

- **No view is ever created, edited, or deleted through the API.** Every view is a filter handed to the Operator to build in the Airtable UI. The correct sentence is "here's the filter to build", never "I'll build the view".
- **No field is ever deleted through the API.** A field that shouldn't exist is named for the Operator to remove.
- **A view's own filter and row count cannot be read off the view.** "How many rows are in Relevant" is never a lookup; it is the same filter, run fresh, through `list_records_for_table`.
- **No adjudication field gets minted to make a view work.** A segment view filters on NATIVE fields the machines themselves fill, so every future row self-sorts the moment it lands. A hand-stamped Verdict or Keep field freezes the segment: new rows arrive blank and silently vanish from every view built on it. If a split genuinely cannot be expressed on native fields, say so and hand the Operator the choice.
- **No field is ever built to hold a filter's logic** under pressure to move faster. A live formula field is an unrequested write to the base, not a filter.

## Composing and verifying, in order

1. `get_table_schema`, once per table, for every select field the filter touches.
2. Sample actual Title and Description text before writing a single condition. A keyword list drafted from what titles "usually look like" is exactly how industry noise (a law society, a university, a forklift-parts supplier) gets through a title-only filter untouched.
3. Draft the filter as its true nested shape: `Where All of the following are true` wrapping `Any of`, exactly as Airtable's own builder groups conditions, as deep as the logic needs.
4. Decompose it FOR VERIFICATION ONLY. The query tool runs one flat level of AND/OR, so run each flat layer through an exact count and check every layer before trusting the whole. When an OR-group's exact count cannot be reached that way, count its COMPLEMENT (a flat AND of every condition negated) and subtract from the parent.
5. Spot-check real rows on both sides: pull 5 to 10 the filter would keep and 5 to 10 it would drop, read them for real.
6. For a segment set, sum every segment's exact count and check it equals the parent's exact count precisely, before anything is handed over.
7. Hand over the finished nested filter in the format `SKILL.md` fixes, verified count beside it.

## The traps

- **Never match a select-field condition on typed text.** The real stored value from the schema is what gets matched, exactly as written. Typing what a label "should" say is how a filter silently returns zero rows with no error.
- **Never sweep blank rows in by accident.** A `doesNotContain` condition matches blank rows too; state what happens to them.
- **Never treat a clean count as proof.** The spot-check exists because a count can be exactly wrong.
- **Reuse a verified layer's count** instead of re-querying it out of habit.
- **Never use `isNotEmpty` on a select field.** A singleSelect whose choice list contains a blank-NAMED choice reads as non-empty on every row that carries it, so `isNotEmpty` returns the entire table with no error. On `USA DTC - Contacts` this made `Employees` unusable across all 29,177 rows and killed a segment's staff-size axis outright. Gate on explicit choice IDs with `isAnyOf` / `isNoneOf`, pulled from `get_table_schema`, always.
- **Never trust a stale table listing.** A table read as absent from an earlier listing was live with 29,177 rows. Re-read the schema against the base before asserting a table or field does not exist.

Deploy views, the prioritized cascade they form, their naming, and their reconciliation craft live in `deploy-views.md`; the counting and verification methods above are what that file's arithmetic runs on.
