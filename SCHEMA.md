# Flowroots Hub - schema

Compiled from the live base (`appQG6dK0FIOhTxOl`) by `scripts/hub-pull.js`. Do not hand-edit.
This file is what the tables ARE; what they mean lives in their own descriptions and the hub skill.

## Clients (`tblK0nCoNVvFf5SPa`)

| Field | ID | Type | Notes |
|---|---|---|---|
| Client | `fldrPOm3IINTtktbs` | singleLineText |  |
| driveMainFolderID | `fldSHZVcIgGDmZOpv` | singleLineText |  |
| Record ID | `fldtbWsSp5ngPyHsl` | formula |  |
| Drive Folder | `fldrg4DUjjALipxK6` | button |  |
| Clayroots Base | `fldp41egMb4GQxAe8` | button |  |
| Scheduling | `fldDsDleVAQmFe4qT` | button |  |
| Dashboard | `fldkqVaI5PmM9fhjz` | button |  |
| PlusVibe Workspace ID | `fldUqi0Sv2rizH7nI` | singleLineText |  |
| Slack Channel ID | `fldP5V8vAPVHvpuut` | singleLineText |  |
| Clayroots Base ID | `fldRAiazbtIutFb7s` | singleLineText |  |
| Qualification Prompt | `fldN4HT0rGmNXNp78` | multilineText | The client-specific ICP qualification rubric, read at runtime by the client's Handle-new-lead automation and injected as the system prompt of the GPT qualifier. One per client. |
| SESSIONS | `fldJy6MsPHAXKKVFn` | singleLineText |  |
| AUTOMATIONS | `fld6hL8EhoXx2TxZd` | multipleRecordLinks |  |
| Companies | `fldcH6aX0naSrHcJh` | multipleRecordLinks |  |
| Transactions | `fldvniUaYfQTh5t98` | singleLineText |  |
| Recurring Templates | `fldrpuORcW1Bwkeoi` | multipleRecordLinks |  |
| Scheduling Link | `fldUvzXg2Ktcx5wJk` | url |  |
| Slack Sync | `fldLIg2HmU98tXdEh` | checkbox | Enables the nightly Sync Slack Logs automation for this client. Read by the Hub scheduled automation that fans out one n8n run per checked client. |
| Campaigns | `fldK4rFkJyE01KVlU` | multipleRecordLinks |  |
| Campaign Snapshots | `fld4JTnvDBXogj2mp` | singleLineText |  |
| Billing Date | `fldhckiADqhdwylvk` | date |  |
| Reports | `fldfk1lrNDfMAkGCx` | multipleRecordLinks |  |
| Report Day | `fld16FKbFWTUeYZwk` | singleSelect | Weekday (Asia/Jerusalem) the PlusVibe Weekly Report goes out for this client. Empty = Friday default. Read by the daily PlusVibe Weekly Report automation. - Choices: Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Daily |
| Openers | `fldZcb0974UTxUSg6` | multipleRecordLinks |  |
| DashboardURL | `fldM9hy9hfgL5DGv7` | url |  |
| BDR Slack Channel ID | `fldXdAOneX5IESiSa` | singleLineText |  |
| Clayroots shareable link | `fldqmlb9I7mUuqqZ0` | singleLineText |  |
| Dashboard Page ID | `fldTgZ7oFgwMKSRRz` | singleLineText | THE per-client interface variable, and the ONLY one. This client's own Dashboard page id (pag...), used as the PATH for every interface deep link we build for them, prospects and campaigns alike. Link shape: airtable.com/appQG6dK0FIOhTxOl/{this}?detail={base64 of {"pageId":"<DETAIL PAGE>","rowId":"<recId>"}} . The DETAIL page is a shared code constant, NOT per-client: Prospects = pagU8C93nMn6vPMTM, Campaigns = pagnDARjFPzq5HclC. VERIFIED 2026-08-12 from real URLs across two different client dashboards (Dave.io pagdVdiFoBO21HtFu and Move PLNR pagvP7mXxwK1TUQjk both resolve prospects through pagU8C93nMn6vPMTM, with identical element ids, so the client interfaces are clones of one template). Empty = that client's cards carry no interface link. Never borrow another client's page id. New clients: capture at onboarding (create_interface / create_page return it) rather than by hand. |
| Inbox Manager API Key | `fld7lpzhriQrn8qoR` | singleLineText |  |
| Inbox Manager Routine URL | `fldvyTMsWh10TFAFE` | singleLineText | The full fire URL for this client's EMAIL inbox routine. Handle New Lead from PlusVibe POSTs to this at the end of every run, with Authorization: Bearer {Inbox Manager API Key}. The routine then wakes and works the most recently engaged lead. Empty = this client has no inbox routine and the intake skips the fire step. |
| LinkedIn Setter API Key | `fldpuAB5jiyBxliuj` | singleLineText |  |
| LinkedIn Setter Routine URL | `fldOQlJRrYvJMPiyr` | singleLineText | The full fire URL for this client's LINKEDIN routine, a separate session from the email inbox. Handle New Lead from Alta POSTs to this at the end of every run, with Authorization: Bearer {LinkedIn Setter API Key}. Empty = this client has no LinkedIn routine and the intake skips the fire step. |
| Client KB | `fldVBndImTxRl9lSO` | multipleRecordLinks |  |
| Logs | `fldevnA1BWrHhvfal` | singleLineText |  |
| Meetings | `fldx6yapArKEZki0L` | multipleRecordLinks |  |
| Email Domains | `fldOm4uLCpBFvsgou` | multilineText | The client's own email domains, one per line (e.g. getadelante.com and adelantedesk.com for Adelante). The matcher key that lets the Fathom meeting sync tell a client meeting from a sales meeting. Keep current: a client adding a domain without this list updated leaks their meetings into the sales path. |
| Inboxes | `fldQkOvy4b8YeUYkG` | multipleRecordLinks |  |
| Domains | `fldJUAJFb6jzL7wxs` | multipleRecordLinks |  |
| Credits | `fldAXROZdXATgpav5` | multipleRecordLinks |  |
| Booking Keys | `fldNZ0p7IWzLBZ83X` | multilineText | The scheduler identities that belong to this client, one per line: the host email, the Cal.com username, an event-type title. Handle New Booking matches a booking's organizer against these lines to find the client. Empty = bookings cannot be attributed to this client. Set at onboarding. |
| Task Templates | `fldoZrz4vQhf0K5j8` | multipleRecordLinks |  |
| Tasks | `fld83ot47MF0FURDv` | multipleRecordLinks |  |
| Signals | `fldX22tSP2fGWY4rY` | multipleRecordLinks |  |
| ClayrootsCompaniesTableID | `fldHhhOlD6RSzYi3p` | singleLineText | The client's Companies table id (tbl...) in their ClayRoots base. Set at onboarding. |
| ClayrootsPeopleTableID | `fldAkkVBD6fLBA9my` | singleLineText | The client's People table id (tbl...) in their ClayRoots base. Set at onboarding. |
| ClayrootsCompaniesSharedView | `fldu7gE5tnsJsS7qc` | url | The share link of the client's Companies table (was the table description). What we send the client; they filter by campaign there. Replaces per-deploy lead-list links. |
| ClayrootsPeopleSharedView | `fldVXKc6ToYeWNGEo` | url | The share link of the client's People table (was the table description). What we send the client; they filter by campaign there. Replaces per-deploy lead-list links. |

