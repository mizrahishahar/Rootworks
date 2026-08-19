Teaches: encoding an approved relevance verdict as the `relevance` formula field, grounding it in a census of the real rows, and changing a rule that is already live. The judgment of who is relevant is made in the list craft; this is its translation.

# The relevance formula

The verdict lands in the base as a **formula field named `relevance`**, returning 1 or 0, formatted as a checkbox, created through the API. Not a stamped tick, not a view filter: a formula, because

- **it reclassifies every future row for free** (these tables append; a stamped checkbox leaves every new contact unjudged),
- **it is more expressive than a view filter** (`REGEX_MATCH` with `\b` word boundaries matches *Head of Product* and not *Head of Production*; a filter only does `contains`),
- **it collapses the chain** (`Relevant` becomes one condition every view below inherits),
- **the rule is stored** (open the field and read what was decided).

## Census, not sample

The rule is grounded in the table's real rows, not in what titles usually look like. Twenty random rows is a lottery; the rows that decide a rule sit near the line.

- Group by `Title` and read the frequent values; the top ~50 usually cover most of the table.
- Check what a column actually holds before referencing it.
- Turn every candidate token into a measured hypothesis: how many rows does it admit, and how many that nothing else already catches? An exact count is free, and a token that uniquely admits 40 rows of which 30 are junk is proven bad by one call.
- Read the boundary: what the rule barely keeps and barely cuts.
- `Seniority` and `Department` are vendor guesses; use them to cross-check, never to decide.

## Propose before building

The rule is what everything downstream inherits, so it is approved before it exists: one row in the SKILL.md hand-over format, every condition spelled out, exact count beside it, the complement's size, and what sits just outside the rule named. Wait. On approval, **create or update the field through the API** (`create_field` / `update_field`); never hand over formula text to paste, which is how a rule and a table drift apart.

## Writing the formula

The shape, rescue lane on top, exclusions wrapped:

    IF(
      {manually_approved},
      1,
      IF(
        AND(
          REGEX_MATCH({Title}, "(?i)\b(founder|founding|ceo|owner|president)\b"),
          NOT(REGEX_MATCH({Title}, "(?i)\b(devops|designer|sales|recruit)\b"))
        ),
        1,
        0
      )
    )

- **`manually_approved` rides on top**: the only human override, and it only ever widens.
- **`(?i)` for case, `\b` on every token.** Without boundaries `product` eats *production*, `tech` eats *biotech*, `ai` eats *chair*.
- **One precise token beats five loose ones.** `engineer` catches every `*Engineer` title and all `Engineering` leadership; `product`, `tech`, `data` each admit a whole department.
- **Exclusions wrap as `NOT(...)`, never as omissions**; an exclusion phrased as an absence walks back in through any other token the title carries.
- Company-gate conditions join the same `AND`, referencing the fields directly.

Airtable will not accept a formula referencing itself, and a syntax error saves as a broken field rather than refusing: read the field back after writing it.

## Changing a live rule

A formula edit is instant and total: every row reclassifies on save, including rows in live campaigns. State the delta first (how many flip in, how many out), and of the rows flipping out, **how many were already contacted** (`Messages Sent` > 0, or a `Campaigns` link): those sends cannot be recalled and reported numbers move, so narrowing a live list is the Operator's call, named and waited on. Keep the previous formula in the field description before overwriting; it is the only record of the last rule.

## Done when

`Relevant` + `Cut review` = the table exactly, counts stated (a checkbox has two states, so a mismatch means a view's filter is wrong, not the field). Then read `Cut review` and name what is wrongly being cut: rescue through `manually_approved` or tighten a token, never loosen the rule to catch one person.
