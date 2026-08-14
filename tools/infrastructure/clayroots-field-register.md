---
type: infrastructure
vertical: [list-building]
owner: Operator
status: live
date: 2026-08-12
scope: machine-wide (every ClayRoots base except Piper)
---

# ClayRoots Field Register

The list of every field the machine creates, and which machine owns it. Companion to [[clayroots]].

**The law.** No field is created from nothing. Every field a machine creates is named here with its owner. A field in a ClayRoots table that is not on this register is either an accident or a leftover, and is deleted on sight. When a machine needs a new field, it goes on the register first.

**Why this exists.** The estate's own doctrine, from [[Outreach Sync and Deploy Architecture]], is that fields belong to the machine that writes them and that machine creates them on first contact. That doctrine is fine. What was missing is that **no machine declared which fields it owned**, so there was no way to tell an owned field from a stray one. `MV` is what that looks like.

---

## 1. Who creates fields

Thirteen automations touch ClayRoots schema. Only the builders and the two outreach machines work from a declared contract.

| Automation | id | Creates | Declared |
|---|---|---|---|
| Discolike Domains -> Clayroots | `vTMckuoU61r9GXfa` | Domains table + spine, `Build Date` formula | Yes, `fields` / `formulaFields` |
| Storeleads Domains -> Clayroots | `UYGZblamekkSgat4` | same, via sub `3r2DqbY2IAapeehX` SL Batch Pull | Yes |
| Storeleads -> Supersoniq -> Clayroots | `7jqOsQh43ODQWQZ9` | Contacts table + spine, plus CSV auto-adder columns | Partial |
| Contagen -> Supersoniq -> Clayroots | `jJTD9xgbA0kKYqna` | Contacts table + spine, plus CSV pass-through columns | Partial |
| **Waterfall Emails** | `iNzuePWU2UoByJ7U` | 11 verification fields, unconditionally, every run | **No** |
| **Verify Emails** | `jtBHNttawTdjG6Tv` | 5 verification fields, unconditionally, every run | **No** |
| **Add rank in company** | `d87Ic9RuAV9Yorc4` | `RankInCompany`, "creates the column if missing" | **No** |
| **Append fields to table** | `wOkccv1wDzBSO99d` | any CSV header absent from the table, as text | **No, unbounded** |
| BounceBan Poller | `tllfBn4NycLftdef` | none; overwrites `BB`, `Final Email`, `Source`, `Status` | n/a |
| Sync PlusVibe Leads to Clayroots | `TTRm3gldn3jiVgkp` | the 6 sync fields | Yes, architecture doc |
| Deploy View to Campaign | `JuWIbF6YCeRibhyg` | `Deploy Error` | Yes |
| Handle Intent Signal | `9iMXBGRlPk3O6pDZ` | intent table fields | Partial |
| Onboard Client | `ZJzzgxrERrOM3Z5e` | the base and its DNC table | Yes |

Both `TTRm3gldn3jiVgkp` and `JuWIbF6YCeRibhyg` are **built, exercised, and UNPUBLISHED** as of 2026-08-12. Unpublished means no schedule, not never run. The sync's adoption pass (exec 3270, 2026-08-08) **created 172 columns in a single run**, 5 per table and 6 where a campaigns mirror exists, across four clients. The deploy has run at least twice (execs 3318, 3319). The zero-CSV loop exists and works; only the 03:00 cron is off.

---

## 2. The register

### Spine, owned by the builders

`Contact Key`, `Name`, `first_name`, `last_name`, `Title`, `Seniority`, `Department`, `Email`, `Social`, `Phone`, `Connections`, `Domain`, `Company`, `company_clean`, `Industry Groups`, `Employees`, `Description`, `Keywords`, `City`, `State`, `State Full`, `Country`, `Zip`, `Street`, `segment`, `ingested_at`, `Contact Source`.

Domains tables additionally carry `public_emails_clean`, `Public Emails`, `Phones`, `Social URLs`, `Revenue Range`, `MX Provider`, `Redirect Domain`, `Update Date`, `Start Date`, `Business Model`.

**`Tag`** `singleLineText`. Build provenance, set by the Operator at launch, stamped on every row of that build. Replaces `query_name`. The exact-match pin for per-build views now that tables append rather than spawn a dated table. Created by hand, never by a machine, deliberately: see section 5.

**`Build Date`** `formula`, `CREATED_TIME()`. Immutable, returns 422 on write. In `formulaFields`, never in `fields`.

**`Seniority Rank`** `formula`, row-local.

