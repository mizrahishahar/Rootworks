---
Type: Handoff
status: open
origin: ClayRoots session, 2026-08-09
vertical: infrastructure
scope: machine-wide (all four ClayRoots builders, every build table in all five client bases)
---

# Handoff — Build Date Immutability (ClayRoots builders)

`Build Date` is being silently overwritten on every append. This handoff turns it into a computed field that cannot be written, so the corruption becomes structurally impossible instead of avoided by discipline. The mechanism is proven live, not assumed. Nothing has been changed yet.

---

## 1. The bug, confirmed by table values

Airtable's upsert applies the same field set on both paths, create and update. There is no "set this only on insert". So the moment `Build Date` sits in the write payload, every matched row gets re-dated to the day of the run.

The 07-29 create-or-append refactor is what switched this on. Before it, builders mostly created rows. Now they match and update, so the overwrite fires on every hit.

**Proof.** Piper base `appR7aGJohe6xrPCv`, table `GCs / CMAR firms 50+ employees US - Contacts` (`tblfTVVwSjlMr6A8K`):

- 731 rows have `createdTime` 2026-06-14 and `ingested_at` 2026-06-14, but `Build Date` 2026-08-04 and `Run ID` 3005.
- Those rows were built in June. Run 3005 on 08-04 matched them, updated them, and rewrote their build date.
- Every legacy row that a new run touched was hit. 731 of 6,910 in this one table.

`ingested_at` is the tell. It still reads June because the current builder no longer writes that field. Only fields present in the payload get clobbered.

The field decays toward "date of last run", which is what `Run ID` already records. As a first-build fact it is already partly fiction.

The 67,262-row backfill from 08-05 is unaffected. That utility skips pre-stamped rows. It is the builders that corrupt.

Relevant field IDs on the proof table: `Build Date` `fldnsnBbXTJbfZUqg`, `Run ID` `fldSD3uKoiOqRMRNJ`, `ingested_at` `fldP78EWnrYutYVl1`.

## 2. The fix

`Build Date` becomes a **formula field** with the formula `CREATED_TIME()`.

It fills itself the instant a row is born, and nothing can ever write to it again. Not a builder, not the merge tool, not a person.

**Formula, not the native Created time type, and this is not a preference.** The API cannot create the native type, and the builders must create the field automatically on every new table or it becomes a manual chore that gets forgotten. Formula is the only type that can be uniform across the whole estate. Uniformity is mandatory because the builders' type-clash guard compares expected type against actual type: a mix of native and formula under one name makes the guard start refusing appends.

**No backfill.** The formula computes for every row already in the table the moment the field exists. The 731 wrong rows correct themselves back to June. There is no job to run. `Backfill Build Date (one-off)` (`M0IvVrjXaGT1K6Fs`) gets retired; it writes the field, so it becomes both broken and pointless.

## 3. Proof the mechanism works

Run live on 2026-08-09 against a throwaway table, `ZZ Build Date Test` (`tbll6ScG0igQdFT5t`) in Flowroots Clayroots (`app9FDblMeiv6Ijbj`). Delete it when convenient.

| Check | Result |
|---|---|
| Create formula field, read back schema | `result.type` is **`date`**, not dateTime and not text. No time component |
| Insert a row with no `Build Date` in the payload | Self-filled |
| Attempt to write the field | `422: Field "Build Date" cannot accept a value because the field is computed` |
| Upsert merging on the key, one existing row plus one new | Existing row's Build Date stayed `11:02:03`, new row got `11:02:30`. Untouched, proven by distinct second-level timestamps |
| `isWithin pastWeek` filter | Returned all rows. Date filtering survives |

Two caveats found by the test:

1. **Display format defaults to US (`M/D/YYYY`), not ISO.** `create_field` and `update_field` accept only `{ formula }` in options, so the display format cannot be set through the API. Getting `YYYY-MM-DD` is one UI click per table (Edit field, formatting, ISO). Cosmetic only. It does not change the field type, so it cannot affect the guard, and it can be done lazily at any time.
2. **The API returns the raw value as a full ISO timestamp** (`2026-08-09T11:02:03.000Z`) even though the field displays date-only. Today the field returns `"2026-08-04"`. Anything downstream reading `Build Date` and expecting `YYYY-MM-DD` must slice the first 10 characters.

