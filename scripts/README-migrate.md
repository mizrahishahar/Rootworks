# migrate-client.js

One-time, watched, reversible move of a client base's legacy list tables into the two tables of List Building 2.0: `Companies` (one row per domain) and `People` (one row per contact, linked to its company). The design it serves is `Flowroots/Operations/List Building 2.0.md` in the vault, section Migration.

The script never deletes or renames a legacy table. Freezing the old tables under a prefix and deleting them two weeks later is a manual act, after the new tables are verified by cell values.

## What it does

| Legacy table shape | Detected by | Lands in | Upsert key |
|---|---|---|---|
| Domains-shaped | has `Domain`, no `Contact Key` | `Companies` | `Domain`, lowercased and trimmed |
| Contacts-shaped | has `Contact Key` | `People`, plus a `Companies` row per domain when none exists | `Contact Key`, rebuilt as the builders build it: cleanFirst + cleanLast + domain, lowercased |

Everything else in the base is skipped and listed in the report: `Companies`, `People`, `DNC`, the two mirrors (`<Client> Campaigns`, `<Client> Signals`), any table with neither column.

Merge rule when several legacy rows land on one key: first non-empty value wins per field (live rows first, then Domains-shaped tables, then contact-derived company data), `Campaigns` and `Signals` links union, `Signal At` takes the latest. A live row is only ever gap-filled, never overwritten.

Guards: the target schema is read first and every key the target lacks or cannot take (formula, lookup, count, rollup, `Build Date`) is dropped and counted. Select values are validated against the target's choices; nothing is typecast, so no option is ever minted. `--apply` refuses while a data-bearing key would drop, a `Campaigns` id does not resolve in the mirror, or an intent table has no `Signals` row, unless `--allow-loss` is passed.

Accepted drops (ruled 2026-09-02): the columns List Building 2.0 lists under "Dropped from company rows" and "Dropped from person rows" (`State Full`, `segment`, `query_name`, `ingested_at`, `Update Date`, `Start Date`, `Score`, `Similarity`, `company_clean`, `Run ID`, legacy `Build Date`, `Connections`, `Seniority Rank`, `Verified`, `batch_id`, `icp_fit`, and on person rows the company facts that now arrive by lookup: `City`, `State`, `Country`, `Zip`, `Street`, `Industry Groups`, `Employees`, `MX Provider`, `Description`, `Keywords`, `Business Model`, `Revenue Range`) are read, their non-empty cells counted under `acceptedDrops`, and never block. Anything else that would drop still blocks.

Three legacy readings, ruled 2026-09-02: the legacy `Source` column is the email lane's source (`P0`..`P3`, `none`) and maps to `Email Source` on both targets when it holds one of those values, to nothing otherwise, and never to `Contact Source` (which comes only from a legacy `Contact Source` column). `Employees` spelled `1 to 10` and `11 to 50` band to `1-10` and `11-50`; `51 to 250` and `251 to 1,000` straddle two bands and stay invalid, the cell empty rather than mislabelled.

## Auth

The Airtable personal access token is read from `AIRTABLE_API_KEY`, else `~/.config/rootworks/airtable-token` (one line), else `~/.config/rootworks/airtable-api-key` (the file `hub-pull.js` already reads). Scopes needed on the client base: `data.records:read`, `data.records:write`, `schema.bases:read`. The key never enters the repo and is never printed.

## Run dry

```
node scripts/migrate-client.js --base appXXXXXXXXXXXXXX
```

Reads every eligible legacy table, the live `Companies` and `People`, and both mirrors. Computes the whole plan and writes nothing. Prints a summary and writes `scripts/out/migrate-<base>-<timestamp>.json`.

Useful options:

| Option | Use |
|---|---|
| `--tables "A,B"` | only these legacy tables (names or ids); `--tables none` selects no legacy table at all (only meaningful with `--link-live`) |
| `--link-live` | also plan the live rows themselves: the in-place conversion finisher, see below |
| `--signal "<legacy table>=<rec id or mirror Name>"` | pin the `Signals` mirror row for an intent table; otherwise resolved by the mirror's `Target Table`, then by name |
| `--limit 50` | read at most 50 rows per legacy table; with `--link-live`, also link at most 50 People and backfill at most 50 `Domain Source` cells: the smoke-test size |
| `--dump-plan` | also write every planned create and update to `-plan.jsonl` |

## --link-live: finishing an in-place conversion

When a base's append-era primaries are converted in place (a Contacts-shaped table renamed to `People`, a Domains-shaped table renamed to `Companies`, the register's missing fields added on top), record ids, views and share links survive, but two things are empty on every live row: the new `Companies` link on People and the new `Domain Source` on Companies. The legacy path treats live rows as already correct, so it never fills them. `--link-live` does, in the same run, dry by default, written only with `--apply`, logged to the same undo file.