### Verification lane, owned by Waterfall Emails and Verify Emails

Neither declares a contract. Each carries its own hardcoded `Field List` array, POSTed to the Airtable meta API unconditionally on every run with `neverError: true`.

| Field | Type | Created by |
|---|---|---|
| `MV P0`, `MV P1`, `MV P2`, `MV P3` | singleSelect (ok, catch_all, invalid, disposable, unknown, error, skipped) | Waterfall Emails |
| `P1 (Trykitt)`, `P2 (LeadMagic)`, `P3 (Prospeo)` | singleLineText | Waterfall Emails |
| `BB` | singleSelect (verifying, deliverable, undeliverable, risky, unknown, error, skipped) | both; overwritten async by BounceBan Poller |
| `Final Email`, `Source`, `Status` | singleLineText / singleSelect / singleSelect | both; overwritten by Poller |
| **`MV`** | singleSelect, same 7 choices as `MV P0` | **Verify Emails only** |

`P3 (Prospeo)` and `MV P3` are new as of run 3404, 2026-08-11.

### Outreach, owned by the sync and deploy machines

`Campaigns` (linked record), `Messages Sent`, `Last Contacted`, `Campaign Status`, `Bounce Reason`, `Synced At` are owned by `TTRm3gldn3jiVgkp` and written only by it. `Deploy Error` is owned by `JuWIbF6YCeRibhyg`.

### Operator-owned, created by hand

`manually_approved` (checkbox, the relevance rescue lane), `Tag`, and any per-client judgement field (`Title Verdict`, `hebrew_speaker`, `FR Vertical`, `FR Persona`, `Vertical`).

---

## 2b. How an extra field gets created, exactly

This is the answer to "when do we create additional fields, and when not".

**Contagen `jJTD9xgbA0kKYqna`: the contract node IS the CSV-header adder.** There is no separate adder. Inside `Build Table Schema`, the CSV's extra headers are injected into the `fields` array in one fixed slot, immediately after `Contact Source` and before `Valid`, each as `singleLineText`. Proven by two runs of the same node: exec 3415 (append) held `✨ ICP Fit` in that slot; exec 3397 (create) held `✨ Infra Team Size` and `✨ Infrastructure Staff`. `Format ContaGen` then carries those columns straight onto the row.

So every `✨` field in the estate arrived this way: a CSV column became a table column, silently, because the contract is assembled at runtime from the upload.

**Create path and append path create fields differently.**

- **Create**: `AT Create Table` creates the table and every entry in `fields`, CSV extras included, in one call. The two formula fields are then added by dedicated nodes, `AT Add Rank Formula` and `AT Add Created Formula`.
- **Append**: one generic diff, `Has Missing Fields?` to `Split Missing Fields` to a field-create loop, treating `fields` and `formulaFields` as a single list. A missing formula field is created by the generic loop, not the dedicated nodes.

Live proof, exec 3415: the diff computed `missing = [Business Model, Contact Source, ✨ ICP Fit, Valid, Start Date, Redirect Domain, Update Date]` and created exactly those seven.

**`Tag` is in the Storeleads path already.** `SL Batch Pull` `3r2DqbY2IAapeehX` writes `Tag` onto every row from `Batch Input.tag`, and it uses `autoMapInputData` upsert, which cannot create fields. So the parent `UYGZblamekkSgat4` must now carry `Tag` in its contract or every upsert would 422.

---

## 2c. The standard, as shipped 2026-08-12

Every schema-touching workflow now conforms. Final published versions:

| Workflow | Version |
|---|---|
| Contagen `jJTD9xgbA0kKYqna` | `dcacd4d7` |
| Storeleads -> Supersoniq `7jqOsQh43ODQWQZ9` | `150858a4` |
| Storeleads Domains `UYGZblamekkSgat4` | `ea7d8026` |
| SL Batch Pull `3r2DqbY2IAapeehX` | `62537eff` |
| Discolike `vTMckuoU61r9GXfa` | `48a34021` |
| Waterfall Emails `iNzuePWU2UoByJ7U` | `77433874` |
| Verify Emails `jtBHNttawTdjG6Tv` | `649b16f3` |
| BounceBan Poller `tllfBn4NycLftdef` | `d5d6ae8b` |

The rules, machine-wide:

- **`company_clean` is dead.** No contract declares it, no writer emits it. Cleaning happens on `Company` itself via the shared `cleanCompany`. (Discolike domains tables clean into `Name`.)
- **`Source` is dead.** `Contact Source` = where the record came from (builders). `Email Source` = which tier found the email (verification lane: P0/P1/P2/P3/none, choice set byte-identical in Waterfall and Verify). Existing `Source` columns renamed to `Email Source` on Dave (Accelerator Contacts, Intent, Finance, Accelerator Domains) and Adelante (Shopify Contacts/Domains, UK Contacts/Domains); Move PLNR and Flowroots get `Email Source` created by the lane on first touch, their stale `Source` joins the deletion pass.
- **`State` is the only location column**; strip nodes fold a `State Full` value into it (full name wins).
- **Banned from contact payloads and contracts:** `Score`, `Similarity`, `Valid`, `Start Date`, `Redirect Domain`, `Update Date`, `Run ID`, `Seniority Rank`, `State Full`, `company_clean`, `MV`, writable `Build Date`. All fine on Discolike domains tables (Operator ruling), where the source data legitimately carries them.
- **Write-boundary strips enforce the ban** in Contagen (S1/S2), SL->Supersoniq, and SL Batch Pull (`Split Rows`), so a CSV or formatter can never resurrect a banned column or 422 a fresh table.
- **`Build Date`** is the only formula field in every contract, `CREATED_TIME()`.
- **`Tag`** is in every builder contract; only the Operator sets its value.
- **Verify Emails** writes its verdict into the real tier column (`MV P0` by default), never a bare `MV`.
- **Nothing blanks a `Final Email` except a definitive negative** (`invalid`/`disposable` from MillionVerifier, `undeliverable` from BounceBan). Indeterminate and errored checks leave the address untouched, in Verify Emails and in the Poller both.

**None of this is proven by a live run yet.** The proof is the next real build and the next verification pass: new tables must carry the trimmed contract, `Contact Source` populated, `Email Source` created by the lane, and no banned column anywhere.

---

## 3. Open defects

**Verify Emails destroys resolved emails.** Its `Verdict` node writes `Final Email: ''` and `Source: 'none'` on any row it cannot resolve. Its only guard is `NOT({Status} = 'verifying')`, which excludes in-flight BounceBan rows but not already-resolved ones. Running Verify Emails over a table that Waterfall Emails already filled wipes `Final Email` on catch-all rows that were good. Silent, no error, no counter. **Do not point Verify Emails at a waterfalled table until this is fixed.**

**`MV` duplicates `MV P0`.** Functionally the same value from the same source. Verify Emails is verify-only so it has one verdict and names it `MV`; Waterfall is tiered so it names its columns `MV P0..P3`. A table touched by both carries both, and they disagree, because `MV` reflects a later re-verification of `Final Email` while `MV P0` holds the original tier-0 verdict. Neither is authoritative.

**`Source` has no owner and a non-deterministic option list.** Waterfall declares choices `P0, P1, P2, P3, none`. Verify Emails declares `P0, P1, P2, none`, no P3. Whichever touches a virgin table first wins the list; the loser's `Create Field` returns DUPLICATE and its extra choice never lands. Every writer uses `typecast: true`, which silently **adds** any option it writes. That is how Dave's `B2B Tech 11-50 US - Contacts` ended up with `ContaGen`, `Supersoniq` and an orphan `2943` among its `Source` choices: the builders write provider strings and a stray Run ID into a field they do not own, minting a new option each time, and the waterfall then overwrites the value.

**Ruling:** `Source` belongs to the verification lane and means the winning tier. `Contact Source` belongs to the builders and means the contact provider (ContaGen / Supersoniq). They are two different facts. The fix is in the builders: stop writing `Source`.

**`Backfill Build Date (one-off)` `M0IvVrjXaGT1K6Fs` is a live landmine.** Its node `Create Build Date Field` creates `Build Date` as a **writable `date` field, `dateFormat: iso`**, when missing. Run it on any table today and it reintroduces exactly the mutable field the whole 23-table immutability sweep removed, and the builders' type-clash guard will then refuse every append to that table. It was marked for retirement on 2026-08-09 and is still active. **Retire it.**

**`Onboard Client` `ZJzzgxrERrOM3Z5e` has no idempotency guard.** Its node `Create ClayRoots Base` POSTs to `/v0/meta/bases` **unconditionally on every webhook hit**, with `onError: continueRegularOutput` and no existence check anywhere in the graph. A repeated webhook mints a duplicate base. It has **zero executions of any status, ever**, so this has never been exercised and will be discovered live at the worst moment: onboarding a paying client.