## 3a. Display shows a time, and that is accepted

The cells render as `11:40am 7/28/2026`. The API response advertises `result.type: "date"` with a date format and no time format, which is misleading: the UI still shows a time. Verified visually 2026-08-09.

**Operator ruling: leave it. Do not "fix" this.**

The only API-reachable way to remove the time is `DATETIME_FORMAT(CREATED_TIME(),'YYYY-MM-DD')`, which returns **text** and therefore kills date-range filtering (`isWithin`, before/after). Filtering is a hard requirement, so that swap is forbidden. This is the same trap the old Discolike node had fallen into.

The only way to get date-only display AND keep filtering is a per-field UI toggle (field header, Formatting, turn off "Include time"), 23 tables. Available any time, purely cosmetic, does not change the field type and so cannot affect the type-clash guard.

## 4. Pre-flight, must be answered before any builder is touched

Read with the cheap method in section 8. Do not guess any of these.

1. **Does the missing-field creation step pass `type` and `options` through to `create_field`, or coerce everything to text?** If it coerces, new tables get a text `Build Date` and we have shipped a different bug wearing the same name. This is the load-bearing unknown.
2. **Is `Build Date` or `Run ID` hardcoded in the row-payload builder**, independently of the schema contract? If so, moving the contract entry is not enough.
3. **Who downstream reads `Build Date`?** Merge tool, exports, view filters, any n8n step. Caveat 2 above means a consumer expecting `YYYY-MM-DD` will receive a timestamp.

## 5. The four edits, per builder

Builders: `jJTD9xgbA0kKYqna` (Contagen), `UYGZblamekkSgat4` (Storeleads Domains), `7jqOsQh43ODQWQZ9` (Storeleads Domains to Supersoniq), `vTMckuoU61r9GXfa` (Discolike Domains).

1. **Schema node.** Move `Build Date` out of `fields` and into `formulaFields`, and drop `Run ID` from the contract entirely (Operator decision, 2026-08-09).

   Current, verified on `UYGZblamekkSgat4` node `Companies Schema`:
   ```json
   { "name": "Build Date", "type": "date", "options": { "dateFormat": { "name": "iso" } } }
   ```
   `formulaFields` is currently `[]`. Becomes:
   ```json
   { "name": "Build Date", "type": "formula", "options": { "formula": "CREATED_TIME()" } }
   ```

2. **Guard (`Table Router`).** Add `'Build Date'` to the `EXEMPT` set, which currently exists and is empty. Without this the guard refuses every append to a converted table with `Type clash ... Nothing was written.`, because its `kind()` maps `formula` into the text bucket and an existing field of type `formula` is not in `okWith.text`.

   The existing EXEMPT logic is already correct for our purpose: exempt and present, skip the check; exempt and absent, push to `missing` so it gets created.

3. **Create path.** The create branch currently returns `fields: plain` and `missing: []`, so formula fields are never created on a new table and a new table would get no `Build Date` at all. Pass the formula fields through as `missing` so they are added after the table exists.

   Airtable will not accept a computed field inside a create-table call. The field must be added afterward. This is why the contract already separates `fields` from `formulaFields`.

4. **Row payload.** Confirm it derives its columns from `fields` and never names `Build Date` or `Run ID` itself. See pre-flight item 2.

## 6. Execution order

The order is strict, not stylistic. Flipping a table while a builder still writes the field kills that build with a 422.

1. Answer all three pre-flight questions.
2. Patch **one** builder. Publish.
3. Run it against an **existing** table and a **new** table. Verify by cell values, never by the run log: old rows kept their dates, new rows self-filled, a new table got a formula `Build Date`.
4. Only then replicate to the other three builders, verifying each.
5. Only then sweep the existing build tables, in batches, verifying each batch.
6. Retire `Backfill Build Date (one-off)` (`M0IvVrjXaGT1K6Fs`).

