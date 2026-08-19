Teaches: shaping a DiscoLike pull. The ICP description as the semantic instrument, the structured filters as the precision instrument, and how the variance read sizes a TAM.

# DiscoLike queries

Company data always comes from DiscoLike; contacts never do. A pull is shaped by two instruments working together, and knowing which one owns what is most of the craft.

## The description is the semantic instrument

`discover-similar-companies` runs a semantic vector search over crawled website content. Inside whatever fence the filters draw, the prose decides what comes back and in what order.

So write the ICP description against **what a crawler can see on the site**, not against abstract business qualities. "Companies with strong engineering culture" matches nothing. "A pricing page with usage-based tiers, developer documentation, a status page, and job listings for platform engineers" matches something. Every sentence of the description should name observable evidence: pages, sections, product types, language on the site.

## Precision lives in the structured filters, not the prose

When a pull comes back polluted, the fix is the structured filters (Industry Group, Business Model, Digital Footprint, employee and revenue bands, geography), not another rewrite of the ICP prose. The prose ranks; the filters fence. Tuning the prose to exclude a company type the filters could fence out is fighting the wrong instrument.

## Read the results honestly

- **The Count is meaningless.** The number a query claims it matched is not a TAM read and never quoted as one.
- **The variance auto-stop is the TAM read.** The pull walks the ranked list until similarity variance says the centre is exhausted; where it stops is what the market actually holds for this centre. A pull that stops early is information: the centre is thin, and the move is a second centre or a wider fence, not a re-run.
- Seeds shape the centre: the best seed set is a handful of clients or closed-won lookalikes, not the biggest names in the category.

## How to show it

The deliverable is one paste-ready block per list: the ICP description as a blockquote, then the structured filters as labeled lines (one per filter, exact values), then **Seeds:** the seed domains. Where a filter is deliberately left open, say so on its line rather than omitting it.