**The sync creates fields at scale with no operator in the loop.** `TTRm3gldn3jiVgkp` runs nightly across every client and creates its 5 or 6 fields on every table it touches. One adoption pass made 172 columns. That is correct by the ownership doctrine and still the largest uncontrolled schema change in the estate; it belongs on this register precisely so it stops being invisible.

**Unresolved.** Adelante's contact tables carry a populated `Campaigns` link field even though the sync's own logs say it was skipped, because that mirror's primary field is `Campaign`, not `Campaign ID`. Either something else created it or the detection rule changed after exec 3272. Not determinable without reading the node.

**`Append fields to table` has no normaliser and unbounded schema.** Any CSV header absent from the table becomes a text column. Its flattener is `String(v)` with no trim, and its schema guard maps case-insensitively so a CSV header `company` is routed deliberately onto the existing `Company` field, writing raw. Last write path in the estate with no company-name cleaning.

**`7jqOsQh43ODQWQZ9` stopped creating `Seniority Rank`.** It has no `Seniority Rank` in `fields` or `formulaFields`. This is a regression, not a design choice: exec 3293 (2026-08-09) created it, exec 3341 (08-10) does not. Contagen still declares it. So a contacts table built by the Storeleads-to-Supersoniq path gets no seniority ordering, which the per-company cap (`RankInCompany <= N`) and every segment view depend on. Contract divergence between two builders feeding the same tables.

**Contagen still writes `Run ID` and `Build Date` on every row and then strips them.** `Format ContaGen` and `Format Supersoniq` build both keys; `Strip Immutable (S1)` and `(S2)` delete them before the upsert. Confirmed by diffing those nodes in exec 3397. Correct today, fragile: delete a strip node and the corruption returns. `SL Batch Pull` has the cleaner form, where `runId` and `buildDate` are computed and never used, dead locals.

**Builder descriptions are stale.** All four still say "Creates a dated table from a Build name." The date suffix came off on 2026-08-11.

**The current contracts cannot be read.** All five builders were edited 2026-08-11 between 16:36 and 16:42 UTC and none has an execution since. `get_workflow_details` overflows on four of the five. So the live contract for Contagen, both Storeleads builders and Discolike is unverified; what is documented above for `UYGZblamekkSgat4` (08-06) and `vTMckuoU61r9GXfa` (08-01) is provably stale, still showing `Run ID` and a writable `date` `Build Date`. **The first real build of each builder is the only way to see its current contract.** Watch that run.

---

## 4. Fields to delete

Dead, evidenced, safe.

| Field | Why |
|---|---|
| `Build Date (legacy)` | Insurance column from the formula conversion. Its job is done |
| `Run ID` | Dropped from every contract 2026-08-09. Stale values only |
| `query_name` | Retired 2026-08-11. Only Discolike ever wrote it, so it was never trustworthy |
| `Created` (formula) | Duplicate of `Build Date`, both `CREATED_TIME()` |
| `reloaded_patch` | Self-described one-time patch, superseded by the sync |
| `Campaign Segment` (formula) | Old segmentation-in-formula, superseded by the relevance formula |
| `Co Rank` | Second ranking field beside `RankInCompany` |
| `✨ Infrastructure Staff` | Self-described merged into `Infra Employees`, zero conflicts |
| `_cc_target` (formula) | Self-described temporary, company-name backfill 2026-08-10, verified 08-11 |
| `MV` | Duplicate of `MV P0`, and the fingerprint of a Verify Emails run |
| Move PLNR `biz_*` family, `Company Type / Size Bucket / Revenue / Country / Phone / LinkedIn / Description`, `Industry Tags`, `batch_id`, `icp_fit`, `Data Quality Score` | Roughly 20 dead fields from an old source, all on the Contacts spine |

The Airtable MCP has **no `delete_field`**. Deletion is a UI or Chrome action, not an API one.

---

## 5. Why no machine may create `Tag`

`Tag` is the one field the Operator sets. `Stamp Tag on table` (`U9qVEf5oCyL6rYFX`) **fails loudly** if the target table has no literal `Tag` column, naming the table, its id and its base, and writes nothing. That is deliberate. A backfill tool that silently creates the column it is about to fill is the exact anti-pattern this register exists to end.

**`Stamp Tag on table`** `U9qVEf5oCyL6rYFX`, published `85c53b9d-7e59-4d96-9556-8effb27ca2c9`. Form `stamp-tag-on-table`, webhook `stamp-tag-on-table-run?recordId=recXXX` with optional `&tag=` and `&buildDate=YYYY-MM-DD`. Writes only rows whose `Tag` differs, so a re-run reports 0 changed. Plain PATCH by record id, batches of 10, never upsert, never touches `Build Date`. The date filter runs server-side as `IS_SAME({Build Date}, DATETIME_PARSE(...), 'day')`, which survives the full ISO timestamp the API returns.