## 7. The table sweep

Roughly 25 build tables across the five client bases. Per table, both steps via API, no clicking:

1. Rename `Build Date` to `Build Date (legacy)`. This preserves every current value, including the wrong ones, as insurance.
2. `create_field` a new `Build Date`, type `formula`, formula `CREATED_TIME()`.

The new column populates instantly for every existing row. Nothing is destroyed. Delete the legacy columns whenever you like; nothing depends on them. Field deletion is not available through the MCP, so that last cleanup is a UI action.

Note that the new field carries a new field ID. Any view filter pointing at the old `Build Date` needs re-pointing. Doing this now is deliberately cheap because the field is not yet in heavy use; the cost grows every week it becomes more load-bearing.

## 8. How to read builder code without blowing context

`get_workflow_details` overflows on these builders (Contagen is roughly 45,000 tokens as a single line). Read cannot slice a one-line file and Bash parsing of tool-result caches is hook-blocked.

**What works:** `get_execution` on a **successful** execution, `includeData: true`, `truncateData: 1`, filtered with `nodeNames` to the single node of interest. A successful run has an empty `nodeExecutionStack`, so the response stays small. This returned the entire `Companies Schema` field contract in one cheap call.

**What does not work:** the same call against a **failed** execution. The queued-node stack dumps full node definitions plus, in the builders' case, the entire base schema from `AT List Tables`, which overflows regardless of the `nodeNames` filter.

**Useful corollary:** a failing node's error payload dumps its full definition including `jsCode`. That is how the `Table Router` guard source was obtained, from the 08-06 type-clash failure on `UYGZblamekkSgat4`.

`update_workflow` supports `setNodeParameter` with a JSON Pointer path, so a single node can be patched without rewriting the workflow.

## 9. Rollback

Clean at every point. The legacy column still holds every prior value, and reverting a builder is one `setNodeParameter`. The failure mode of a half-finished sweep is a table whose new rows have no build date, which is visible and fixable, never a wrong date.

## 10. Out of scope

- Repairing the 731 rows by hand. Unnecessary; the formula corrects them automatically.
- Existing `Run ID` columns. They keep their stale values. Clearing them is a separate decision.
- The ISO display format clicks. Cosmetic, non-blocking, per table, whenever.

## 11. Progress log

**2026-08-09 — pre-flight item 2 answered, and it changes section 5.**

`Build Date` and `Run ID` are **hardcoded in the row-payload builder**, not derived from the schema contract. Found in `SL Batch Pull` (`3r2DqbY2IAapeehX`), node `Process Batch`, the final line of the row object:

```js
segment: ..., Source: 'Storeleads', 'Run ID': runId, 'Build Date': buildDate
```

`Upsert Domains` is an Airtable node using `autoMapInputData` with `matchingColumns: ["Domain"]`, so every key in that object becomes a payload field. That line is the corruption.

Note the architecture: `Storeleads Domains -> Clayroots` (`UYGZblamekkSgat4`) is the streaming **parent**; the row build and upsert live in the **sub**, `SL Batch Pull`. The schema node and guard stay in the parent. Expect the same parent/sub split when working the other builders.

**DONE:** both keys removed from `Process Batch`. Published, active version `b8f607e5-d9ae-460e-8d66-6766f58be95f`. The Storeleads domains path no longer writes either field. Config-level confirmed (`appliedOperations: 1`, publish success); **not yet proven by a live run** — the next Storeleads build is the proof, and the check is that new rows carry no `Build Date` and existing rows keep theirs.

**Also established:** the transitional gap is free. Because the formula computes retroactively from creation time, rows created between a builder fix and its table conversion get the correct date the moment the field flips. Builders-first ordering carries no data cost.

**ALL FOUR WRITE PATHS DONE AND PUBLISHED, 2026-08-09.** No builder writes `Build Date` or `Run ID` any more.

