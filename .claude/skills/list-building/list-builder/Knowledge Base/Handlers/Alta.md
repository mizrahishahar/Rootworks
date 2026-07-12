# Alta

**Kind:** contacts database, with native buying-signal and trigger sourcing. Opens a build on contacts, and uniquely sources people off live signals a static database cannot. You run the pull over the Alta MCP after the operator approves the stated cost. Alta is also the outreach destination for LinkedIn campaigns, so a build that opens here often stays here rather than exporting - but as a handler it conforms to the house CSV like any other.

## Query output
One of three shapes, chosen by how the audience is defined. How many is the scoping call ([[Scoping Queries]]):

- **Classic filter set** - structured filters over Alta's own contact database: company size, industry, revenue range, HQ location, technologies, funding stage; job titles (contains / exact / similar), seniority, department; a domain list to scope; email type. The direct analogue of a Supersoniq filter set.
- **Signal source** - an audience defined by activity or a trigger rather than firmographics: Social Signals (people who commented / reacted / shared on a specific post, creator, company, or up to six keywords) or Trigger Events (a live audience firing on one of the 17 buying signals, e.g. Job Change in the last 30 days). One signal per audience; layer ICP filters on top to keep it on-profile.
- **ABM company set** - company-first: Company Search, Company Lookalike from a seed domain, Google Map (local, by radius + business type), or a HubSpot company list; then a persona filter and Alta finds and enriches the people inside those accounts.

## CSV output
**One merged CSV per major pull** (one ICP, one signal, or one domain list; internal batching invisible), into the client's Reports folder, conformed to the house schema (`Output Interface.md`):

- Alta enriches natively - email, phone, LinkedIn URL, title and company - through a large third-party provider waterfall. A row needs only one identifier to resolve (email, LinkedIn URL, company domain, or name + company); Alta backfills the rest. So a companies-first or domains-only pull resolves to enriched contacts here without an external enrichment step.
- Because Alta enriches, a pull that will run inside Alta needs no verified-email gate - the platform re-finds and validates at send. Keep the verified marking only when the CSV leaves Alta for another channel.
- On a companies-first pull that also used discovery infographics, left-join them on `domain`, the infographics winning on company fields, per the house rule.

## Where it is strong

- **Buying signals as live audiences** - job change, funding, hiring, LinkedIn engagement, leadership change, and the rest of the 17. Sourcing people off a fresh trigger is the single thing Alta does that a static contacts database cannot, and it is the strongest opener a LinkedIn campaign can carry.
- **LinkedIn-anchored people, with the LinkedIn URL in hand** - the identifier a LinkedIn campaign actually needs, native to the pull.
- **Enrichment off a thin input** - hand it a domain list or a company set and it returns enriched decision-makers, so a build can lean on Alta for the contact data instead of a separate waterfall.

Where the people are not on LinkedIn (owner-operated, local, trades), Alta's LinkedIn-signal and enrichment coverage caps like any LinkedIn-anchored source; the fallback stays [[ContaGen]] on the operator's call.

## Authoring the query

- **Preflight and size before spend.** Read the live filter or signal values so a value does not silently zero out, and size the audience before any paid pull. Signal and trigger audiences run live and preview only a slice, not the full set - a trigger caps around 30 prospects per day per trigger, so read the shape, not a single number.
- **Breadth on seniority over exact titles**, as with any contacts pull, so real decision-makers are not dropped.
- **One signal per audience.** A Social Signals or Trigger Events pull carries a single signal; a second signal is a second audience, hence a second query. Refresh signal audiences often, they decay within weeks.
- **The audience source locks at draft.** An audience defined inside a campaign cannot change source after launch; an ongoing feed uses the webhook source or a reusable list, not a one-shot definition. Decide static vs. live at scoping.

## Known constraints (confirm at run time)

- **The `search_prospects` MCP path has been erroring** (a provider mismatch on the structured search) - confirm it runs before relying on it for a classic filter pull; native UI search is the fallback.
- **No first-class CSV-export tool over MCP.** Contacts are read through `list_persons` / `list_prospects` / `get_person`; a selection export in the UI caps at 1,000 rows while a filtered full-list export bypasses the cap. Assemble the house CSV from what the read returns.
- **Read is thinner than write.** Campaign internals do not read back over MCP; treat Alta as a source and a destination, not a mirror.

## Cost model

Alta bills enrichment and sourcing in platform credits, tracked in organization settings rather than a per-call price map like Supersoniq's. There is no free/paid split documented at the tool level here - size the audience, state the expected credit draw, and get the operator's yes before any pull, and confirm the live credit cost on the account before concluding a pull is affordable. Never call the operator's spend small.
