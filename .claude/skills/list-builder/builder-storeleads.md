---
type: waterfall
vertical: [list-building]
workflow-id: ATa6dDTrOileNCiz
form: https://n8n.flowroots.com/form/storeleads-supersoniq
---

# Storeleads -> Supersoniq -> Clayroots

E-commerce build with no CSV: the pull happens inside the automation, and one run lands both a Domains table and a Contacts table in the client base.

## Waterfall steps

1. Pulls store domains straight from [[storeleads]] by the form filters, best-ranked first, up to the cap, deduped across platforms and countries.
2. Lands a Domains table (companies, store intelligence, public emails, verification-ready) in the client [[clayroots]] base.
3. Pulls decision-makers at ALL the domains from [[supersoniq]].
4. Upserts on Contact Key, stamps RankInCompany, and lands the Contacts table beside the Domains table.

## Before the form

## The form

`https://n8n.flowroots.com/form/storeleads-supersoniq` - read the live fields per [[n8n]] before filling. The base ID comes from the Hub Clients registry ([[clayroots]]). App and technology filters take exact IDs, resolved via the [[storeleads]] lookups while filling. A blank filter dimension means all; ticking every band adds a floor that drops stores with unknown data, so prefer blank over tick-all.