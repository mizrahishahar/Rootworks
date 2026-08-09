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

**NEXT, in order:**
1. Same payload edit on the other three builders: `jJTD9xgbA0kKYqna` (Contagen), `7jqOsQh43ODQWQZ9` (Storeleads to Supersoniq, check whether it shares `SL Batch Pull`), `vTMckuoU61r9GXfa` (Discolike Domains). Locate each row builder first; do not assume the node name.
2. Pre-flight items 1 and 3 (missing-field creator honors `type`; who downstream reads `Build Date`).
3. Section 5 edits 1 to 3 in each parent, so new tables get the formula field.
4. Only then the table sweep, section 7.

**Do not convert any table yet.** Three builders still write `Build Date`; converting a table they touch kills those builds with the 422.

## 12. Related

The same failure class applies one level up, to [[Handoff — Outreach State Sync (PlusVibe → ClayRoots)]]. That sync will write onto these rows nightly. Design rule to carry into it: **the nightly writer owns only recomputable aggregates. Anything recording a first occurrence is either immutable by field type or never appears in the payload.**