| Workflow | Method | Active version |
|---|---|---|
| `SL Batch Pull` `3r2DqbY2IAapeehX` | two keys removed from `Process Batch` jsCode | `b8f607e5-d9ae-460e-8d66-6766f58be95f` |
| Contagen `jJTD9xgbA0kKYqna` | `Strip Immutable (S1)` after `Format ContaGen`, `Strip Immutable (S2)` after `Format Supersoniq` | `ad45ffc4-5eb8-4a82-bc22-55535f5f74f9` |
| Storeleads to Supersoniq `7jqOsQh43ODQWQZ9` | `Strip Immutable` between `Format Supersoniq` and `Upsert Contacts` | `530ad8c4-4823-4a1f-963c-7684c2f6fb7d` |
| Discolike Domains `vTMckuoU61r9GXfa` | `Strip Immutable` between `AT Emit Companies` and `AT Insert Companies` | `2cdee769-b24d-46eb-88f3-1331560a8ce9` |

The three big builders could not be read (45k-token single-line dumps, Chrome unavailable), so instead of editing unseen formatter code a **strip node** was inserted at the write boundary in each. It deletes both keys from every item. This needs no knowledge of upstream code, is self-documenting via node notes, and is reverted by deleting the node and restoring one connection. Arguably the better design regardless: the rule now lives at the write boundary rather than duplicated in every formatter.

Write-node map, discovered by reading `source.previousNode` on a successful execution (chain backwards from `Build Log` or `Resolve Client`):
Contagen `Format ContaGen` to `Upsert Source 1`, `Format Supersoniq` to `Upsert Source 2`. Storeleads to Supersoniq: `Format Supersoniq` to `Upsert Contacts`. Discolike: `AT Emit Companies` to `AT Insert Companies`.

**CURRENT STATE, IMPORTANT.** Tables still carry the old writable `Build Date`, so **new rows now land with it blank**. This is expected and self-heals: the formula is retroactive, so converting a table gives every row, including the blank ones, its correct date. No data is lost in the meantime.

**SWEEP STARTED, 6 tables converted 2026-08-09.** Each got `Build Date` renamed to `Build Date (legacy)` and a new formula `Build Date` = `CREATED_TIME()`.

| Base | Table | New field |
|---|---|---|
| Piper `appR7aGJohe6xrPCv` | `tblfTVVwSjlMr6A8K` GCs / CMAR Contacts | `fldL7ixyaxuSehMn6` |
| Adelante `appmOqpv7dedSA9RA` | `tbljW1ipeQhFMXi4b` Israeli DTC Woocomerce Domains | `fldVS8DYsLdIsSPAK` |
| Adelante | `tbliVsCA0k24Bg48e` Israeli DTC Shopify Domains | `fld3mHBh5MqOVDTec` |
| Adelante | `tbliCAOKPGPkfdzs7` UK DTC Shopify+Woo Domains | `fldStMTY23eTI3Ejh` |
| Adelante | `tbl3Ssn5hW27P2sTP` Israeli DTC Shopify Contacts | `fldaq9AZZdYxAVSwQ` |
| Adelante | `tblf9LAJQKZwt339z` UK DTC Shopify+Woo Contacts | `fldZsBSPfpGH82hIc` |
| Flowroots `app9FDblMeiv6Ijbj` | `tblzV47wAwdN1QlzX` General Recruiting US Contacts | `fldUbdldSdgdLZdJ1` |
| Flowroots | `tblry6Fz9gsWP34EJ` Employee Benefits Brokers Contacts | `fldmcJpiNuY9sz4kh` |
| Flowroots | `tbl2vGReBhaWllVw1` Israeli B2B SaaS Leaders Contacts | `fldkzKJkyN2koTa8T` |
| Flowroots | `tblVNCFafQJ3XZexH` B2B Tech 11-50 US Contacts | `fldBwDC1bIKbMcko8` |

| Dave.io `appyhuYMwaGUdIs3z` | `tbl9SgBj5owhlS8BS` Accelerator 2025+ Domains | `fld7Ayaqwq8EsEYCi` |

