---
vertical: [list-building]
type: infrastructure
owner: Claude
---

# Storeleads

E-commerce store index across every platform (Shopify, WooCommerce, BigCommerce, Wix, and 300+ more). Companies only, no named people. The angle it owns: platform, installed apps, tech stack, and estimated revenue as targeting filters no other source has, plus store intelligence on every row (plan, app spend, Trustpilot, migrations, social growth) and public emails in `contact_info`.

## Actions (MCP)
- `search_domains` with `page_size: 1` - the response `total` is the free count. Iterate filters here until the segment is right.
- `search_domains` paged (cursor) for real pulls; always pass `fields`, default rows are enormous.
- `search_apps` / `search_technologies` - resolve names to the exact IDs the app and tech filters need.
- `get_domain` / `bulk_get_domains` (max 100) - enrich known domains.

## Spend gate
Subscription, no per-row spend; plan quotas exist. The free `total` count is the sizing gate.

## To know
Dedup by `tld1`, not `name`; one merchant runs many storefronts. Sales figures are monthly and in cents. Filter to Active stores.