## KB Files (`tblJAWVcCaW6TmfbC`)

The client knowledge base. One row per document the machine reads: onboarding forms, product KBs, research, intel. Text in cells, never attachments (attachments are for human-sent deliverables, in Drive). Sessions retrieve by Client + Type, never the whole KB. Verified = numbers in this doc are confirmed with the client, use verbatim.

| Field | ID | Type | Notes |
|---|---|---|---|
| Name | `fldW8rLvifWteVpQB` | singleLineText | Document name, e.g. Onboarding Form, Product Marketing KB |
| Client | `fldeLzTbDBYwBU4oJ` | multipleRecordLinks |  |
| Content | `fldVKPHO66ykhOBrj` | richText | The document itself, as text. A doc that outgrows the cell splits into part rows sharing the Name. |
| Verified | `fldotNHjuUiOhr6JQ` | checkbox | Numbers and claims in this doc are confirmed with the client. Copy may use them verbatim. Unchecked = treat every number as unconfirmed. |
| Type | `fldw8iva4GJ3hdPCv` | singleSelect | The retrieval key: sessions pull by Client + Type instead of loading everything. Read live by the reply intakes for qualification-prompt. - Choices: onboarding-form, overrides, product, research, intel, asset, qualification-prompt, email-routine-prompt, linkedin-routine-prompt, Inbox-Agent-Prompt, intent-play |
| Link | `fldZn42JeTlp3amOV` | url | For asset rows: the live URL we actually send (case study page, calculator, video). Content holds the full text behind the link so sessions can read what the prospect will see without fetching. |
| Creation Date | `fldq4gggdIbzlGYIW` | createdTime |  |

## Messages (`tblh7G8aW63vEg6S3`)

| Field | ID | Type | Notes |
|---|---|---|---|
| MessageId | `fldQAbTgmSzmPSHFF` | formula | Concatenates To, Platform, and Date fields separated by dashes. Format the date to be this format: MM/DD/YY |
| Date | `fldhdUSB7f0hXPgAh` | date |  |
| Platform | `fldd2mAEw6xFBloqr` | singleSelect | Choices: LinkedIn, Email, Whatsapp, Facebook, instagram, Linkedin |
| MessageSubject | `fldrcAcBPGgrIeIJp` | singleLineText |  |
| description | `fldDFSH3l6EY38diZ` | singleLineText |  |
| With | `fldTY5xtBfVKL0aov` | multipleRecordLinks |  |
| MessageBody | `fldGQtF1pfyQiuUoH` | richText |  |
| bottomLine | `fldEgn6pVCCiVhkt7` | aiText |  |
| Company | `fldU4bFx5SHFmzH3u` | multipleRecordLinks |  |
| messageType | `fld6JTYEx3Hyz3Pdn` | singleSelect | Choices: Initial message, Followup, Post-call Followup, Email Thread, WhatsApp Chat, LinkedIn Chat, Email Thread (Shahar) |
| sent? | `fldGokpXbReSDJd2T` | checkbox |  |
| LastModified | `fldWENP0Dafi6ouX9` | lastModifiedTime |  |
| ThreadId | `fldo9Rufn1y5Cz8Ff` | singleLineText |  |
| firstName | `fld28GiFgCeOdKhCy` | multipleLookupValues |  |
| domain | `fldKYk4VpbNAtprRN` | multipleLookupValues |  |
| Niche Company | `fldn4ZhoWLZ0fOrjo` | singleLineText |  |

## Contacts (`tblzexq9qzO9IRiYV`)

| Field | ID | Type | Notes |
|---|---|---|---|
| firstName | `fldsehfuXDCOHf3Xh` | singleLineText |  |
| lastName | `fldqbvUIxiXzFTugc` | singleLineText |  |
| position | `flds0xOHFkAIhfRP8` | singleLineText |  |
| email | `fldTr28UN1XO6sNE5` | email |  |
| emailVerified? | `fldCViNa2GG9gQbCM` | checkbox |  |
| phone | `fldDxgqzy0YJ2Sskd` | phoneNumber |  |
| linkedin | `fldakPRD0wmnf3bR1` | url |  |
| linkedinOpen? | `fld0ixs20jQwxCzoC` | checkbox |  |
| Role | `fldrtAKQH43vMSpFP` | singleSelect | Choices: Primary, Secondary, Forwarding, Primary (D100 Target), Network |
| Company | `fld9Och6pM3hV3R0Q` | multipleRecordLinks |  |
| CompanyName | `fldXKbz0m0jAF96TX` | multipleLookupValues |  |
| notes | `fldAhe0jGiWF2tLsb` | richText |  |
| domain | `fldr4F5idzRXTqQVJ` | multipleLookupValues |  |
| LastModified | `fldiG2uYmQCEZ9CG3` | lastModifiedTime |  |
| instagram | `fld9AMzmcmE47pUGI` | url |  |
| facebook | `fldatwbog28bVd6s5` | url |  |
| Follow-ups | `fld9TuOQLLS2SN7BI` | multipleRecordLinks |  |
| Niche Company | `fldvtTaBFg0P9GjbG` | singleLineText |  |
| Twitter | `flduIgh2eUljbofZF` | url |  |
| Phone Source | `fldaZfRpakqtc3aVM` | singleSelect | Where this phone number came from, so a BDR knows whether they are dialing a direct line or a switchboard. The -tollfree variants mean the only number we could find is an 800/833/844/855/866/877/888 company line: it will reach a receptionist, not the prospect. - Choices: signature, GPT, LeadMagic, signature-tollfree, GPT-tollfree, none, ai-ark, prospeo, supersoniq |
| Automations | `fld1HbJ64M0T6YRtR` | multipleRecordLinks |  |

## Meetings (`tblAo6SfTPTOJrnbX`)

| Field | ID | Type | Notes |
|---|---|---|---|
| Title | `fldhIbkc3zbpGbyig` | singleLineText |  |
| Summary | `fld6uKrTTNfXaiNKS` | richText |  |
| Participants | `fldv1DvZnBw9qTbe6` | multilineText |  |
| MeetingLink | `fldKqOdTpc5qXPk8G` | singleLineText |  |
| RecordingLink | `fldhkkqYLZh4Hx1rD` | url |  |
| Date | `fld0gxwEkh6qRTdI8` | dateTime |  |
| Company | `fldwsSQ3hHRsbfLst` | multipleRecordLinks |  |
| driveMainFolderID (from Company) | `fldD6pr9roxgO27HC` | multipleLookupValues |  |
| domain | `fldlWf4qHKUv6WDaE` | multipleLookupValues |  |
| LastModified | `fldwzhnSVo1HUkmEu` | lastModifiedTime |  |
| Additional Notes (Scheduler) | `fldadtz22X1cNBZu7` | multilineText |  |
| Client | `fldw3B0DOFYnzGGRJ` | multipleRecordLinks | Set = this is a client meeting (check-in, onboarding, working session with a paying client). The client's meeting history hangs off their registry row. Mutually exclusive in practice with the Company prospect link. |
| Meeting Type | `fldovXZY2n8RRdnkW` | singleSelect | sales = prospect-facing, pre-deal (the Company link points at the Prospects row). client = post-deal meeting with a paying client (the Client link points at the registry). Stamped by the Fathom sync and the backfill. - Choices: sales, client |
| Transcript | `fld6GvkTVE47Pro74` | richText | Full meeting transcript text when it fits the cell (100k char cap); otherwise blank and the RecordingLink is the source. Filled by the backfill and, where the payload carries it, by the sync. |
| Tasks | `fldffuARl0Vwe6T5x` | multipleRecordLinks |  |