Proven live 2026-08-12 on `Accelerator 2025+ US - Contacts`: 1,254 of 1,254 rows carry `accelerator-2025-2026`, 0 blank, 0 mismatched, re-run scanned 1,254 and changed 0.

---

## 6. Merge maps

Tables are sacred. New tables are rare. A build appends into the table that already answers its vertical, and `Tag` carries which build it came from.

**Dave.io** `appyhuYMwaGUdIs3z`. Five contact tables collapse into one. `Contact Key` is the upsert identity, so a person in two of them merges rather than doubles.

| Table | Tag |
|---|---|
| `B2B Tech 11-50 US - Contacts` `tblMZ6xsl3g2x2JgU` | **spine**; rows built 2026-08-11 get `Own-Stack SaaS 11.8` |
| `Accelerator 2025+ US - Contacts` `tblifFRX1krtbZDyq` | `accelerator-2025-2026` (done) |
| `Calialfa & Manifold lookalikes` `tbljfdFME6bmI1KoB` | `calialfa-manifold-lookalikes` |
| `Cultivado B2B tech list` `tbllYdgNDTXQGARzw` | `cultivado list 10.8` |
| `Xpand Marketing Lookalikes` `tblizSes8vC88IfS4` | `xpand-lookalikes` |

Stays separate: `Finance US 11-1000 - Contacts` (different vertical), `Accelerator 2025+ - Domains`, the intent table, DNC, the campaigns mirror.

**Adelante** `appmOqpv7dedSA9RA`. Platform is a field, not a table.

| Spine | Merges in |
|---|---|
| `Israeli DTC Shopify - Contacts` `tbl3Ssn5hW27P2sTP` | `Israeli DTC Woocomerce - Contacts` `tblunOMUSwumORkCF` |
| `Israeli DTC Shopify - Domains` `tbliVsCA0k24Bg48e` | `Israeli DTC Woocomerce - Domains` `tbljW1ipeQhFMXi4b` |

`UK DTC Shopify+Woo` stays separate: different market and language. It already merges Shopify and Woo into one table, which is the proof the pattern works.

**Move PLNR** `appSTTKOc9Afqer9d`. The biggest collapse in the estate: 10 dated vintages into 2 tables.

| Spine | Merges in |
|---|---|
| `General Moving Companies in US / CA - Contacts` `tblOcYcAxem05XbqY` | 6 dated Contacts snapshots: 06-01, 06-12, 06-16, 06-23, "2" 06-23, 07-02 |
| `General Moving Companies in US / CA - Domains` `tblep7rO3kakcGXgz` | 4 dated Domains snapshots: 06-01, 06-16, 06-23, "2" 06-23 |

**Flowroots** `app9FDblMeiv6Ijbj`. Four contact build tables, no `Tag` on any. `B2B Tech 11-50 US - Contacts` `tblVNCFafQJ3XZexH` is the corrupted CSV clone (BOM in the primary field name, everything typed `multilineText`) and must be fixed or excluded before this base joins the sync fan-out. `ZZ Build Date Test` `tbll6ScG0igQdFT5t` is scratch and safe to delete.

---

## 7. Type clashes blocking the merges

Airtable will not reconcile these and the builders' type-clash guard refuses the append. Resolve before merging.

| Field | singleSelect on | singleLineText on |
|---|---|---|
| `Seniority` | Accelerator, Cultivado, Xpand, Finance | **B2B Tech (spine)**, Calialfa |
| `Department` | same | same |
| `Employees` | same | same |
| `Source` | most Move PLNR tables | Move PLNR Contacts spine, Flowroots Israeli B2B SaaS |
| `Description` | multilineText on B2B Tech | singleLineText elsewhere |
| `RankInCompany` | number on Benefits Brokers | multilineText on Flowroots B2B Tech |
| `Infra Employees` | **number** on Accelerator | **singleLineText** on Cultivado, holding `0 / 1 / 2-3 / 4+ / unknown` |

`Infra Employees` is the dangerous one: it is the field the relevance gate tests with `infra is 0 OR infra is 1`. Merging those two tables as-is destroys either the numbers or the ranges.

---

## 8. Related

[[clayroots]] for the base and the view chain. [[Outreach Sync and Deploy Architecture]] for the sync and deploy machines. [[Handoff — Build Date Immutability (ClayRoots builders)]] for the formula conversion.
