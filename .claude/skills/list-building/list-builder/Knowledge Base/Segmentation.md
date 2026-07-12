# Segmentation

Segmentation is not a step you do to a list. It **is** the campaign. How you slice the pool decides how many campaigns exist, what copy each one can truthfully say, and which variables have to be on every row. Get this right and the copy writes itself, because the segment already made the message specific.

## The one test

Every variable is one of two things, and the test is whether its value **changes the angle or just a word**:
- **Changes a word → copy personalization.** City, the company's niche subtype, an extracted detail. A merge field. Splits nothing.
- **Changes the angle → a segment.** A different value means a different audience, which means a different campaign with its own emphasis.

Both exist for the same reason — to make the copy specifically true for the reader. Real segmentation tends to out-pull broad-list AI personalization; use both, lean on whichever the niche and data support.

## The two moments of segment design

Segments are designed twice, deliberately:

1. **At query scoping.** The segments the query split already implies are set when the queries are authored — a residential pass and a commercial pass ARE two campaigns (one example of many; any query split works this way). Naming them early is what secures the variables: the pulls must carry what the intended segments will select on, so name those variables in the query spec rather than trying to bolt them onto the base later. Designing late is what forces expensive fixes.
2. **In the base.** The full segment set is drawn once the data is ingested and the real distribution is readable — volumes per slice, field fill-rates, what is actually reachable. The count is emergent; you never preset how many campaigns exist.

**One ICP equals one campaign.** A distinct company-profile x decision-maker is a distinct campaign. If two slices want genuinely different copy, they are two campaigns.

## The output: a filter table

The segmentation deliverable is a formatted table read off the ingested table — one row per segment: the segment (campaign) name, the base filters that select it, an estimated size, and notes (personalization available, cautions). The operator cuts the views from it and exports the CSVs. Flag in the table any filter that needs a field not yet on the rows; add a field only when one is genuinely missing, and never rebuild what the source columns already carry.

## The axes you slice on

No fixed set — read which axes actually separate this market into groups that need different copy:

- **Vertical / industry subcategory** — when the offer's value or language changes by vertical. Capture the specific subcategory, not the umbrella, so a line can be specifically true.
- **Company size / maturity** — at a one-to-ten-person company the owner is the operator; at larger firms personas and process language land. Size is a different audience, so size splits are campaigns.
- **Persona / title** — the decision-maker type; founder/owner status dominates functional title. Persona call-outs tend to land at larger companies, vertical call-outs at smaller ones.
- **Channel** — a named contact's personal inbox vs a published role/public inbox. Different copy, different campaigns. The channel split arrives from the ingest automations (contacts vs public-domains tables), not from a field you compute.
- **Geography** — usually a personalization variable, not a campaign axis, unless one geo stands alone.
- **Language** — a real campaign axis in non-English markets; the contact's own data (name, not company location) tells you who speaks it.

## As specific as possible, but only where volume supports it

The drive is maximum specificity; the brake is volume. A slice must be big enough to be its own campaign and read a real signal. Fold thin slices into a broader cross-vertical campaign rather than starve a standalone one; the grid (company axis x persona axis) shows which cells stand and which merge. Watch the depth asymmetry: some roles are structurally scarce per company, so a thin persona grows only by net-new companies, not by pulling deeper.

## Variants are not campaigns

Variants live inside a campaign to test angles against the same audience. Different copy to a different audience is a different campaign, never a variant. Reaching for "variants" when you actually have two audiences quietly corrupts the read on what works.

## Where the variables come from

The segmenting and personalizing variables should already ride in from the sources — the discovery data and its extraction pass, and the contact database's own columns (title, seniority, size, industry, geo). The ingest automations pass extra columns straight through, which is how variables reach the base. Design at scoping time so this is true; touch the base's fields only when a needed variable is genuinely missing.

Field conventions and the filter-table format live in `Output Interface.md`. Base mechanics live in [[ClayRoots]]. The how-many-queries judgment that pairs with the first moment lives in [[Scoping Queries]].