## CONTROL PANEL (`tblLWcSxAPxB7BJzx`)

| Field | ID | Type | Notes |
|---|---|---|---|
| Automation Name | `fldlqMpAh5boEYKCP` | singleLineText |  |
| Form Path | `fldc1fPPJiajYFG2x` | url |  |
| Automation | `fldpXBChVRC1Vcapx` | button |  |

## Automations (`tbli7rV6Qf3sLpV6R`)

| Field | ID | Type | Notes |
|---|---|---|---|
| Execution ID | `fldBbgmbP8RqNRRcQ` | singleLineText |  |
| Automation | `fldRe2vzcg1UqYlVk` | singleSelect | Choices: Contagen -> Supersoniq -> Clayroots, Waterfall Emails, Storeleads Domains -> Clayroots, Storeleads Domains -> Supersoniq -> Clayroots, Verify Emails, Discolike Domains -> Clayroots, Qualify & Notify New Lead, Handle Intent, Handle New Lead, Sync Slack Logs to Vault, Sync Meeting Summaries to Vault, Handle New Discovery, Handle Another Meeting, Notify Subsequent Reply, Verify Catchalls Emails, Handle Intent Signal, Add Intent Leads to Alta, Handle New Lead from Alta, Append fields to table, Sync PlusVibe Campaigns to Hub, Add Contact Key, Merge Tables, Add rank in company to table, Handle New Lead from PlusVibe, Backfill Build Date, Sync Alta Campaigns to Hub, Log lead on BDR channel for moveplnr, Create PlusVibe Weekly Report, Pull campaign opens for adelante, Sync PlusVibe Leads to Clayroots, Sync BDR channel for moveplnr, Deploy View to Campaign, Sync Slack Logs, Sync PV Leads, Clean Company Names on table, Stamp Tag on table, Sync BDR Channel, Create PlusVibe Daily Infra Report, Sync PlusVibe Inboxes to Hub, AI-Ark Export -> Clayroots, Waterfall Phones, Add Intent Leads to PlusVibe, Sync Tool Credits to Hub, Handle New Booking, Backfill Intent Fields (one-off), Add Fields to Table (one-off), Handle Hiring Intent Signal, Land Companies from DiscoLike, Insert Discolike domains to Clayroots, Waterfall Contacts, Scaffold Client Base |
| Automation Title | `fld8I8LWbDmJ0UkM0` | formula |  |
| Client | `fldEAmAdxzBKeEyqy` | multipleRecordLinks |  |
| Status | `fldD4aa7LKaGX2Hkk` | singleSelect | Choices: Waiting, Succeeded, Failed, Running, Success, Succeeded with errors |
| Description | `fldkjN9bBmIIRFXe7` | richText |  |
| Run at | `fldHKwJcCmaLJpPNR` | dateTime |  |
| Target | `fldauHlDgfpJVElqI` | singleLineText | The table/list the automation ran on. |
| Duration s | `fld1VtzyEnQLrxslZ` | number |  |
| Execution Link | `fldijvTYzUTMp5CQx` | url |  |
| Build name | `flduXSF7RX9l0Beck` | singleLineText |  |
| Attachment | `fldFYVuecDxtu1otd` | multipleAttachments |  |
| Country | `fldVjqlvUkSOZ7ilb` | multipleSelects | Choices: United States, United Kingdom, Canada, Australia, Ireland, Israel, Germany, France, Netherlands |
| Platforms | `fldNj4CcpUQQHknRr` | multipleSelects | Choices: shopify, woocommerce, bigcommerce, wix, squarespace, magento |
| Monthly revenue | `fldoV5Dhm5kpbMHza` | multipleSelects | Choices: Under $10k, $10k-50k, $50k-100k, $100k-500k, $500k-1M, $1M+ |
| Employees | `fldGHOClHlDJTBwdT` | multipleSelects | Choices: 1-10, 11-50, 51-200, 200+ |
| Product count | `fldtnCXMp3JYlRKYE` | multipleSelects | Choices: 1-50, 51-500, 500+ |
| Store age | `fldt0hwSrtFguNpPy` | multipleSelects | Choices: Under 1 year, 1-3 years, 3+ years |
| Must-have app IDs | `fld7g2VBaVtbZxBBr` | singleLineText |  |
| Max companies | `fld52D6JJ25cFdrn1` | number |  |
| Contacts per company | `fldGFrHHCbP4s2a1v` | number |  |
| Seniority | `fldtL8kLruxOJabAA` | multipleSelects | Choices: C-Suite, Founder, Owner, President, VP, Head, Director, Manager |
| Departments | `fldUdypuQECMNXtxY` | multipleSelects | Choices: ALL, Executive, Engineering, Technology, Product, Data, R&D, Security, Design, Operations, Sales, Marketing, Finance, Human Resources, Customer Success, Project Management, Strategy, Legal, Supply Chain, Communications |
| Table ID | `fldBeD26SQUi6vRPe` | singleLineText |  |
| Max Rows | `fldJr6edxa2NQVZf3` | number |  |
| View | `fldWh9IcTtPUHf57B` | singleLineText |  |
| Records In | `fldA8q3yuYeyY4nhS` | number | Rows read by the run (written by the end-log upsert). |
| Records Out | `fld3EaUwoljUDoLH1` | number | Rows written by the run (written by the end-log upsert). |
| Errors | `fldmnHtnKmHpne5r4` | number | Errored records in the run. Written by the run-log leg. |
| Trigger | `fldA0SJ7j8J5GbTzK` | singleSelect | What started the run. - Choices: event, schedule, form, manual, scheduled, webhook, Scheduled |
| Created | `fldRDcrEU8POksrwY` | createdTime |  |
| Key Column | `fld1ZC0wMzoxDLudl` | singleSelect | Merge key for Append Fields to Table runs. Domain (default when blank) merges by the Domain column onto any table; Final Email merges onto contact-shaped tables only (the workflow guard refuses tables named *Domains*). Read by the launch leg of wOkccv1wDzBSO99d. - Choices: Domain, Final Email, Contact Key |
| Fields to Attach | `fldxWBmVXYJYVIrJf` | singleLineText | Optional, for Append Fields to Table runs: comma-separated CSV column names to merge |
| Dedupe Mode | `fld8G246L8qk8XQhv` | singleSelect | Deploy View to Campaign launch parameter. EMPTY = Strict (the default): skip anyone who ever existed anywhere in the workspace - never re-email the touched. Standard = skip only active/paused-campaign members (allows re-approaching COMPLETED leads - deliberate re-engagement only). Active-only = loosest. None = no PV-side skip at all. Choose a looser mode only when re-contact is the intended play. - Choices: Standard, Strict, Active-only, None |
| Summary (Description) | `flddA1Fn4OyVgOH6m` | aiText |  |
| Headline (Description) | `fldMl52z02uW08BJc` | aiText |  |
| Tag | `fldtn1rtMXiwmI9IU` | singleLineText | Optional free-text label the Operator sets at launch. Written onto every row a ClayRoots builder writes in that run, so a build can be traced back to what it was for. Blank is valid. Replaces the retired auto-set query_name. |
| Tally | `fldmawcP68KHYmqNf` | multilineText | Durable running totals for batched runs. Each sub-execution reads this, adds its own batch, and writes it back. Static data does not survive sub-executions, so the row itself is the accumulator. |
| Watermark OK | `fld9TYqUxyLMpxkBE` | checkbox | Sync PlusVibe Leads to Clayroots only. TRUE = this run read every campaign and lead successfully and wrote without failures, so the next run may safely start from its Run at. Invariant mismatches do NOT clear it (odd numbers are not missed data); pull failures, time-box aborts and write failures DO. The nightly's watermark = the newest scheduled run with this checked. |
| Plan | `fldMpvXXPAebnjsxL` | multipleSelects | Storeleads plan-tier filter. Currently only Shopify Plus is wired up (forces provider to shopify and adds f:plan=Shopify Plus). Read by Storeleads Domains -> Clayroots / Build SL Query. - Choices: Shopify Plus |
| Min monthly visits | `fldTN0qM3BP5iBYvi` | number | Storeleads Domains -> Clayroots launch filter: minimum estimated monthly site visits (f:evmin). Blank = no floor. |
| Category | `fldkiuShAJ6dfMXTu` | singleLineText | Storeleads Domains -> Clayroots launch filter: comma-separated exact Storeleads category paths (e.g. /Apparel/Athletic Apparel). Matches ANY listed (f:cat, OR). Blank = no category filter. |
| Technologies | `fldQLWkqMbSFbJVfs` | singleLineText | Storeleads Domains -> Clayroots launch filter: comma-separated exact Storeleads technology names (e.g. Klaviyo). Store must have ALL listed (f:tech, AND). Blank = no tech filter. |
| Domains Table ID | `fldWbRURgHGNpyzHL` | singleLineText | AI-Ark Export -> Clayroots only. The client's Domains table id (tblXXX) - company data source of truth for this run. Must contain 'domains' in the table name or the run refuses. |
| Contact | `fldnJWucAHpx2PgV6` | multipleRecordLinks | Waterfall Phones launch parameter. Set it to run the waterfall on ONE contact instead of sweeping a table: the launch leg fires just this row and ignores Table ID / View / Max Rows. Leave empty for a normal sweep. |
| Query ID | `fldrfqxnv48dOGz6X` | singleLineText | A saved DiscoLike query id (uuid). Read by Land Companies from DiscoLike: the query's domains land in the client's Companies table. |
| Sources | `fldNHjtxyFbWPVCD5` | multipleSelects | Waterfall Contacts: which contact sources this run may call. Blank means all three. - Choices: ContaGen, Supersoniq, AI-Ark |
| Fire Waterfall | `fldGnFF8bwe1DB5Y6` | checkbox | Waterfall Contacts: when checked, the run hands the People view Relevant & Not Waterfalled to Waterfall Emails at the end. Off until watched on real runs. |
| Table | `fldyIUpTgDWC7uAHN` | singleSelect | ClayRoots Standard: which table of the client base the run works on. With View it replaces Table ID; the machine resolves the table by name in the client's base. - Choices: People, Companies |
| Extras | `fldUzNoF5hN2LkbnV` | multipleSelects | Scaffold Client Base and Onboard Client: the declared extras groups to create on Companies for this client. Working machines never create columns; they refuse a base that lacks their group. - Choices: Storeleads, Hiring, Reviews |