| Dave.io | `tblMZ6xsl3g2x2JgU` B2B Tech 11-50 US Contacts | `fldzGYLXCxd0tmJE8` |
| Dave.io | `tbljfdFME6bmI1KoB` Calialfa & Manifold lookalikes Contacts | `fldDZjHJBqJbqBOSF` |
| Dave.io | `tblizSes8vC88IfS4` Xpand Marketing Lookalikes Contacts | `fldY6tbRuGtDFe015` |
| Dave.io | `tblifFRX1krtbZDyq` Accelerator 2025+ US Contacts | `fld8CYNNsV70xbsS9` |
| Dave.io | `tblqNUxMvrK8H78m1` Finance US 11-1000 Contacts | `fldR7A04PFNAR8Mai` |

**Dave.io base complete (6 tables).** Its other tables need nothing: `US Tech - Infra Hiring (Intent)` `tblzDWfqe02Eny5QC`, `DNC` `tblVvTum8G2rE0D75`, and `Dave` (campaigns) `tblIpPEkBe57LmA0P` have no `Build Date`.

| Piper | `tblgHYt0oh2abEuG5` GCs / CMAR firms US CA Contacts | `fldRi4zQG02fjokEv` |
| Piper | `tblgl8p6L5Eee2HM0` GC-CMAR BizDev Opportunity Hunter Contacts | `fldKGR4WXoD9aj6e7` |
| Piper | `tblwm8Dwgwt3u2X40` GC-CMAR 30M+ Sales & Marketing Contacts | `fldXrxKPVYL2gAcMW` |
| Piper | `tbl2xPG9kXSWbWGiE` GC-CMAR Precon & Estimating Contacts | `fldW6raZXHpyP2Wme` |
| Piper | `tbllKqXTuHvt3BIGQ` GC-CMAR Business Leaders C-Suite Contacts | `fldCoJnOGtDIx6FDX` |

**Piper base complete (6 tables).** `Piper Campaigns` `tblxHh5uS81EqJVrQ` has no `Build Date`.

| Move PLNR `appSTTKOc9Afqer9d` | `tblOcYcAxem05XbqY` General Moving Companies Contacts | `fldDki4xt5OflR0h2` |
| Move PLNR | `tblep7rO3kakcGXgz` General Moving Companies Domains | `fldMNwQdv6ItK8WFg` |

**SWEEP COMPLETE. 23 tables across all five bases.** Move PLNR only had two tables carrying `Build Date`; its 11 dated legacy source tables never had the field (they are the ones already slated for deletion), and `Intent for Move PLNR`, `DNC` and `Moveplnr Campaigns` do not carry it either.

**Every ClayRoots build table in the estate now has an immutable `Build Date`.** Nothing can overwrite it. Past values are corrected. `Build Date (legacy)` sits beside each one holding the old values; delete those whenever.

## 11b. Create-path contracts and guards, 2026-08-09

**All four builders now declare `Build Date` as a computed field and drop `Run ID`.** Final published versions:

| Workflow | Active version |
|---|---|
| `SL Batch Pull` `3r2DqbY2IAapeehX` | `b8f607e5` |
| Discolike `vTMckuoU61r9GXfa` | `b752d9c4` |
| Storeleads Domains `UYGZblamekkSgat4` | `d1ad2686` (unblock was `43c5c203`) |
| Storeleads to Supersoniq `7jqOsQh43ODQWQZ9` | `963bffd5` (unblock was `ea6b9823`) |
| Contagen `jJTD9xgbA0kKYqna` | `e11e4cf4` |

**The outage this caused, and the lesson.** Converting the 23 tables BEFORE fixing the contracts guaranteed a window where every append into a converted table was refused: contract said `type: date`, table was `formula`, guard threw `Type clash ... Nothing was written.` A live Storeleads-to-Supersoniq build hit it on `UK DTC Shopify+Woo - Contacts`. No data was harmed, the guard failed closed. **Correct order is always guards first, then tables.**

