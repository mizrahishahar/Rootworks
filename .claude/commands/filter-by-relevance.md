# filter-by-relevance

Build the **Relevant** filter and its exact complement **Cut review** on one contacts table.

Loads `list-builder` (what relevance means, and what a decision-maker title looks like) and `views-poweruser` (the mechanics).

## Two gates, both required

- **Company gate** - the company qualifies: industry, size, platform, geography, per the client's `overrides` row.
- **Title gate** - match on **seniority tokens** (Founder, Chief, CTO, VP, Head, Director, Owner, President, Principal), never on domain nouns (Software, Data, Cloud, Platform, Tech), which every individual contributor carries. A domain noun may rank a row; it must never admit one.

Title alone always leaks: a perfect VP at a wrong-country company passes a title-only filter. That leak cost 38% of one client's sends.

## Rules

- Sample 20-30 real rows before writing a condition. Never filter against imagined data, and check what a column actually holds first: a text field holding `2-3` and `4+` makes `> 1` match nothing, silently.
- Overshoot, never undershoot. A borderline contact costs one send; a missed decision-maker costs the account. `manually_approved` keeps the exceptions, not a looser filter.
- Name the table back before touching it: base, table, id, row count.

## Done when

Relevant + Cut review = the table, exactly, counts stated. Then read Cut review and name what is wrongly being cut. That review is the point of the view.
