Teaches: deciding who on a landed pull is worth reaching, encoding that as the relevance formula, and the two views that keep the cut honest.

# Relevance

Every pull carries everyone the query could plausibly return. This is the judgment that decides who is worth reaching, before anything is spent on them, and its translation into a rule the base applies to every future row.

## The judgment

- **Title** against the offer's buyer: economic buyer, champion, or noise.
- **Company size.** At firms under about 10 employees, keep both contacts when the second title is not entry-level; both are plausibly decision-makers there. At larger firms, hold to the buyer persona.
- **The company.** A perfect title at the wrong kind of company is still not relevant; a company-level condition rides alongside the title one when the pull let noise through.
- **Overshoot, then cut cheaply.** A borderline contact is relevant by default: one irrelevant row in a segment costs far less than a real buyer lost to an over-tight filter, the failure you cannot see because the row is simply not there.

## The rescue lane

Judgment on native fields is never perfect. So the table carries a `manually_approved` checkbox that enters the rule as an extra OR: a checked row is relevant whatever the formula says. It only ever widens. A hand-stamped field used to narrow makes every future row arrive blank and vanish; this one leaves the native conditions doing the work and only adds to them.

## The rule as a formula

The verdict lands as a formula field returning 1 or 0, never a stamped tick and never a view filter, because it reclassifies every future row for free, it is more expressive than a filter (`REGEX_MATCH` with `\b` boundaries matches *Head of Product* and not *Head of Production*), and the rule is stored where anyone can read it.

**Census, not sample.** Group by Title and read the frequent values; the top 50 usually cover most of the table. Turn every candidate token into a measured hypothesis: how many rows it admits, how many nothing else already catches. An exact count is free, and a token that uniquely admits 40 rows of which 30 are junk is proven bad by one call. Read the boundary: what the rule barely keeps and barely cuts. Vendor seniority and department fields are guesses; cross-check with them, never decide on them.

**The shape**, rescue lane on top, exclusions wrapped:

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

- `(?i)` for case, `\b` on every token: without boundaries `product` eats *production*, `tech` eats *biotech*, `ai` eats *chair*.
- One precise token beats five loose ones.
- Exclusions wrap as `NOT(...)`, never as omissions; an absence walks back in through any other token the title carries.
- Company conditions join the same `AND`.

Airtable saves a syntax error as a broken field rather than refusing: read the field back after writing it.

## The two views

Exact complements: **Relevant** (the formula = 1) and **Cut Review** (the formula = 0). The cut is read and rescued from, never archived; ticking a row moves it across, so the queue drains as it is worked. Relevant + Cut Review = the table, exactly; a mismatch means a view's filter is wrong, not the field.

## Changing a live rule

A formula edit is instant and total: every row reclassifies on save, including rows in live campaigns. State the delta first, how many flip in, how many out, and of those flipping out how many were already contacted; those sends cannot be recalled and reported numbers move. Narrowing a live list is a decision, named and waited on. Keep the previous formula in the field description before overwriting.

## How a relevance check is previewed

Twice, every time: as a table row with the rule's own parts as the columns, and as the formula, paste-ready. They say the same thing.

**1. The table.** One row per rule, a real markdown table, never inside a code fence:

| Table | Who is in | Who is out | Conditions | Relevant | Cut Review | Just outside the line |
|---|---|---|---|---|---|---|
| People | founders, owners and C-level at the company, plus anyone the Operator ticks | everyone else, and any title carrying devops, designer, sales or recruit even at C-level | Where ANY of the following are true: `manually_approved` is checked. Or ALL of: `Title` matches a whole word among founder, founding, ceo, owner, president, AND `Title` does not match a whole word among devops, designer, sales, recruit | 1,842 | 6,207 | 38 rows titled "Managing Partner" are out; 12 titled "Chief of Staff" are out; "President" also admits "Vice President" unless excluded |

- **Relevant** and **Cut Review** are exact counts, and they sum to the table exactly.
- **Just outside the line** names what the rule barely keeps and barely cuts, with counts, so the decision is made on what is really there.

**2. The formula.** Under the table, the field as it will be written, in a code block, ready to create or update through the API after the yes:

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

Wait for the yes before anything is written. After writing, read the field back, then the two views' counts against the table.
