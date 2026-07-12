---
vertical: list-building
type: contact-source
owner: Claude
handler: contacts ingest (see clayroots tool)
---

# Supersoniq

## Description
Contact database, strong where buyers are on LinkedIn (corporate, GTM, funded, mid-market and up). Caps on owner-operated, local, and trades; route those gaps to ContaGen. Also the terminus for a company-discovery pull's domains, through the bridge.

## Query
A structured filter set: geography, headcount, function, a broad seniority floor. Pull broad, not by exact title: pull every plausible contact across the domains, then cut with title-validator. Filtering titles upfront shrinks the list and drops real buyers. No software or SaaS label exists; isolate the niche after the pull from `company_industry_tags`.

## Claude actions (MCP)
- Free: `get_key_info`, `count_contacts` (an estimate; a round number, especially 1000, means larger), `get_filter_values`, `match_companies`, `search_contacts` in `mode:preview`.
- Pull: `search_contacts` full (1 credit with the email, 0.5 naked; pull with the email when these people will be emailed).
- Bridge: `enrich_companies` (decision-makers from domains; batch ~200 domains per call).
- As needed: `find_email` / `verify_email`, `enrich_phone`.
- Never `search_hybrid` (collapses to near-nothing, still charges). Over the confirm threshold, `confirm:true`.

## Owner actions
Approve the spend. Upload the produced CSV to the contacts ingest form.

## Quality
After the pull, run the contacts through title-validator before segmenting. At sub-10-employee firms, keep both contacts when the second is not entry-level.

## To know
Field map to claudeschema: `first_name`/`last_name`/`full_name` -> Name, `job_title` -> Title, `seniority` -> Seniority, `linkedin_url` -> Social, `email` + `contact_email_status` -> Email/Verified, `company_domain` -> Domain, `company_name` -> Company, `company_industry_primary` -> Industry Groups, `company_staff_headcount` -> Employees, `company_revenue` -> Revenue Range, `contact_city/region/country` -> City/State/Country. Extra columns pass through.

## Automations
`SEGMENT SUPERSONIQ CONTACTS` conforms the pull to the base and lands the contacts table plus the domains-without-contacts split.