## Sessions (`tbl3c80o7QlZ4VByU`)

| Field | ID | Type | Notes |
|---|---|---|---|
| Session | `fldmydw5lYnmMxSak` | singleLineText |  |
| Type | `fldqPYWvOvH3yZaMd` | singleSelect | Choices: List Build, Email Campaign, Linkedin Campaign, Infra Plumbing, Analysis / Strategy, Onboarding |
| Date | `fldsREbasPlRl6XU8` | dateTime |  |
| Log | `fldfvrtHMvGvzkFOO` | multilineText |  |
| Deliverables | `fldpPdyu0U5zLhFCN` | multilineText |  |

## Subscriptions (`tblUcwz9cU2hjYlD0`)

Define all recurring expenses and incomes for automatic transaction creation.

| Field | ID | Type | Notes |
|---|---|---|---|
| Name | `fldcBqgYsHMEIezdQ` | singleLineText |  |
| Amount | `fld4ONPaul3AZxyix` | currency |  |
| Fee Percentage | `fldaQwh3gd0XJ6W3g` | percent |  |
| Transaction Type | `fldI24OYka1MtAS27` | singleSelect | Choices: Income, Expense |
| Recurrence Pattern | `fldrNAsEW1b2AeO3d` | singleSelect | Choices: Daily, Weekly, Monthly, Quarterly, Yearly, Custom |
| Billing Day | `fldZvMTCVTDjXhp6f` | formula |  |
| Start Date | `fld8PvquXzr0763i9` | date |  |
| Category | `fldhpYi8rBLGAUFQ3` | singleSelect | Choices: Shared (General), Shared (Clients), Client-Specific |
| Current Month | `fldMXunZm1ilN8zK8` | formula |  |
| Description | `fldQjGupq9JQRsOUN` | multilineText |  |
| Expense/Income Group | `fld1VcgrUDNat3k27` | singleSelect | Choices: Payroll/Contractors, General, Tech Fee, Shared Infra, Inboxes, Domains, Retainer |
| Status | `flduNW817FxSofesR` | singleSelect | Choices: Active, Paused, Inactive |
| Is Today's Day? | `fldM7BlrW55Sv16pw` | formula |  |
| Net Budget | `fld2kXTJZPQM5E7hT` | formula |  |
| Client | `fldED25ViTZlXoouO` | multipleRecordLinks |  |

## Prospects (`tblEPFCO0kJn2tMyK`)