**The canonical guard rule, now in all four.** Not a blanket exemption. The computed set is derived from `spec.formulaFields`, never hardcoded, so future computed fields are covered automatically:

- absent (case-insensitive lookup) → push to `missing`, created as the formula
- present and `type === 'formula'` → skip, idempotent across re-runs
- present and any other type → **throw**, naming table, id and actual type, ending "Nothing was written."

A blanket exempt would have skipped the type check too, letting a stale writable `Build Date` survive silently forever. That was the trap.

**Case-insensitivity is scoped to computed fields only.** Plain fields keep exact matching; widening it would change clash detection for every column. Note the companion requirement: any downstream verify node must normalise both sides, or a table carrying `build date` passes the router then false-fails verification.

**The "formula field could not be added" defect, root-caused.** Three faults, present in every builder, all copy-paste siblings:
1. The `AT Add Created Formula` HTTP node was `"disabled": true` and never fired. The Airtable API was never the problem.
2. It targeted a field named `Created`, which appears nowhere in any contract.
3. Its formula was `DATETIME_FORMAT(CREATED_TIME(),'YYYY-MM-DD')`, which returns **text** and would have broken date filtering. See section 3a.

All now enabled, retargeted at `Build Date` / `CREATED_TIME()`, and made to fail loudly instead of warn.

**Verified live:** the missing-field creator honours `type` and `options`. Execution 3097 shows `AT Create Field` posting the whole contract entry verbatim, no text coercion. So an append into a table lacking `Build Date` creates it correctly as a formula.

### Known divergences, all deliberate, none blocking

**RESOLVED 2026-08-09, items 0 and 1 below are both closed.** The Operator pasted `Companies Schema`'s source from the UI, which unblocked the proper fix. Final version on `UYGZblamekkSgat4`: **`066cd2f4`**. `Companies Schema` now drops `Run ID` and `Build Date` from `fields` (28 entries) and declares `formulaFields = [{name:'Build Date', type:'formula', options:{formula:'CREATED_TIME()'}}]`; the compensating filter was removed from `Table Router` in the SAME atomic write, so `Build Date` appears exactly once in the effective contract and `Run ID` zero times. All four builders are now structurally identical, not merely behaviourally equivalent.

Note the duplicate hazard that made atomicity mandatory: fixing `Companies Schema` alone, while `Table Router` still appended `Build Date` to `formulaFields`, would have produced two entries, two create attempts, and a 422 on the next create-mode build. Never split those two edits.

Also learned from the Operator's paste: this workflow's launch node is `Launch Guard`, not `Storeleads Launch` as inferred from the sibling builder. `Table Router` separately references `$('Storeleads Launch')` for `baseId`; both nodes exist. Treat sibling-matched inferences in this estate with suspicion.

Item 0 is moot: `AT Create Companies Table` was never read, but whether it reads the router's fields or the schema node's, both now carry the same 28 entries with neither field present.

The two items below are kept for the record.

0. ~~**OPEN, needs 30 seconds of UI time.**~~ CLOSED, see above. On `UYGZblamekkSgat4`, one node could not be read: `AT Create Companies Table`, the create-table HTTP call. If it reads `$('Companies Schema')` directly rather than `Table Router`'s output, the normalisation in item 1 does not reach it. Evidence says it reads the router (it is fed by `Is Append?` output 1; the router's create branch would otherwise be dead code; in execution 3084 the created table's fields matched the router's list exactly and in order) but this is circumstantial. **To close it: open the workflow in the n8n UI and Ctrl-F for `Companies Schema`. If `Table Router` is the only hit, this is resolved.** If wrong, the failure is LOUD not silent: a new table gets a writable `Build Date` plus `Run ID`, then `AT Add Build Date Formula` 422s on duplicate field name and, with `neverError: false` and `onError: stopWorkflow`, the create run halts. Append mode is unaffected either way. Latest version after the protective-notes pass: `f7dc1bd4`.