What it plans, in this order, before any legacy table is read:

| Step | Rule |
|---|---|
| 1. `Domain Source` on live Companies | Only where the cell is empty and the row itself carries evidence. A non-empty legacy `query_name` (only the DiscoLike builder ever wrote it) or a `Source` value naming DiscoLike sets `DiscoLike`; a non-empty Storeleads column (`Plan`, `Store Age Years`, `Key Apps`) sets `Storeleads`; otherwise the cell stays empty and is counted under `leftEmpty.noEvidence`. The value must already be a choice on the select; a missing choice is counted under `leftEmpty.choiceMissing` and skipped, never minted |
| 2. `Companies` on live People | Every live People row whose link is empty is linked to the Companies row with the same normalized Domain (lowercased, trimmed, scheme, `www.` and path stripped). A filled link is never overwritten. A row with no Domain is counted `domainless` and left alone |
| 3. Companies rows for People-only domains | A People domain with no Companies row gets one, carrying `Domain`, `Company` (the first non-empty seen across that domain's People rows, uncleaned; Clean Fields runs later) and `Tag` (first non-empty), nothing else. `Domain Source` stays empty on those rows: no door landed them |

Live rows the key seeding would skip (no `Contact Key`, a second row on the same key, a second row on the same domain) are still linked or backfilled; the report counts them as `unkeyed`, `duplicateKeys`, `duplicateDomains`.

Legacy tables in the same run merge into the Companies rows `--link-live` creates instead of creating their own, and a live row's own evidence outranks what a legacy table would infer for its `Domain Source`. The legacy tallies (`companies.planned`, `people.planned`, `reconciliation`) count legacy-fed rows only; rows touched by `--link-live` alone are counted under `linkLive`.

The report gains a `linkLive` key:

| Key | Read it as |
|---|---|
| `linkLive.people` | `liveRows`, `alreadyLinked`, `newlyLinked` (split `linkedToLive` / `linkedToCreated`), `domainless`, `unkeyed`, `duplicateKeys`, `beyondLimit` |
| `linkLive.companies` | `liveRows`, `created` (with up to twenty `createdDomains`), `domainless`, `duplicateDomains`, `droppedKeys` (a `Company` or `Tag` the target cannot take; this blocks apply like any drop) |
| `linkLive.domainSource` | `backfilled` per value, `evidenceHits` per deciding column, `alreadyFilled`, `leftEmpty` per reason (`noEvidence`, `choiceMissing` per value, `fieldUnwritable`, `beyondLimit`), `unrecognizedSourceValues` (`column=value` pairs seen on rows left empty, so a rule too narrow shows itself), `evidenceColumns` actually found on the table |
| `linkLive.written` | apply only: `peopleLinked`, `companiesCreated`, `domainSourceBackfilled` per value, from what actually landed |

Undo covers it with no new shape: the created Companies rows sit in `created.Companies`, the linked People rows in `updated.People` with `prior: { "Companies": null }`, the backfilled rows in `updated.Companies` with `prior: { "Domain Source": null }`. Undo clears the link (to `[]`) and the select (to empty).

### Move PLNR, the in-place conversion order

| Step | Act |
|---|---|
| 1 | Rename `General Moving Companies in US / CA - Domains` to `Companies` and `General Moving Companies in US / CA - Contacts` to `People` |
| 2 | Add the register's missing fields on both: the `Companies` link on People, `Domain Source` (single select with the four choices) on Companies, the lookups, the sync fields, `Build Date` as CREATED_TIME |
| 3 | `node scripts/migrate-client.js --base appSTTKOc9Afqer9d --link-live --tables none` and read `linkLive` in the report: `newlyLinked` plus `alreadyLinked` plus `domainless` should equal `liveRows`, `leftEmpty.choiceMissing` should be empty |
| 4 | The same with `--apply`, smoke-test size first (`--limit 50 --apply`, verify, `--undo`), then in full |
| 5 | Verify by cell values: open People, a row whose `Companies` now resolves, its lookups filled; open Companies, a row created for a People-only domain (filter `Domain Source` empty and `Build Date` today), a row backfilled to `DiscoLike` beside its `Source` cell |
| 6 | Then the legacy tables: the twelve dated build tables through the normal dry, smoke-test, apply, verify path below |

## Read the report

Top of the report, in order of importance:

| Key | Read it as |
|---|---|
| `guards` | `blocked: true` means `--apply` will refuse; `reasons` says why |
| `targets.*.missingRegisterFields` | register core fields the scaffold still lacks. Anything in the email lane or the sync set here means that data would drop |
| `droppedKeys` | per target, the keys that would be dropped and how many non-empty values sit in them, accepted drops excluded. Must be empty before apply, or consciously overridden |
| `acceptedDrops` | per target, the non-empty cells left behind on purpose in the columns ruled out of the register (list above), per column. Informational, never blocks; the per-table copy is `legacy[].acceptedDrops` |
| `invalidValues` | values the target's select or number field cannot take, per `field=value`, with counts. These are dropped one cell at a time; the row still lands |
| `reconciliation` | `uniqueDomainsIn == accounted` and `uniqueKeysIn == accounted`. A mismatch is explained in `note` |
| `legacy[]` | per table: rows read, new versus merged, collisions, unkeyed rows (with record ids), key drift, unresolved `Campaigns` ids, carried keys, three sample mapped rows |
| `signals` | which intent table resolved to which mirror row |
| `linkLive` | with `--link-live`: the live-row plan, see above |
| `people.withoutCompaniesRow` | contacts with no domain; they land without a `Companies` link |
| `companies.tagCollisions` | domains that carried two different Tags; the first wins, the count is here |

Walk the samples. Open one legacy row and its sample side by side; the mapped fields are what will be written.

Two things that look like errors and are not:

| Seen | Meaning |
|---|---|
| `Companies: ["@new:acme.com"]` in `-plan.jsonl` | the People row links to a Companies row this run will create; the placeholder becomes the real id at write time |
| `reconciliation.people.ok: false` with `keyDrift > 0` | a legacy row whose name rebuilds to a different key than its stored `Contact Key` (a `Doe, John` style name) was folded into the row its legacy key names. Rows folded, not rows lost; the per-table `keyDrift` count says how many |

## Apply

```
node scripts/migrate-client.js --base appXXXXXXXXXXXXXX --apply
```

Same read and plan, then a 5 second banner, then the writes: Companies creates, Companies updates, People creates, People updates. Batches of 10, at most 5 requests per second, 429 backed off 30 seconds, 5xx retried with backoff. A progress line every 500 rows.

Every write is logged as it lands to `scripts/out/migrate-<base>-<timestamp>-undo.jsonl` (one line per batch) and consolidated at the end into `-undo.json`. If the run stops on an error, the partial log is still complete; rerun to resume (the plan is recomputed from live state, so nothing is written twice) or undo.

The recommended first apply on a base is a smoke test: `--limit 50 --apply`, verify by cell values in Airtable, then `--undo` it, then run the full apply.

Verify by cell values, never by the counts alone: open `Companies`, filter on a Tag that only the legacy table carried, check the link to `People`, the lane, a `Campaigns` link; open `People`, check `Companies` resolves, `Contact Key` matches a legacy row.

## Undo

```
node scripts/migrate-client.js --undo scripts/out/migrate-<base>-<timestamp>-undo.json
node scripts/migrate-client.js --undo scripts/out/migrate-<base>-<timestamp>-undo.json --apply
```

Dry by default: prints what it would delete and restore. With `--apply`: deletes every record the run created (People first, then Companies) and restores every updated record's prior values for exactly the keys the run changed (empty before means cleared now). Writes `<undo file>-result.json`. The `.jsonl` log is accepted too, for a run that stopped before consolidating.

## Order agreed with the Operator

| Step | Base | Note |
|---|---|---|
| 1 | Move PLNR, `appSTTKOc9Afqer9d` | smallest; the two primaries converted in place, then `--link-live`, then the twelve dated tables; prove the script end to end here, including one undo |
| 2 | Dave, `appyhuYMwaGUdIs3z` | six legacy tables, `B2B Tech 11-50 US - Contacts` alone is 30,634 rows; one intent table, `US Tech - Infra Hiring (Intent)`, needs its `Signals` row |
| 3 | Adelante, `appmOqpv7dedSA9RA` | about 131,800 rows; at 5 requests per second the write phase runs roughly 45 minutes, keep the terminal open |

Per base: scaffold `Companies` and `People` to the register (including the email lane and the campaign sync fields on both), run dry, read the report until `droppedKeys` is empty and `guards.blocked` is false, smoke-test apply with `--limit 50`, verify, undo, full apply, verify by cell values, then freeze the legacy tables by hand.

## Outputs

All under `scripts/out/`, git-ignored by a `.gitignore` the script drops there on first run (reports and undo logs carry record values).

| File | When |
|---|---|
| `migrate-<base>-<ts>.json` | every run |
| `migrate-<base>-<ts>-undo.jsonl` | apply, appended per batch |
| `migrate-<base>-<ts>-undo.json` | apply, consolidated at the end |
| `migrate-<base>-<ts>-plan.jsonl` | with `--dump-plan` |
| `<undo file>-result.json` | after an undo apply |