| Field | ID | Type | Notes |
|---|---|---|---|
| Name | `fldKopB6o3K2TlNjj` | singleLineText |  |
| Website | `fldFNjhOhms8uY7Jf` | url |  |
| Industry | `fldDkn75YSYmNFi4m` | singleSelect | Choices: Non-Profit, Info/Product, Marketing Agency, B2B SaaS, M&A, Cyber Security, Staffing, Consulting, |
| Headcount | `fldW5bbqdjo8ZBsHt` | singleSelect | Choices: 1–10, 11–50, 51–200, 201-500, 501-1000, 1001-5000, 5001-10000, 10001+, TO CHECK, 51-200, 1-10, 11-50 |
| ARR | `fldrrf2fD5qdRAfX6` | singleSelect | Choices: <1M, 1-10M, 10-100M, 100M-1B, >1B, TO CHECK |
| contextNotes | `fldbNcRX9vQOzzBP3` | richText |  |
| Created | `fldLR3ihpUsMcvyHJ` | createdTime |  |
| Client | `fldKDqiYJYTSbBR9g` | multipleRecordLinks |  |
| Qualification Brief | `fldip2HZKwMc4B5l7` | richText |  |
| domain | `fld0Lhd3IIxQe5o1P` | formula |  |
| OutreachStatus | `flduFHhXf6OuAteak` | singleSelect | Choices: Positive Reply, Disqualified, Holding, Scheduled Call, No Show, Call Completed, Lost |
| meetings | `fldORdmJ0IkCzWRaX` | multipleRecordLinks |  |
| Messages | `fldw7qF0Gfj0ZtKgy` | multipleRecordLinks |  |
| Contacts | `fldaF6w2c3KCzgNfH` | multipleRecordLinks |  |
| RecordId | `fld8s8tWFuQkfe15K` | formula |  |
| LastModified | `fldkSAxX272ww2sBb` | lastModifiedTime |  |
| metaAdsLibrary | `fldOvJwVBBsQYnKrz` | formula |  |
| LinkedIn | `fldf454rY9cqmUQ6u` | url |  |
| Twitter | `fldEHgnNC5GYOkrJi` | url |  |
| Proposal | `flda04KEj97EHL7PC` | richText |  |
| Transactions | `fldAgG7OOspnfsfjm` | singleLineText |  |
| Recurring Templates | `fldmC1FHcUwPQP7nV` | singleLineText |  |
| NextTouchDate | `fldw44Uz4LSGAFaZB` | date |  |
| QualificationStatus | `fldFfW5mYpoAIVijF` | singleSelect | ICP verdict auto-inferred from the Qualify Prospect (ICP + D100) workflow. Reflects whether the company qualifies as a Flowroots ICP based on the 5 ICP pillars. - Choices: Qualified, Needs Review, Disqualified, TO CHECK |
| Slack Thread TS | `fldGjnNEEIKbc1u8e` | singleLineText | The Slack ts of this prospect's lead card in the client/BDR channel. Written by the reply qualifier right after posting the card; the Slack-logs sync uses it to attach BDR call updates as record comments regardless of thread age. |
| Source | `fldIrOJOIkIk9TqjJ` | singleSelect | Choices: Email, LinkedIn, Booking, Intent, Referral |
| Conversation Thread OLD | `fldVouflW9N7J4JGR` | richText | The formatted pre-meeting email exchange, written by Handle New Lead from PlusVibe at creation. |
| First Engagement | `fldRaNIu0858X3DzZ` | dateTime | When the first reply was received — the lead's first engagement. Written by Handle New Lead from PlusVibe from the reply timestamp. |
| Campaign | `fldW4NU8U5J7gbdle` | singleLineText | The campaign name this lead came from. Written by the intake automations (PlusVibe / Alta). |
| Campaigns | `fldXpEtMJkatWDNlU` | multipleRecordLinks |  |
| Alta Prospect ID | `fldAePK1oOovxwnIb` | singleLineText | Alta's prospect UUID for this lead. Written by Handle New Lead from Alta; the daily thread sync uses it to pull the full exchange. |
| Alta Msg ID | `fld3hvBNAJsYfzhA5` | singleLineText | Alta message UUID of the latest reply. Written by the intake; the daily thread sync uses it to resolve the rep before pulling messages. |
| PipelineStatus | `fldThLjR5rrZap1tG` | singleSelect | Choices: Hot List, Followup (BAMFAM), Followup (No Meeting), Holding, Strategic Holding, Closed Won, Closed Lost, Call Completed, Scheduled Call |
| Last Engaged | `fldP8Bxp0gO8iQ4H6` | dateTime | The lead's most recent reply (THEM). Written by the thread syncs and the Alta intake append. |
| Last Touch | `fldmB7GcvEejlICBv` | dateTime | Last outbound touch from us (US message). Written by the thread syncs. |
| Conversation Thread | `fldvwraYRrJzkE3ye` | richText | The full conversation, formatted. Written by the intakes at first reply and refreshed by the 12-hourly platform syncs. |
| Positive Reply Lead | `fldZKGnu04nvwEkXH` | checkbox | Lead arrived via a positive (interested) reply, permanently, regardless of current status. Set by the intakes on creation; backfilled per-row evidence for legacy rows. Read by the PlusVibe Weekly Report for Positive Replies metrics. |
| Call Booked At | `fldBX54DU6mLJh1Qu` | date |  |
| BDR Thread TS | `fldPwliALXPSqolbF` | singleLineText | Slack message ts of the BDR-channel card for this lead. Separate from Slack Thread TS (the main client-channel card) so both threads survive and both sync back to this record as comments. |
| Brief (shareable) | `fldfoLIqq8qybYL7z` | formula | The whole lead in one paste-able block for WhatsApp/SMS/Slack. Formula, so it is always current and needs no backfill. |
| Contact Name | `fldypStxzrhd6ihd1` | multipleLookupValues |  |
| Contact Phone | `fldpChgOOjO7FrNfE` | multipleLookupValues |  |
| Contact Email | `fld7raHeRILRIRImo` | multipleLookupValues |  |
| Contact Title | `fldrJxOMRXHQ720sI` | multipleLookupValues |  |
| Campaign Copy | `fldwdYr7wx5cSXA8t` | multipleLookupValues | The actual email sequence this lead received, pulled through the Campaigns link. So a BDR can see the exact words that made them reply. |
| Dedup Key | `fldDcXREP2ochqtOx` | singleLineText | Deterministic identity for this company row: {client slug}\|{domain}, lowercase. Written by the reply intakes at create time and used as the Airtable upsert merge key, so two people replying from the same company land on ONE company row with two linked Contacts, even when their webhooks arrive simultaneously. Must be a real text field: Airtable upsert cannot merge on computed fields. |
| Open in Pipeline | `fldFVpViMjQ6EIHhf` | url | Deep link into the Pipeline INTERFACE for this record, for people who have interface access only and never see the data tables. Base64 detail blob = {"pageId":"pagU8C93nMn6vPMTM","rowId":"<recordId>","showComments":false,"queryOriginHint":{"type":"pageElement","elementId":"peltAxZAiHtDEaCHV","queryContainerId":"pelN4ASCDth1yMJpJ"}} - only rowId varies. Written by the intakes (n8n btoa); Airtable formulas cannot base64-encode. |
| Timezone | `fldlHgfmt6q0PVrX9` | singleLineText | The lead's timezone abbreviation (ET, CT, MT, PT, GMT, CET...) from the qualifier. Stored so every later reader can render times in THEIR clock instead of ours: the Slack cards, the BDR card's local-time line, and the 12-hourly thread re-render. The intake's Format Thread runs before the qualifier, so it cannot know this at first write; the sync picks it up on the next pass. |
| Lead Routine ID (DEPRECATED) | `fldXfWYgoNVudTOfc` | singleLineText | DEPRECATED 2026-08-12, never used, safe to delete. Created on a wrong reading that each LEAD gets its own routine. The actual model is one routine per client per channel, fired by the intake at the end of each run; the routine then works the most recently engaged lead. The routine ids live on the Clients registry, not here. |
| Last Touch or Last Engaged | `fldueqsfIMsUnHtQV` | formula | Shows the Last Touch date if available, otherwise shows the Last Engaged date. |

## Content Posts (`tblfDTNBIZffcWaLQ`)

Track and analyze the performance and workflow of your social media posts.