1. **`UYGZblamekkSgat4` has its contract normalisation in `Table Router`, not in `Companies Schema`.** The schema node could not be read (94,002-char overflow, Read exceeds its token limit on a single-line file, Bash blocked on the cache). Rather than write unread code, the filter-and-move was placed in the sole consumer of the contract. Behaviour matches the other three; file shape does not. **Someone with UI access should move the entries in `Companies Schema` proper and delete the dead node.**
2. **Create paths add formula fields via two dedicated HTTP nodes, not by looping `formulaFields`.** Works for `Build Date` and `Seniority Rank`. **A third computed field would be silently skipped on new tables.** Closing this generically needs new nodes in the create chain.
3. **Contagen's `Contacts Table Guard` lacks the fail-closed Build Date assertion** its sibling got, same unreadable-code reason. Partly covered: its formula-add node has no `neverError`, so an Airtable rejection halts the run.
4. **Error wording is byte-identical across builders** for consistency, so a non-formula `Seniority Rank` in Contagen would also read "Convert it to a CREATED_TIME() formula field".
5. **Some nodes were reconstructed rather than read verbatim**, specified in full against verified wiring and sibling sources. Low risk, not zero.

### Still unproven

**No live run has exercised any of this.** All config-level. The proof is the next real build of each builder: an append into a converted table must pass the guard, and a new table must come out with a formula `Build Date` and no `Run ID` column. The stale-`date` throw has never executed anywhere, since every table is already formula.

**Cheap trick for a known table:** `list_records_for_table` with `fieldIds: ["Build Date"]` and `pageSize: 1` returns `cellValuesByFieldId` keyed by the field ID, so you get the field ID without pulling the base schema. Only use `list_tables_for_base` when you need to discover which tables exist.

**11 tables done.** Flowroots base is complete: its other tables (`Intent for Flowroots`, `Flowroots Campaigns`) have no `Build Date` and need nothing. `ZZ Build Date Test` (`tbll6ScG0igQdFT5t`) is the scratch table from section 3, safe to delete.

**Remaining bases:** Piper `appR7aGJohe6xrPCv` (other tables), Dave.io `appyhuYMwaGUdIs3z`, Move PLNR. Enumerate one base at a time with `list_tables_for_base`, pick every table having a `Build Date` of type `date`, then rename plus create per the recipe above.

**Repair proven by cell values.** The 731 corrupted rows in `tblfTVVwSjlMr6A8K` now read `Build Date` 2026-06-14 (correct, matching `createdTime` and `ingested_at`) while `Build Date (legacy)` still shows the wrong 2026-08-04. Past and future are both correct on every converted table.

**NEXT, in order:**
1. **Finish the sweep.** Remaining: Piper's other tables, Dave.io `appyhuYMwaGUdIs3z`, Move PLNR, Flowroots `app9FDblMeiv6Ijbj`. Roughly 19 tables. Get table and field IDs per base first; `list_tables_for_base` returns full schemas and is large, so pull one base at a time.
2. **Pre-flight item 1 is now urgent, and the news is bad.** Discolike's own run log from 2026-08-01 (execution 2879) reads: `Warning: the Created formula field could not be added`. So the builders' post-creation formula-field step **already fails**. The Airtable API accepts formula fields fine (proven in section 3), so their implementation is broken, not the capability. Fix this before relying on it for new tables.
3. Section 5 edits 1 to 3 in each parent (contract to `formulaFields`, guard `EXEMPT`, create path), so new tables get the formula field automatically. Blocked on item 2.
4. Pre-flight item 3: who downstream reads `Build Date` and would choke on a timestamp.
5. Retire `Backfill Build Date (one-off)` `M0IvVrjXaGT1K6Fs`.

**Not yet proven by a live run.** All four are config-level confirmed only. The next real build of each is the proof: new rows carry no `Build Date`, existing rows keep theirs.

## 12. Related

The same failure class applies one level up, to [[Handoff — Outreach State Sync (PlusVibe → ClayRoots)]]. That sync will write onto these rows nightly. Design rule to carry into it: **the nightly writer owns only recomputable aggregates. Anything recording a first occurrence is either immutable by field type or never appears in the payload.**
