---
type: architecture
vertical: [list-building, intent]
owner: Operator
status: live 2026-08-23 (Handle Intent Signal cb39b605, enrollers ee040d12 / 0a0ade71)
---

# Intent Play Architecture

One machine, `Handle Intent Signal`, serves every client's hiring-intent play. Nothing about a client lives in code. A play is one KB row; the Apify task points at it; the machine reads it and refuses to run if anything is missing.

## The play row

KB Files, Type `intent-play`, linked to the Client. Content, one line each, every one required except the two channel lines, of which at least one must be present:

```
table: tblzDWfqe02Eny5QC
event: became_hiring
companies: US | max 200 employees | we sell to: US software and tech companies running their own cloud infrastructure; product companies, not agencies, consultancies, staffing or outsourcing firms
roles: DevOps, Site Reliability, SRE, Platform Engineer, Infrastructure Engineer, Cloud Engineer, Cloud Infrastructure, Kubernetes, Systems Engineer, Production Engineer, Release Engineer
people: <every title we keep, a broad list> | never marketing, sales, growth, revenue, people, talent, recruiting, finance, brand, content, community, customer success, account | 8 per company
linkedin: first hire = yes -> <AirPods pull-in URL> | rest -> <Full Pitch pull-in URL>
email: 6a8ae298f6384dccd0d8943e
```

| Line | What it is |
|---|---|
| `table` | the client's Intent table in their Clayroots base |
| `event` | the Event Type stamped on every row |
| `companies` | hard facts (country, max employees) and the ICP sentence |
| `roles` | the titles counted as already in the role; 0 at a company = first hire |
| `people` | every title we keep, matched on the contact's real title (long forms understood), the never terms, the cap |
| `linkedin` / `email` | one target, or tiers in order (first hire = yes / no / unknown, rest), first match wins |

A missing or unreadable line stops the run before any paid call. No minimum employees. No defaults anywhere in code. A play that wants something different edits its own line.

## The Apify task

Stays exactly as it is on Apify (actor, searches, schedule). Its webhook payload becomes:

```json
{ "play": "recXXXXXXXXXXXXXX", "resource": {{resource}} }
```

`resource` carries the run's dataset id (the jobs). Raising `count` on the task is the Operator's lever for volume.

## The run, step by step

| # | Step | Reads | Rejects on | Cost |
|---|---|---|---|---|
| 1 | Load play | KB row by id; Client and Clayroots Base from the Client link | any missing line | 0 |
| 2 | Load jobs | Apify dataset | | 0 |
| 3 | Hard company facts | Apify company data | not the play's country; over max employees; staffing words in name / poster title / industry; post never names its own company; duplicate; already in the table | 0 |
| 4 | BizData | DiscoLike `/bizdata` per survivor | company closed. Industry groups are recorded on the row, never a verdict | DiscoLike, net-new only |
| 5 | ICP check | DiscoLike `validate/icp`, the play's `we sell to` sentence, BizData + website as context | `no` or no verdict; `partial` kept, marked in ICP Reason | BYOK, the Operator's LLM key |
| 6 | Existing In Role | Supersoniq `companies/match` + DiscoLike `contacts/count` on the play's `roles`; higher count across the sources that know the company, blank when none does | never rejects; the tier rule reads 0 as first hire | 0 |
| 7 | Contacts, source 1 | DiscoLike `/contacts/discover` in domain mode, pulled wide (Technology / Executive departments, any decision level), capped by the play | | DiscoLike, net-new only |
| 8 | Contacts, source 2 | Supersoniq `companies/enrich`, `job_titles` = the play's people terms, net-new on Contact Key | | 1 credit per delivered contact |
| 9 | People gate | every contact's actual title | no `people` term, or any `never` term; every dropped title listed in the run log | 0 |
| 10 | Channels | the `linkedin` and `email` lines, tiers in order, first match wins | writes LinkedIn Campaign / Email Campaign | 0 |
| 11 | Write | Clean Fields helper, DNC, upsert to the Intent table | | 0 |
| 12 | Waterfall + log | the existing email waterfall; one Automations row with the whole funnel | | |

A company rejected at 3, 4 or 5 is never contacted, never written, and costs nothing past the step that rejected it. A person rejected at 9 is never written.

## What a row carries

Contact: Name, first/last, Title, Seniority, Department, Email, LinkedIn URL, Phone, City, State, Contact Key, Contact Source.
Job: Job ID, Job Title, Job Link, Job Posted, Job Description (raw, full), Job Seniority, Job Function, Job Employment Type, Job Industries, Job Applicants, Job Salary, Job Poster Name / Title / LinkedIn.
Company: Company (cleaned), Description, Industry Groups, Employees, Revenue Range, Score, Keywords, Company Status, Start Date, Street, Company City, Company State, Country, Zip, Phones, Public Emails, public_emails_clean, Social URLs, MX Provider, Redirect Domain, Email Pattern.
Signal: Event Type, Existing In Role, ICP Reason, LinkedIn Campaign, Email Campaign, LinkedIn Routed At, Email Routed At, Signal Detail, Intent Status, detected_at.