| Field | ID | Type | Notes |
|---|---|---|---|
| Post Title | `fldniniAXgzJsu7Lk` | singleLineText |  |
| Post Date | `fldS634z3fZUkVakE` | date |  |
| Platform | `fldQzJBsEWs9PpQGI` | singleSelect | Choices: LinkedIn, X, YouTube |
| Format | `fld1qNXqzpjUjDal2` | singleSelect | Choices: Text, Carousel, Video, Poll, Image |
| Topic / Angle | `fldv8MxNpMmLUOK7q` | singleLineText |  |
| Impressions | `fldrXpKz7OyOal4jM` | number |  |
| Likes | `fldvNJaw1a5ZTGssi` | number |  |
| Comments | `fld0tbJ8qnTjhRSyg` | number |  |
| Reposts | `fld3yrnNt2r4rzvMv` | number |  |
| Followers Gained | `fldS3kWzrfuxUvVLI` | number |  |
| DMs / Leads | `fld994OVgARtTgAKX` | number |  |
| Post URL | `fldRcOyJF22pDQHZE` | url |  |
| My Rating | `fld28F7JC6dMydA4X` | rating |  |
| Notes | `fldxHRBba7uucIAfk` | richText |  |
| Status | `fldY69RJ0i2dSECj2` | singleSelect | Choices: Idea, Writing, In Review, Scheduled, Posted |
| Engagement Rate % | `fldNieyDifx8JKMjK` | formula |  |
| Post Content | `fldc2BlbKZoijTLzG` | richText |  |
| Post Attachments | `fldIfUUEubAUPi7pD` | multipleAttachments |  |
| recordId | `fldOxbpB6K8ZOXY9H` | formula |  |

## Campaigns (`tblbVPakE4n16ob7Y`)

One row per campaign instance across sequencers. Upserted on Campaign ID by two writers: the nightly Sync PlusVibe Campaigns automation (stats refresh + discovery) and the reply intakes (create-on-first-reply). Client-facing metrics only.

| Field | ID | Type | Notes |
|---|---|---|---|
| Campaign | `fldFFwUZM2EmH5DZf` | singleLineText | Campaign name as it appears in the sequencer. |
| Campaign ID | `fldMTy0FVY7GvD6BY` | singleLineText | The sequencer's campaign instance ID. THE upsert key for all writers. |
| Sequencer | `fldiDh8kyaOhcDM0t` | singleSelect | Choices: PlusVibe, Alta, HeyReach |
| Channel | `fldgPKKAZLnzRUzM8` | singleSelect | Choices: Email, LinkedIn, Multi |
| Status | `fld9NY8nCEV19lQwX` | singleSelect | Choices: ACTIVE, PAUSED, COMPLETED, DRAFT, STOPPED |
| Leads | `fldTFeMS0NJVMcRmx` | number |  |
| Messages Sent | `fldbxIY1BXGNJh2lD` | number |  |
| Replies | `fldaS7xqlohKlMbds` | number |  |
| Positive Replies (PV) | `fldPmajcH8usJNLMf` | number | The sequencer's own positive count. The dashboard uses Positive Replies (CRM) instead. |
| Created | `fldzxjfkuXoV7MduY` | date |  |
| Last Synced | `fld7hEzeiacXFev4d` | dateTime |  |
| Client | `fldWg9V9OtFDeoB9O` | multipleRecordLinks |  |
| Prospects | `fldJ1RVI3PjYtJ2Yk` | multipleRecordLinks | The answered leads that came from this campaign instance. Linked by the reply intakes. |
| Positive Replies (CRM) | `flditD18f6PHO1baC` | count | Our own count: linked Prospects rows. The number the client dashboard shows. |
| Contacted | `fldNu3Om1nTQAYx8C` | number | Unique leads actually contacted (PV lead_contacted_count). The denominator for reply rates. |
| Completed | `fldgHytekatAi1n03` | number | Leads that finished the full sequence (PV completed_lead_count). |
| Bounced | `fld9h1gkPXHRBkU0d` | number | Bounced emails (PV bounced_count). |
| Last Sent | `fld7UgD7wxjxmcWC0` | dateTime | Last email sent from this campaign (PV last_lead_sent). The real is-it-alive indicator; Status can read ACTIVE while stalled. |
| Reply Rate | `fldvFW9QYi1EuWe9h` | formula | Replies per contacted lead. Same computation PV shows in-app. |
| Positive Rate | `fld3cooJsIh2ZG2t5` | formula | Positive replies per contacted lead. |
| Bounce Rate | `fldSjCeiiBKphkS2M` | formula | Bounces per email sent. Deliverability health; PV pauses the campaign at 5%. |
| Completion | `fldz1XZ26qv5NHGVS` | formula | Share of enrolled leads that finished the sequence. Campaign burn-down. |
| Not Interested (est) | `fldwQQYmaCxzuEZBm` | formula | Inferred: all replies minus positive. Upper bound - PV replied_count includes auto-replies (OOO), so real not-interested is at or below this. |
| Positive Replies | `fldFhmmrrOZ31sCwC` | formula |  |
| Campaign Copy | `fldpbuU9XSRpIhkjm` | richText |  |
| Opens | `fldZaUTn9PJi4Ba4O` | number | Total opens including repeats by the same lead (PV opened_count). Meaningless unless Open Tracking is checked. |
| Unique Opens | `fldY5negMOkWTcTTl` | number | Distinct leads who opened at least once (PV unique_opened_count). The numerator for Open Rate. Meaningless unless Open Tracking is checked. |
| Open Tracking | `fldgURTx3mJwfeXMH` | checkbox | Whether PV open tracking was enabled on this campaign (PV is_emailopened_tracking). Unchecked means opens were NOT measured, so Opens 0 is an absence of data, not an absence of opens. As of 2026-08-06 tracking is on for Adelante Shopify Plus campaigns only. |
| Open Rate | `fldEQ6kbq5qKcHOnB` | formula | Unique Opens per contacted lead. Same computation PV shows in-app. Deliberately BLANK when Open Tracking is unchecked, so an unmeasured campaign never reads as 0% and drags the report down. |
| Openers | `fldQSNF5FHrhEtL0D` | multipleRecordLinks |  |
| Lead Lists | `fldOyL4INmC7cMu4p` | multipleRecordLinks |  |
| Signal | `fld0fqwBbRfLIThPz` | multipleRecordLinks |  |
| Pull-in URL | `fldleh9GZLj3V83EN` | url |  |
| Record ID | `fldiHNzJbMga4onFi` | formula | This row's Hub record id, synced into every client base's Campaigns mirror so machines link by id, never by name. |
| Table | `fldr4Ua9qSm20qGMr` | singleSelect | ClayRoots Standard: the client-base table this campaign's views (PV Leads View, Signal View, the selector) live on. People for contact campaigns, Companies for company-inbox campaigns. - Choices: People, Companies |

## Signals (`tblDtJeqkUB2JFga1`)

| Field | ID | Type | Notes |
|---|---|---|---|
| Name | `fldSxLq0GqMKRsAD8` | singleLineText |  |
| Signal Type | `fldFlLFyp0fbh2oUK` | singleSelect | Choices: hiring, trustpilot_reviews |
| Roles | `fldWNyb4tVR7K4e1l` | multilineText |  |
| Country | `fldpzI1Fe3VmBgnK9` | singleLineText |  |
| Max Employees | `fldXd78J9ZdrXOxV7` | number |  |
| ICP | `fldrZ7I8ai7caze5b` | multilineText |  |
| Client | `fldW6Binf0wnpLxZs` | multipleRecordLinks |  |
| Campaigns | `fldNSaJ1fsF4QGGlT` | multipleRecordLinks |  |
| Record ID | `fldnHIgKG5CRzz9PM` | formula | This row's Hub record id, synced into every client base's Signals mirror so machines link by id, never by name. |
| View | `fldOtjp7UF0pXLpCP` | singleLineText | The id (viw...) of this signal's live queue view on the client's People table: relevant people at companies that signalled, inside the freshness window. The daily feed deploys this view into every campaign linked to the signal; each door applies its own channel gate. |

