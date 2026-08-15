# /relevance — build the Relevant filter on a table

Produce two filters on one ClayRoots contacts table: **Relevant** and **Cut review**, exact complements, with counts that sum to the table. Nothing else.

Load `list-builder` (it owns what relevance means) and `views-poweruser` (it owns the mechanics).

## Before you touch anything

Name the table back: base, table name, table id, and its row count. Wrong-table edits have come within one click twice; a plausible row count will not save you.

Read the client's `overrides` KB row. Targeting rulings (country, headcount, persona) live there, and every condition you write has to obey them.

## Build it

**Sample the real rows first.** 20-30 titles and the company columns. Never write a filter against imagined data. If a column's shape is unknown, check what it actually holds before you filter on it: a text field holding `2-3` and `4+` makes `> 1` match nothing, silently.

**Two gates, both required:**

- **Company gate** — the company itself qualifies (industry, size, platform, geography). Title alone always leaks: a perfect VP at a wrong-country company passes a title-only filter.
- **Title gate** — match on **seniority tokens**: Founder, Chief, CTO, VP, Head, Director, Owner, President, Principal. Never on domain nouns (Software, Data, Cloud, Platform, Tech) — every individual contributor carries those. A domain noun may *rank* a row; it must never *admit* one.

**Overshoot, never undershoot.** A borderline contact costs one send. A missed decision-maker costs the account. `manually_approved` is the rescue: a row the filter cuts but a human keeps stays in by checkbox, never by loosening the filter.

## Prove it before handing it over

- **Bullseye:** take a company you already won or would obviously want, and test it condition by condition. Thirty seconds. It has caught a digital-footprint floor and a country gate that would each have silently deleted a perfect-fit company.
- **Axis coverage:** does the filter carry a condition for every axis the build gates on? A pass rate means nothing while an axis is missing entirely.
- **The complement sums:** Relevant + Cut review = the table, exactly. Count each, add them, say the numbers out loud. Anything else means rows are falling through a hole.

## Hand off

The API cannot create views. Deliver the two filters as exact condition lists for the Operator to build in the UI, with the three counts (Relevant, Cut review, table) stated. Then read `Cut review` yourself and name what is wrongly being cut — that review is the point of the view, not decoration.
