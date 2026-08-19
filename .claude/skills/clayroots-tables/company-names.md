Teaches: auditing and fixing company-name corruption before a table's names go anywhere near copy, systematically and by evidence.

# Company names

A broken value in the company column reads as broken in the send. The cleaned value belongs in the human-facing company column itself, always, and in `company_clean` too when that field exists and is writable.

## What corruption looks like

Not "the name is long" or "the name has a suffix"; those are real names, leave them. Corruption is a value that was never a company name to begin with: a scraped page title, an HTTP error page, a dev or staging label, a truncated fragment, a bare domain artifact, or casing no human would send (`THE COTTON`).

## Find it systematically, not by eyeballing

Eyeballing a list misses things twice, and a `contains` filter is a crude proxy that undercounts (a filter once said 145 dirty where the real pass found 406). Run the signature searches across the pool about to be used, and treat each hit as a candidate, not an automatic fix:

- `,` and `:` (page titles and taglines carry punctuation a name doesn't)
- `.com`, `.co.uk`, and any other TLDs in play (domain leaked into the name field)
- `–` en-dash (often a "Brand– brand.com" scrape artifact)
- `Staging`, `Moved`, `http`, `404`, `www`, `Error`, `not found` (dev and error-page leakage)
- a double space (encoding artifact)
- all-caps or all-lowercase values longer than an acronym

Some hits are real names with a comma ("Datacolor Ltd, Webstore UK"); most aren't.

## Fix by evidence, never by guessing

For every flagged row, pull that row's own domain and description field, and derive the real name from what the site actually says about itself. Write it back, then read the write back to confirm it landed. When the evidence is ambiguous (the value matches its own domain exactly), leave it and say so rather than manufacturing a cleaner-looking guess.

The bulk instrument is the clean-names utility (an automation; it keys strictly on `Company`, writes only differing rows, so a re-run writes zero). Its casing gate deliberately leaves acronyms (`FUL`), mixed case (`iRobot`), and Hebrew alone. On tables where `company_clean` is an aiText field, know that rewriting `Company` regenerates those cells at a credit per changed row.

## How to show it

The audit report is one real markdown table, one row per flagged value: the value found, the evidence read, what it became (or "left alone" with the reason). Close with the counts: flagged, changed, left, and the searches that now return only confirmed-real names. Zero found is a valid outcome, said plainly.