## Reports (`tblUFzAV4sysSJktK`)

Weekly client reports. One row per client per run, written by the PlusVibe Weekly Report n8n automation every Friday. The Report field holds the full rendered report; the Slack post in the client channel carries the same content.

| Field | ID | Type | Notes |
|---|---|---|---|
| Name | `fld8MqeoRF6ZZQSlo` | singleLineText |  |
| Client | `fldug2a9DoYBm9KJn` | multipleRecordLinks |  |
| Week Start | `fldhV6RIkOe8OuD5r` | date |  |
| Week End | `fldhbPGZBIKbxwymm` | date |  |
| Emails Sent (Week) | `fldMu22qPLmQ4nqGH` | number |  |
| Replies (Week) | `fldD5Y6Qkjn4KP8tj` | number |  |
| Positive Replies (Week) | `fldQDQ2ZoS8QK5CiO` | number |  |
| Prospects All-Time | `fldlUUk4XFHR6CKWT` | number |  |
| Positive Replies All-Time | `fld5aqap0SLDi5wUf` | number |  |
| Report | `fldxreGLFwdB8kXP9` | richText |  |
| Campaigns Launched (Week) | `fldPXmXJTqXejLBih` | number |  |
| Prospects Contacted (Week) | `fld85A69vK8pjwja7` | number |  |
| Calls Booked (Week) | `fldB5tyW3OII6CEUV` | number | Left empty until a booking-date stamp exists in the Hub. Rendered as - in reports. |
| Campaigns All-Time | `fldq6aRJJJdEtDG1i` | number |  |
| Emails Sent All-Time | `fldsYaI6C9sZFrSxp` | number |  |
| Prospects Contacted All-Time | `fldKE5wqfugIBaB0k` | number |  |
| Replies All-Time | `fldDYh2Iz0gQOsfEC` | number |  |
| Calls Booked All-Time | `fldLTpbSsmnVjSNDE` | number |  |
| Type | `fldYxP0H5d13ZaZFu` | singleSelect | Choices: Weekly, Custom, Infrastructure, Daily |
| Creation Date | `fldLjNA15VB4dYBPu` | createdTime |  |
| DriveLink | `fldVnK4xu7unDGVTs` | url |  |

## Openers (`tblPcilRrsiEeyIyn`)

One row per lead who opened at least once, per campaign. Written by the pvsync add-on from PlusVibe lead/workspace-leads. Only campaigns with Open Tracking on are walked. NOT prospects: an open is a tracking pixel firing, which may be a mail scanner rather than a person. Never counted in pipeline metrics.

| Field | ID | Type | Notes |
|---|---|---|---|
| Email | `fldy9RoDzpQa1gNvt` | email | The lead's email address. Upsert key together with Campaign. |
| Opens | `fldtQk4uuPrq8aUNE` | number | Times the tracking pixel fired for this lead (PV opened_count). Includes scanner and prefetch loads, so treat as a ranking signal, not a count of human reads. |
| Company | `fldPC2vtSrzYBD2my` | singleLineText |  |
| Campaign | `fldtk8gACwXHifh7U` | multipleRecordLinks |  |
| Client | `fldyae2pNgyp2GmBR` | multipleRecordLinks |  |
| Replied | `fldZm4JVT9xoTOvk0` | number | PV replied_count. Greater than 0 means this opener also replied and likely already exists as a Prospect. |
| Status | `fldoeKmbaUukXJAE1` | singleLineText | PV lead status at time of sync (COMPLETED, PENDING, etc). |
| MX | `fldh4en6oevqloue6` | singleLineText | Recipient mail provider. MICROSOFT365 and Apple inflate opens via scanning and prefetch. |
| PV Lead ID | `fldRHxm7ZodHlnbno` | singleLineText | PlusVibe lead _id. Used to build the conversation link and to dedupe. |
| Conversation | `fldMTMTCQXXAdVYBl` | url | Deep link to this lead's conversation in the PlusVibe unibox. |
| Last Synced | `fldlun3zqXJv0Wr4Z` | dateTime |  |
| PV Leads View | `fldzZgyRDVTDLCZDb` | multipleLookupValues | The PlusVibe leads view for this row's campaign, read through the Campaign link. Nothing is written here. |

## Lead Lists (`tblpy5Qt0j6TyDhqF`)

One row per deployed final view: {table} - {view}. Created by the Deploy View to Campaign automation at run time. Campaign = the single campaign this list fed (same view into another campaign = another row). List CSV = client-facing share link; mechanism TBD, pasted by the Operator for now.

| Field | ID | Type | Notes |
|---|---|---|---|
| Name | `fldoUbdZNq2XQrSO1` | singleLineText | {table} - {view}, written at deploy run time |
| Campaign | `fldeLPjBDcQ9pCdLy` | multipleRecordLinks | Exactly one campaign per row |
| List URL | `fldx7jBAH2o1XuIqH` | url | Client-facing link to the list (share view / CSV). Mechanism TBD; Operator-pasted for now |
| View Link | `fldQSPR23nP39jXvl` | url | Deep link to the exact Airtable view this list was deployed from. Built by Deploy View to Campaign as <client Clayroots shareable link>/<tableId>/<viewId>. |
| Deployed | `fldQkDnj1kE4U5jEj` | number | How many leads this deploy confirmed into the campaign at read-back. Written by Deploy View to Campaign. |

## Inboxes (`tblgdmibPyC2dRlVK`)

One row per PlusVibe sending inbox, upserted by Account ID. Mirrors Campaigns: current state + yesterday's activity, refreshed daily by Sync PlusVibe Inboxes to Hub.

| Field | ID | Type | Notes |
|---|---|---|---|
| Inbox | `fldkANsKzUs8ikHrZ` | singleLineText |  |
| Account ID | `fldSrSCkm5dgB91uh` | singleLineText | PlusVibe account _id. THE upsert key for all writers. |
| Client | `fldpAz2N7oTNWScd3` | multipleRecordLinks |  |
| Domain | `fldQgpTvyzirUaurs` | singleLineText |  |
| Status | `fldsAbMUF6G1gnqIm` | singleSelect | Choices: ACTIVE, PAUSED, ERROR, ALERT |
| Warmup Status | `fld94dAgNrjXGRJ9t` | singleSelect | Choices: ACTIVE, PAUSED, INACTIVE |
| Provider | `fldI7wCBPUk2incqK` | singleLineText |  |
| Daily Limit | `fld8bDsP2TRj8X4Gw` | number |  |
| Sent (All-Time) | `flduqTfp0cSwAqSM3` | number |  |
| Replies (All-Time) | `fld5mKbqv4YLF7HVO` | number |  |
| OOO Replies (All-Time) | `fldrb82WuBpGRl5va` | number |  |
| Positive (All-Time) | `fld1bxIBr6fYU7fX0` | number |  |
| Bounced (All-Time) | `fldizmg1Fvj0SvfNW` | number |  |
| Warmup Health (7d) | `fldLtS90bQ5SVDfdH` | number |  |
| Miss Warmup Rate | `fldEc75p9zvsqz514` | number |  |
| Bounce Rate (3d) | `fldLxHs5iim8UBB6O` | number |  |
| Reply Rate (7d) | `flduTVHGuKc0yWqhe` | number |  |
| Last Synced | `flddxE5wWm303pSVX` | dateTime |  |
| Tags | `fldZjFfx5Nwk87pig` | singleLineText | PlusVibe tag names for this inbox, comma-separated. |
| Domain Link | `fldyDd6rEmi9krZnd` | multipleRecordLinks |  |
| Domain Replies (All-Time) | `fldD0coC7Xva5qRpG` | multipleLookupValues |  |

