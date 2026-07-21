---
type: waterfall
vertical: [list-building]
workflow-id: jJTD9xgbA0kKYqna
form: https://n8n.flowroots.com/form/contagen-supersoniq
---

# Contagen -> Supersoniq -> Clayroots

Contact waterfall for a domain list: two contact sources chained into one deduped, ranked Contacts table in the client base.

## Waterfall steps

1. Lands the [[contagen]] contacts from the uploaded CSV.
2. Pulls decision-makers at ALL the domains from [[supersoniq]] - every source queries every domain, since a company that gave one contact can still give different people.
3. Upserts every write on Contact Key (no doubles across sources), stamps RankInCompany per domain, and lands one Contacts table in the client [[clayroots]] base.

## Before the form

1. Scope the queries: one query per audience, each with one centre it describes specifically. Separate queries only for separate audiences with standalone volume and a genuinely different copy angle.
2. Write each query as a broad ICP description for [[discolike]]: free text, one paragraph, in the voice of the target homepage, with the firmographic filters beside it - employee range, geography, category anchor, representative seeds. Exclude by omission.

## The form

`https://n8n.flowroots.com/form/contagen-supersoniq` - read the live fields per [[n8n]] before filling. The base ID comes from the Hub Clients registry ([[clayroots]]); the contacts CSV field takes the [[contagen]] export the Operator adds. Targeting checkboxes default broad; untick only to narrow.