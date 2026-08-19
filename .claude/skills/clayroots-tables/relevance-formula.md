Teaches: encoding a relevance verdict as the `relevance` formula field, the census method that grounds the rule, and how to change a rule that is already live.

# The relevance formula

The relevance judgment (who is worth reaching) lands in the base as a **formula field named `relevance`**, returning 1 or 0, formatted as a checkbox, created through the API. Not a stamped tick, not a view filter: a formula.

Everything that used to live as a complex view filter lives here, once. That choice is the whole architecture:

- **It reclassifies every future row for free.** These tables append; a hand-stamped checkbox would leave every new contact unjudged until someone remembered to re-stamp.
- **It is more expressive than a view filter.** A filter only does `contains`. A formula does `REGEX_MATCH`, and `\b` word boundaries kill the leak substrings cannot: `REGEX_MATCH({Title}, "(?i)\bproduct\b")` matches *Head of Product* and not *Head of Production*.
- **It collapses the chain.** `Relevant` becomes one condition, `relevance` is checked, and every view below inherits it.
- **The rule is stored.** Open the field and read what was decided. A stamped checkbox forgets.

## Two gates, both required

- **Company gate**: the company qualifies (industry, size, platform, geography, description).
- **Title gate**: the person is a buyer or a champion.

Title alone always leaks: a perfect VP at a wrong-country company passes a title-only filter. That leak cost 38% of one client's sends. Sometimes the whole rule is company-level and the title barely matters; read the brief before assuming a titles job.

`Seniority` and `Department` are vendor guesses, lossy compressions of the title made by someone who never saw the offer. Use them to slice cheaply or cross-check a hunch; never let them decide.

## Census, not sample

Twenty random rows is a lottery. The rows that decide a rule sit near the line.

- Group by `Title` and read the frequent values; the top ~50 titles usually cover most of the table.
- Check what a column actually holds before referencing it.
- Turn every candidate token into a measured hypothesis: how many rows does it admit, and how many that nothing else already catches? An exact count is free; a token that uniquely admits 40 rows of which 30 are junk is a bad token, and one call proves it.
- Read the boundary: what the rule barely keeps, and what it barely cuts.

## Propose before building

The rule is what everything downstream inherits, so it is approved before it exists. Draft it in the hand-over format `SKILL.md` fixes, one row for `Relevant` with every condition spelled out and its exact count, the complement's size beside it, and what sits just outside the rule named. Wait.

On approval, **create or update the field through the API** (`create_field` on a table that lacks it, `update_field` to change a rule). Never hand over formula text to paste; that is how a rule and a table drift apart.

## Writing the formula

The shape, with the rescue lane OR-ed in at the top and exclusions wrapped as NOT:

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

- **`manually_approved` rides on top.** A formula cannot be hand-edited, so the rescue lane is the only human override, and it must only ever widen.
- **`(?i)` for case, `\b` on every token.** Without boundaries `product` eats *production*, `tech` eats *biotech*, `ai` eats *chair*.
- **One precise token beats five loose ones.** `engineer` catches every `*Engineer` title AND all `Engineering` leadership, where `product`, `tech`, `data`, `security` each admit an entire department of individual contributors.
- **Exclusions wrap as `NOT(...)`, never as omissions.** The role the offer replaces must never be reached whatever else the title says; an exclusion phrased as an absence walks back in through any other token the title carries.
- Company-gate conditions join the same `AND`, referencing the fields directly.

Airtable will not accept a formula referencing itself, and a syntax error saves as a broken field rather than refusing: read the field back after writing it.

## Changing a live rule

A formula edit is instant and total: every row reclassifies the moment it saves, including rows in live campaigns.

- State the delta before saving: how many flip in, how many flip out.
- Of the rows flipping out, **how many were already contacted** (`Messages Sent` > 0, or a `Campaigns` link)? Those sends cannot be recalled, segments shift under running campaigns, and reported numbers move. Name them and hand the Operator the choice; narrowing a live list is theirs to call.
- Keep the previous formula in the field description before overwriting. It is the only record of the last rule.

## Done when

`Relevant` + `Cut review` = the table, exactly, counts stated; a checkbox has two states, so this closes by construction, and when it does not, a view's filter is wrong, not the field. Then read `Cut review` and name what is wrongly being cut. Rescue through `manually_approved`, or tighten a token; never loosen the rule to catch one person.