## Domains (`tbltRqDRQm0YQy3tQ`)

One row per sending domain per client, linked from Inboxes. Rollups aggregate all-time stats across every inbox on that domain. Upserted by Sync PlusVibe Inboxes to Hub.

| Field | ID | Type | Notes |
|---|---|---|---|
| Domain | `fldMcitTB60CeAOCJ` | singleLineText |  |
| Client | `fldz2S7gihalU2UMS` | multipleRecordLinks |  |
| Last Synced | `fldEACG3axtny5k5y` | dateTime |  |
| Inboxes | `fld172r5q92gtqgUM` | multipleRecordLinks |  |
| Replies (All-Time) | `fldkS3gdaAhTEm20Z` | rollup |  |
| Sent (All-Time) | `fldV1XP0bo8J0Eewi` | rollup |  |
| Positive (All-Time) | `fldy4Wr3lDZ8WwumV` | rollup |  |
| Bounced (All-Time) | `fld47mZufldUaz6vO` | rollup |  |
| Inbox Count | `fldqTcJgXmMpco4dq` | count |  |
| Tags | `fldN6oLszhN7LeXdb` | rollup |  |
| OOO Replies (All-Time) | `fldX3AwY7fwORQs1D` | rollup |  |

## Credits (`tblVhx3LWFm5Ot6Jg`)

One row per paid tool, refreshed daily by Sync Tool Credits to Hub (06:00 IL, plus on demand). Credits is the balance as the tool's API reports it; a tool whose API has no balance endpoint keeps Checked At empty and says so in Note. Alert Below is Operator-set; Alert drives the Slack line in flowroots-pulse.

| Field | ID | Type | Notes |
|---|---|---|---|
| Tool | `fldXtiya7qhAVH30c` | singleLineText | Tool name. THE upsert key. |
| Credits | `fldvlz34pMSMT15ro` | number | Current balance as the tool's API reports it. |
| Unit | `fldzO6sM4ChY4vC0c` | singleLineText | What one credit buys for this tool (verifications, contacts, USD...). |
| Plan | `fldt7aWVqDQTOsG8t` | singleLineText |  |
| Renews | `fldUWe7k9kJmJbLyt` | date | Next reset or renewal, when the API says. |
| Checked At | `fldyfUZGEkMh61hhY` | dateTime | Last successful read. |
| Previous Credits | `fldx8IXuxTYZjkPS6` | number | The balance at the previous successful read. |
| Daily Burn | `fldxKLORrCZVlu8Lr` | number | Previous Credits minus Credits, normalised to 24h. Negative means a top-up landed. |
| Alert Below | `fldZEvpJ38382hQZi` | number | Operator-set floor. Blank = no alert. |
| Endpoint | `fld7ZeiCL3rLvleOJ` | singleLineText | The exact path read, for debugging. |
| Last Error | `fldTKxIRrvtrPvWqs` | multilineText | The provider's actual response when the read fails. |
| Note | `fldPAsFji8G2keISK` | multilineText |  |
| Client | `fldajNLgMrDr8hijN` | multipleRecordLinks | Only for per-client-billed tools. |
| Days Left | `fldKwU8hjW4raLXyJ` | formula | Credits divided by Daily Burn. Blank until two reads exist or when burn is zero. |
| Alert | `fldkLhtm5XSEGs73b` | formula | Credits under the Operator-set floor. Read by the sync for the Slack line. |

## Task Templates (`tbl8E4UHtmhFLNH5T`)

Reusable task definitions. One row = one repeatable thing. Fires two ways: on a schedule (Active + Recurrence, spawned each morning by the Spawn Recurring Tasks automation) or on demand. The spawner NEVER creates a second task while one from this template is still open, so a missed occurrence stays a single overdue row instead of piling up. Editing a template does not touch tasks already created; the copy happens once, at spawn.

| Field | ID | Type | Notes |
|---|---|---|---|
| Name | `fldO505hgf2a13IcK` | singleLineText |  |
| Client | `fldbV93xajKQTUTaH` | multipleRecordLinks |  |
| Area | `flds3rgSzepsqTsPU` | singleSelect | Choices: Sales, Marketing, Content, Fulfillment, Rootworks, Finance, Admin |
| Steps | `fldLIBQd5i7BRWAxr` | richText |  |
| Recurrence | `fldGsQ11kGJ57ccCr` | singleSelect | Choices: Daily, Weekly, Monthly, None |
| Day | `fldbMt0ALgPaIGrZ4` | singleLineText | Weekly: one or more weekday names, e.g. Mon or Mon, Wed, Fri. Monthly: a number 1 to 28. Daily: leave empty. |
| Active | `fldSoE5V6KKKr8HJZ` | checkbox |  |
| Tasks | `fldWzrjY04DMSyidl` | multipleRecordLinks |  |
| Open Tasks | `fld2Wpyi4h5Z5Atua` | rollup |  |
| Due Today | `fldwibfsdRiSnusZr` | formula |  |
| Spawn Now | `flduTYuTOQxZwhXk5` | formula |  |

## Tasks (`tblpFK50lVGNVZgBU`)

The task list. One row per thing to do. Due is the date it was meant to happen and never moves on its own: miss it and it sits overdue with its real date. Rows arrive two ways, typed in by hand (Template blank) or spawned from a Task Templates row (Template linked). No priority field by design.

| Field | ID | Type | Notes |
|---|---|---|---|
| Task | `fld7frgFSmZl5vT4E` | singleLineText |  |
| Status | `fldMe8ww2TFRNOcsD` | singleSelect | Choices: Todo, Doing, Done |
| Area | `fldmLAl88SoVy0Ozu` | singleSelect | Choices: Sales, Marketing, Content, Fulfillment, Rootworks, Finance, Admin |
| Due | `fldE8J5gr7MAnEWUN` | date |  |
| Client | `fldbJi3ljg25on8fP` | multipleRecordLinks |  |
| Client Name | `fldAc5TVVrFkxDRXl` | multipleLookupValues |  |
| Steps | `fldVsBMTVdwaKNLf9` | richText |  |
| Notes | `fld3cbiJCKPjTkfqf` | richText |  |
| Template | `fldHg96af92T61wTx` | multipleRecordLinks |  |
| Created | `fldIuWL5eZ5cLWUiZ` | formula |  |
| Is Open | `fldzguefLM3Yd010o` | formula |  |
| From Meeting | `fldXdeUUvrCosmtT7` | multipleRecordLinks |  |
| Summary (Notes) | `fldVl9ghXZfXPqDSE` | aiText |  |
| Headline (Notes) | `fldPWEqMFEgzIMTx5` | aiText |  |
| Progress | `fldFDhquOrBqaVzBX` | formula |  |
