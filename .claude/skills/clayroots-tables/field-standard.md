Teaches: the field law of the ClayRoots estate. Who owns which field, the columns that are banned, and the rules that keep tables from rotting.

# The field standard

The estate-wide law, established 2026-08-12 after the tables were merged and the writers reconciled. A field not on the standard gets flagged for deletion on sight, never quietly adopted.

## One owner per field

Every field has exactly one writer class. Two workflows creating or writing overlapping fields will always diverge, and the write boundary is the place to enforce a ban: strip nodes at the boundary, so no CSV or formatter can resurrect a banned column.

| Field | Owner |
|---|---|
| Identity and firmographics (names, Company, Title, Domain, employee and revenue fields, CSV extras) | The builders, at ingest |
| `Contact Source` | The builders: provenance, which source delivered this contact |
| `Email Source` | The verification lane: which tier found or judged the address |
| `Email`, `Final Email`, `Status`, provider and tier columns | The waterfall and verification lane |
| `relevance` | The relevance formula (a rule, not a writer) |
| `manually_approved` | The Operator's hand, only |
| `Tag` | Stamped at launch from the run's Tag, blank is valid, no fallback |
| Campaign fields (`Campaigns`, `Campaign Status`, `Messages Sent`, `Last Contacted`, `Bounce Reason`, `Synced At`) | The sync machines |
| `Deploy Error` | The deploy machine |
| `Created` | A CREATED_TIME() formula, never a writable date. A writable Build Date gets re-stamped by upserts and lies |

## The standing rules

- **`Source` does not exist.** It was two meanings in one name; `Contact Source` (provenance) and `Email Source` (tier) replaced it everywhere.
- **Only a definitive verdict may clear an address.** `invalid`, `disposable`, `undeliverable` may blank an email field; no other outcome may. A non-definitive verdict clearing addresses silently deleted real emails once.
- **Banned from contact tables:** `company_clean` (on new builds), `State Full`, `Score`, `Similarity`, `Valid`, `Start Date`, `Redirect Domain`, `Update Date`, `Run ID`, `Seniority Rank`, `query_name`, `MV` (bare, without a tier). CSV extras that are personalization variables still pass, by design.
- **Fix the writers before renaming a column.** A renamed column regenerates from its old name on the next run of any writer still carrying it; proven live within hours, twice.
- **Field lists that two lanes share must be byte-identical**, or the choice-set race mints junk select options.
- **Tables are append-forever.** Every rule here exists so a future row lands correctly without anyone remembering anything.

## When the standard bites

A table carrying an off-standard field, or a field with two writers, is a defect: name it, with the field id, and flag it for the Operator. Adopting the field, or quietly working around it, is how the last estate rot started.
