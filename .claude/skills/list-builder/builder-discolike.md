---
type: waterfall
vertical: [list-building]
workflow-id: vTMckuoU61r9GXfa
form: https://n8n.flowroots.com/form/discolike-companies
---

# Discolike Domains -> Clayroots

Company-first build that ends on public and role inboxes: a qualified discovery CSV in, a verification-ready Domains table in the client base out.

## Waterfall steps

1. Takes the qualified companies CSV of a [[discolike]] discovery.
2. Cleans company names, cleans and blacklists the public emails, splits domains with public emails from domains without.
3. Lands a verification-ready Domains table in the client [[clayroots]] base, provenance stamped, firmographics passed through.

## Before the form

1. Scope the queries: one query per audience, each with one centre it describes specifically. Separate queries only for separate audiences with standalone volume and a genuinely different copy angle.
2. Write each query as a broad ICP description for [[discolike]]: free text, one paragraph, in the voice of the target homepage, with the firmographic filters beside it - employee range, geography, category anchor, representative seeds. Exclude by omission.

## The form

`https://n8n.flowroots.com/form/discolike-companies` - read the live fields per [[n8n]] before filling. The base ID comes from the Hub Clients registry ([[clayroots]]); the companies CSV field takes the qualified [[discolike]] export the Operator adds.