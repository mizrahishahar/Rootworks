# filter-by-relevance

Decide who on one contacts table is worth reaching, and encode that judgment as the **`relevance` formula**. Runs on a fresh table and on one whose rule has changed - the second is the common case.

Loads `list-builder` (what relevance means, the two gates, overshoot-then-cut, why the rescue lane may only ever widen) and `views-poweruser` (the mechanics, and how to get an exact count for free).

## What this command produces

A formula field named `relevance`, returning 1 or 0, **formatted as a checkbox**, created by this command through the API. Not a stamped tick, not a view filter - a formula.

**Everything that used to live as a complex view filter now lives here.** The nested condition trees, the keyword lists, the exclusions - all of it moves into one formula, once.

That choice is the whole architecture:

- **It reclassifies every future row for free.** These tables append; a hand-stamped checkbox would leave every new contact unjudged until someone remembered to re-stamp.
- **It is more expressive than a view filter, not less.** A filter only does `contains`. A formula does `REGEX_MATCH`, and `\b` word boundaries kill the leak that substrings cannot: `REGEX_MATCH({Title}, "(?i)\bproduct\b")` matches *Head of Product* and not *Head of Production*.
- **It collapses the chain.** `Relevant` becomes one condition - `relevance` is checked - and every view below inherits it.
- **The rule is stored.** Open the field and read what we decided. A stamped checkbox forgets.

## Two gates, both required

- **Company gate** - the company qualifies: industry, size, platform, geography, description.
- **Title gate** - the person is a buyer or a champion.

Title alone always leaks: a perfect VP at a wrong-country company passes a title-only filter. That leak cost 38% of one client's sends.

## The title is usually where the judgment lives

That is why a person reads before a formula gets written - the title is free text, and free text is where the nuance a rule keeps missing actually sits.

**But the company gate is a real instrument, not a formality.** `Industry Groups`, `Employees`, `Revenue Est Monthly`, `Country`, `Business Model`, `Plan`, `Tech Stack` all belong in the same formula when the offer only makes sense for some companies. Sometimes the whole rule is company-level and the title barely matters. Read the brief before assuming this is a titles job.

`Seniority` and `Department` are vendor guesses - lossy compressions of the title, made by someone who never saw the offer. One stamps *Executive* on "Product Designer" and on "Free Flexer Pro". Use them to slice cheaply or cross-check a hunch. Never let them decide.

**Census, not sample.** Twenty random rows is a lottery - it returns obvious keeps and obvious cuts, and the rows that decide a rule sit near the line.

- Group by `Title` and read the frequent values. The top ~50 titles usually cover most of the table.
- Check what a column actually holds before referencing it. A text field holding `2-3` and `4+` makes `> 1` match nothing, silently.
- Turn every candidate token into a measured hypothesis. An exact count is free - `list_records_for_table`, `pageSize: 1`, read `metadata.totalRecordCount`. Ask two things: how many rows does it admit, and how many does it admit that nothing else already catches? Read *those*. A token that uniquely admits 40 rows of which 30 are junk is a bad token, and one call proves it.
- Read the boundary: what the rule barely keeps, and what it barely cuts.

## Propose it before you build it

The rule is what everything downstream inherits, so it is approved before it exists. Draft it in the `views-poweruser` hand-over format - one row, every condition spelled out in full, with its exact count beside it:

```
| View | Airtable filters | Size | Notes |
|------|-------------------|------|-------|
| Relevant | {field} {op} {value}, AND/OR ... | {exact count} | what it deliberately excludes |
```

Show the size the rule would produce, and the size of its complement, **before** writing anything. Name what sits just outside it. Wait.

On approval, **create or update the `relevance` field yourself** through the API - `create_field` on a table that lacks it, `update_field` to change a rule that exists. Do not hand over formula text to paste; that is how a rule and a table drift apart.

## Writing the formula

```
IF(
  {manually_approved},
  1,
  IF(
    AND(
      REGEX_MATCH({Title}, "(?i)\b(founder|founding|ceo|chief executive|owner|president)\b"),
      NOT(REGEX_MATCH({Title}, "(?i)\b(devops|designer|sales|recruit)\b"))
    ),
    1,
    0
  )
)
```

- **`manually_approved` is OR-ed in at the top.** A formula cannot be hand-edited, so the rescue lane is the only way a human overrules it - and it must only ever widen.
- **`(?i)` for case**, `\b` on every token. Without boundaries `product` eats *production*, `tech` eats *biotech*, `ai` eats *chair*.
- **One precise token beats five loose ones.** `engineer` catches every `*Engineer` title *and* all `Engineering` leadership, where `product`, `tech`, `data`, `security`, `systems` each admit an entire department of individual contributors.
- **Exclusions wrap as `NOT(...)`, never as omissions.** The role the offer replaces must never be reached whatever else the title says. An exclusion phrased as an absence is not one - the row walks back in through any other token it carries.
- Company-gate conditions join the same `AND`. Reference the fields directly; do not rebuild them as text matching.

Airtable will not accept a formula field that references itself, and a syntax error saves as a broken field rather than refusing - read the field back after writing it.

## When the rule changes

A formula edit is instant and total: every row reclassifies the moment it saves, including rows in live campaigns.

State the delta before saving - how many flip in, how many flip out. Then the question that matters: **of the rows flipping out, how many have already been contacted?** (`Messages Sent` > 0, or a `Campaigns` link.) Those sends cannot be recalled, segments beneath them shift under running campaigns, and reported numbers move. Name them and hand the Operator the choice; narrowing a live list is their call.

Keep the previous formula in the field description before overwriting it. It is the only record of what the last rule was.

## Done when

`Relevant` + `Cut review` = the table, exactly, counts stated. A checkbox has two states, so this closes by construction - if it does not, a view's filter is wrong, not the field.

Then **read `Cut review` and name what is wrongly being cut.** That review is the point of the view. Rescue through `manually_approved`, or tighten a token - never by loosening the rule to catch one person.