## The run log

One Automations row per run. Status computed from failures. Description carries: jobs in; each hard-fact drop by reason; BizData calls and misses; ICP yes / partial / no with every no's reason; first-hire yes / no / unknown; ContaGen and Supersoniq calls, matches, contacts, credits; people-gate drops; tier split; DNC; upserts; waterfall; skips. Every paid call counted.

## Enrollment: the view convention

Same doctrine as `Deploy View to Campaign`. Every Intent table carries two views, named exactly **`LinkedIn`** and **`Email`**. A view is the channel's reachable people, history included; its **visible columns** are the contract for what is sent. Nothing in code says what to send.

| View | Enroller | The only filter |
|---|---|---|
| `LinkedIn` | `Add Intent Leads to Alta`, daily 07:30 UTC | LinkedIn URL is not empty |
| `Email` | `Add Intent Leads to PlusVibe`, daily 07:30 UTC | Final Email is not empty |

The enroller reads the view's rows and its visible field list (Airtable meta API), then per row:

1. Already stamped `Routed At` for this channel: skipped. History sits in the view; the stamp says done. A loose view can never double-enroll.
2. Target: the row's `LinkedIn Campaign` (Alta pull-in URL) / `Email Campaign` (PlusVibe campaign id). Missing or malformed: skipped, `FAILED` with the reason.
3. Identity: `first_name`, `Company`, and the channel's address (`LinkedIn URL` / `Final Email` with `Status = done`). Missing: skipped with the reason.
4. Every visible column outside the machine set is sent under its snake_case name (Alta `extraInfoData`, PlusVibe `custom_variables`; State, City, Country, Title as PlusVibe's own lead fields). A visible column in the **convention set** below is sent when filled and never blocks. A visible column **outside** the convention is a required variable: empty means the row is skipped, logged as "missing <column>".
5. Stamp the channel's `Routed At`; `Intent Status` becomes `ROUTED` once every channel the row names has its date.

**Convention set, sent when filled, never block:** the ClayRoots build fields (last_name, Title, Social, Phone, City, State, State Full, Country, Zip, Street, MX Provider), **any column whose name starts with `Job `**, and the intent fields (Seniority, Department, Existing In Role, ICP Reason, Description, Industry Groups, Employees, Revenue Range, Score, Keywords, Company Status, Start Date, Company City, Company State, Phones, Public Emails, Social URLs, Redirect Domain, Email Pattern, Signal Detail, detected_at).

**Machine set, never sent:** Status, the waterfall tiers (MV, P1..P3, BB), Email, Domain, Final Email, Contact Key / Source, Run ID, Build Date, Name, Intent Status, the four channel fields, Target Campaign, Enroll Confirmed / Error, Event Type, Campaigns and the sync columns.

Hide a column: not sent. Unhide a convention column: sent when filled. Unhide any other column: sent and required. A missing view fails loud in the run log and enrolls nothing from that table.

`Intent Status` is the row's summary (`NEW`, `ROUTED`, `FAILED`, `NO EMAIL`), read only by the intent writer, the two enrollers and the backfill. Per-channel truth is the two `Routed At` fields. The email waterfall is unchanged.

## LinkedIn identity (ruling 2026-08-25)

Supersoniq is **not** a LinkedIn identity source: ~11% of its URLs belonged to a different person (prospects replied "I'm not Pavan"). Its email, phone and firmographics stay; its URLs never reach a sequencer.

- **At build** (Build Intent Leads): a Supersoniq contact's URL is discarded. The URL is recovered from the raw ContaGen batch for that domain by unique normalised full-name match, or the row stays email-only.
- **The name guard** (Clean Fields, vendor-independent, permanent): any personal LinkedIn URL whose `/in/` slug contains neither first nor last name is blanked before write. Slug and names are URL-decoded, diacritic-stripped, lowercased, reduced to a-z0-9. Rejections are named in the intent run log.
- **The fence**: every intent table carries a `linkedin_name_match` formula (hyphen-stripped both sides) and its `Linkedin` view filters on `= 1`. The enrollers can never see a mismatched URL.
- **Backfill**: the one-off's `liurl` pass re-derives mismatched URLs from DiscoLike by name, or blanks them. Rows are never deleted.
- URLs are stored URL-decoded (unicode slugs), so the formula and the guard read them alike.

## Open inputs

- The first play row is created by the build and reviewed by the Operator before the payload is switched.

## Build order, each step proven on the table before the next

1. Play row + loader + refuse-on-missing guard; Apify payload switched to `{play, resource}`.
2. Hard facts from the play; BizData industry exclusion from the play.
3. ICP check; ICP Reason field; log.
4. First hire; Existing In Role + First Hire fields.
5. People gate from the play.
6. Tiers.
7. Commit, push, SCHEMA and INDEX regenerated.
