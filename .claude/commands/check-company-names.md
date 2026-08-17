# check-company-names

Audit a table or view's company-name field for scrape corruption before it goes anywhere near copy — a broken value here reads as broken in the send.

$ARGUMENTS

## What corruption looks like

Not "the name is long" or "the name has a suffix" — those are real names, leave them. Corruption is when the field holds something that was never a company name to begin with: a scraped page title, an HTTP error page, a dev/staging label, a truncated fragment, or a bare domain artifact.

## Find it systematically, not by eyeballing

Eyeballing a list misses things twice. Run `contains` filters across the full pool (scoped to whatever's about to be used, not the whole table) for each of these signatures:

- `,` and `:` — page titles and taglines carry punctuation a name doesn't
- `.com` `.co.uk` (and any other TLDs in play) — domain leaked into the name field
- `–` (en-dash) — often marks a "Brand– brand.com" scrape artifact
- `Staging` `Moved` `http` `404` `www` `Error` `not found` — dev/error-page leakage
- a double space — encoding artifact

Each hit needs a look, not an automatic fix — some are real names with a comma ("Datacolor Ltd, Webstore UK"), most aren't.

## Fix by evidence, never by guessing

For every flagged row, pull that row's own `domain` and description/summary field. Derive the real name from what the site actually says about itself. Write it back, then read the write back to confirm it landed.

Do not force a fix when the evidence is ambiguous (e.g. the value matches its own domain exactly) — leave it and say so, rather than manufacturing a cleaner-looking guess.

## Done when

Every pattern search above returns nothing but confirmed-real names. Report the full list of what was flagged and what it was changed to, and name anything left alone on purpose with the reason. Zero found is a valid outcome — say so plainly.
