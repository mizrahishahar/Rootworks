# Field register

Compiled from `n8n/Onboard-Client/nodes/Scaffold-Register.js` by `scripts/register.js`. Do not hand-edit.
This file is what every client base's tables ARE; why they exist lives in Flowroots/Operations/Field Standard.md and List Building 2.0.md.
Core fields are born at the scaffold. Declared extras are created only by their owner machine. Anything else on a base is the Operator's.
Views are declared per table as data (filter, fields, sort); the Operator makes them in the base from this spec.

## Companies

Primary field: Domain. 43 fields.

| Field | Type | Options | Kind |
|---|---|---|---|
| Domain | singleLineText |  | plain |
| Company | singleLineText |  | plain |
| Description | multilineText |  | plain |
| Industry Groups | singleLineText |  | plain |
| Business Model | singleLineText |  | plain |
| Employees | singleSelect | 1-10 (blueLight2), 11-50 (cyanLight2), 51-200 (tealLight2), 201-500 (greenLight2), 501-1000 (yellowLight2), 1001-5000 (orangeLight2), 5001-10000 (redLight2), 10001+ (purpleLight2) | plain |
| Revenue Range | singleLineText |  | plain |
| Keywords | singleLineText |  | plain |
| Country | singleLineText |  | plain |
| State | singleLineText |  | plain |
| City | singleLineText |  | plain |
| Street | singleLineText |  | plain |
| Zip | singleLineText |  | plain |
| Phones | singleLineText |  | plain |
| Public Emails | singleLineText |  | plain |
| Social URLs | singleLineText |  | plain |
| public_emails_clean | singleLineText |  | plain |
| MX Provider | singleLineText |  | plain |
| Redirect Domain | singleLineText |  | plain |
| Domain Source | singleLineText |  | plain |
| Tag | singleLineText |  | plain |
| Build Date | formula | `CREATED_TIME()` | formula |
| Contacts Pulled At | dateTime | iso, 24hour, utc | plain |
| Contacts Count | count | of People | count |
| Contact Sources | rollup | People.Contact Source, `ARRAYUNIQUE(values)` | rollup |
| Signals | multipleRecordLinks | to the client's synced Signals mirror | mirrorLink |
| Signal At | dateTime | iso, 24hour, utc | plain |
| ICP Reason | multilineText |  | plain |
| Email | singleLineText |  | plain |
| MV P0 | singleSelect | ok (greenBright), catch_all (yellowBright), invalid (redBright), disposable (orangeLight2), unknown (grayBright), error (orangeBright), skipped (grayLight2) | plain |
| BB | singleSelect | verifying (blueBright), deliverable (greenBright), undeliverable (redBright), risky (yellowBright), unknown (grayBright), error (orangeBright), skipped (grayLight2) | plain |
| Final Email | singleLineText |  | plain |
| Status | singleSelect | done (greenBright), verifying (blueBright), no_email_found (redBright), error (orangeBright) | plain |
| Campaigns | multipleRecordLinks | to the client's synced Campaigns mirror | mirrorLink |
| Sequencers | multipleLookupValues | Campaigns.Sequencer, through the link to the client's synced Campaigns mirror. The senders that already hold this row, one per linked campaign. A campaign-feeding view excludes only its own sender with a does-not-contain test, so the same person can legitimately sit in campaigns on two different senders. | mirrorLookup |
| Messages Sent | number | precision 0 | plain |
| Last Contacted | dateTime | iso, 24hour, utc | plain |
| Campaign Status | singleSelect | NEVER_CONTACTED (grayLight2), IN_SEQUENCE (blueBright), COMPLETED (greenBright), REPLIED (purpleBright), BOUNCED (redBright), UNSUBSCRIBED (orangeBright) | plain |
| Bounce Reason | singleLineText |  | plain |
| Synced At | dateTime | iso, 24hour, utc | plain |
| Deploy Error | singleLineText |  | plain |
| manually_approved | checkbox | greenBright check | plain |
| relevance | formula | `IF(OR({manually_approved}, {public_emails_clean} != ""), 1, 0)` | formula |

### Declared extras on Companies

| Group | Owner | Field | Type | Options |
|---|---|---|---|---|
| Storeleads | Insert Storeleads domains to Clayroots | Plan | singleLineText |  |
| Storeleads | Insert Storeleads domains to Clayroots | Revenue Est Monthly | number | precision 0 |
| Storeleads | Insert Storeleads domains to Clayroots | Store Age Years | number | precision 1 |
| Storeleads | Insert Storeleads domains to Clayroots | Product Count | number | precision 0 |
| Storeleads | Insert Storeleads domains to Clayroots | App Spend Mo | number | precision 0 |
| Storeleads | Insert Storeleads domains to Clayroots | Key Apps | singleLineText |  |
| Storeleads | Insert Storeleads domains to Clayroots | Tech Stack | singleLineText |  |
| Storeleads | Insert Storeleads domains to Clayroots | Trustpilot Rating | number | precision 1 |
| Storeleads | Insert Storeleads domains to Clayroots | Trustpilot Reviews | number | precision 0 |
| Storeleads | Insert Storeleads domains to Clayroots | Migrated From | singleLineText |  |
| Storeleads | Insert Storeleads domains to Clayroots | Social Followers | singleLineText |  |
| Storeleads | Insert Storeleads domains to Clayroots | Growth 90d | singleLineText |  |
| Storeleads | Insert Storeleads domains to Clayroots | Features | singleLineText |  |
| Hiring | Handle Hiring Intent Signal | Job ID | singleLineText |  |
| Hiring | Handle Hiring Intent Signal | Job Title | singleLineText |  |
| Hiring | Handle Hiring Intent Signal | Job Link | url |  |
| Hiring | Handle Hiring Intent Signal | Job Posted | date | iso |
| Hiring | Handle Hiring Intent Signal | Job Description | multilineText |  |
| Hiring | Handle Hiring Intent Signal | Job Seniority | singleLineText |  |
| Hiring | Handle Hiring Intent Signal | Job Function | singleLineText |  |
| Hiring | Handle Hiring Intent Signal | Job Employment Type | singleLineText |  |
| Hiring | Handle Hiring Intent Signal | Job Industries | singleLineText |  |
| Hiring | Handle Hiring Intent Signal | Job Applicants | number | precision 0 |
| Hiring | Handle Hiring Intent Signal | Job Salary | singleLineText |  |
| Hiring | Handle Hiring Intent Signal | Job Poster Name | singleLineText |  |
| Hiring | Handle Hiring Intent Signal | Job Poster Title | singleLineText |  |
| Hiring | Handle Hiring Intent Signal | Job Poster LinkedIn | url |  |
| Hiring | Handle Hiring Intent Signal | Existing In Role | number | precision 0 |
| Reviews | Handle Service Reviews Intent Signal | Review Count | number | precision 0 |
| Reviews | Handle Service Reviews Intent Signal | Review Latest | date | iso |
| Reviews | Handle Service Reviews Intent Signal | Review Link | url |  |
| Reviews | Handle Service Reviews Intent Signal | Review Titles | multilineText |  |
| Reviews | Handle Service Reviews Intent Signal | Review Quotes | multilineText |  |
| Reviews | Handle Service Reviews Intent Signal | Review Replied | singleLineText |  |
| Reviews | Handle Service Reviews Intent Signal | Trustpilot Rating | number | precision 1 |
| Reviews | Handle Service Reviews Intent Signal | Trustpilot Reviews Total | number | precision 0 |
| Reviews | Handle Service Reviews Intent Signal | Trustpilot URL | url |  |

### Views on Companies

| View | Filter | Formula | Fields | Sort |
|---|---|---|---|---|
| Not Sourced | Contacts Pulled At is empty | `NOT({Contacts Pulled At})` | Domain, Company, Description, Employees, Tag, Contacts Count, Contact Sources, Contacts Pulled At, Build Date | Build Date desc |
| Not Covered | Contacts Pulled At is set and Contacts Count = 0 | `AND({Contacts Pulled At}, {Contacts Count} = 0)` | Domain, Company, Description, Employees, Tag, Contacts Count, Contact Sources, Contacts Pulled At, Build Date | Build Date desc |
| Covered | Contacts Count > 0 | `{Contacts Count} > 0` | Domain, Company, Description, Employees, Tag, Contacts Count, Contact Sources, Contacts Pulled At, Build Date | Build Date desc |
| Cut Review | relevance = 0 | `{relevance} = 0` | Domain, Company, Description, Employees, Tag, manually_approved, Build Date | Build Date desc |
| Not Waterfalled | relevance = 1 and Status is empty | `AND({relevance} = 1, NOT({Status}))` | Domain, Company, Description, Tag, public_emails_clean, Email, MV P0, BB, Final Email, Status, Build Date | Build Date desc |
| Not Found | relevance = 1 and Status is no_email_found or error | `AND({relevance} = 1, OR({Status} = "no_email_found", {Status} = "error"))` | Domain, Company, Description, Tag, public_emails_clean, Email, MV P0, BB, Final Email, Status, Build Date | Build Date desc |
| Found | relevance = 1 and Status = done | `AND({relevance} = 1, {Status} = "done")` | Domain, Company, Description, Tag, public_emails_clean, Email, MV P0, BB, Final Email, Status, Build Date | Build Date desc |
| Found : Campaigns | relevance = 1 and Status = done | `AND({relevance} = 1, {Status} = "done")` | Domain, Company, Description, Final Email, Tag, Campaigns, Campaign Status, Messages Sent, Last Contacted, Build Date | Build Date desc |

## People

Primary field: Name. 60 fields.

| Field | Type | Options | Kind |
|---|---|---|---|
| Name | singleLineText |  | plain |
| first_name | singleLineText |  | plain |
| last_name | singleLineText |  | plain |
| Title | singleLineText |  | plain |
| Seniority | singleSelect | C-Suite (purpleLight2), Founder (purpleLight2), Owner (purpleLight2), President (purpleLight2), Executive (purpleLight2), VP (blueLight2), Head (cyanLight2), Director (cyanLight2), Manager (tealLight2), Senior (greenLight2), Partner (yellowLight2), EVP / SVP (blueLight2), Board / Chair (yellowLight2), Unclassified (grayLight2) | plain |
| Department | singleSelect | Executive (purpleLight2), Engineering (blueLight2), Technology (cyanLight2), R&D (tealLight2), Product (blueLight1), Data (cyanLight1), Security (tealLight1), Design (pinkLight2), Operations (orangeLight2), Sales (greenLight2), Marketing (greenLight1), Finance (redLight2), Human Resources (pinkLight1), Customer Success (yellowLight2), Project Management (orangeLight1), Strategy (purpleLight1), Legal (grayLight2), Supply Chain (redLight1), Communications (yellowLight1), Community & Social (pinkBright), Compliance & GRC (grayLight1) | plain |
| Email | singleLineText |  | plain |
| LinkedIn URL | url |  | plain |
| Phone | singleLineText |  | plain |
| Companies | multipleRecordLinks | to Companies | link |
| Contact Key | singleLineText |  | plain |
| Contact Source | singleSelect | ContaGen (blueLight2), Supersoniq (purpleLight2), AI-Ark (tealLight2) | plain |
| Source ID | singleLineText |  | plain |
| Build Date | formula | `CREATED_TIME()` | formula |
| MV P0 | singleSelect | ok (greenBright), catch_all (yellowBright), invalid (redBright), disposable (orangeLight2), unknown (grayBright), error (orangeBright), skipped (grayLight2) | plain |
| P1 (Trykitt) | singleLineText |  | plain |
| MV P1 | singleSelect | ok (greenBright), catch_all (yellowBright), invalid (redBright), disposable (orangeLight2), unknown (grayBright), error (orangeBright), skipped (grayLight2) | plain |
| P2 (LeadMagic) | singleLineText |  | plain |
| MV P2 | singleSelect | ok (greenBright), catch_all (yellowBright), invalid (redBright), disposable (orangeLight2), unknown (grayBright), error (orangeBright), skipped (grayLight2) | plain |
| P3 (Prospeo) | singleLineText |  | plain |
| MV P3 | singleSelect | ok (greenBright), catch_all (yellowBright), invalid (redBright), disposable (orangeLight2), unknown (grayBright), error (orangeBright), skipped (grayLight2) | plain |
| BB | singleSelect | verifying (blueBright), deliverable (greenBright), undeliverable (redBright), risky (yellowBright), unknown (grayBright), error (orangeBright), skipped (grayLight2) | plain |
| Final Email | singleLineText |  | plain |
| Email Source | singleSelect | P0 (blueBright), P1 (cyanBright), P2 (tealBright), P3 (purpleBright), none (grayBright) | plain |
| Status | singleSelect | done (greenBright), verifying (blueBright), no_email_found (redBright), error (orangeBright) | plain |
| manually_approved | checkbox | greenBright check | plain |
| relevance | formula | `IF(OR({manually_approved}, FALSE()), 1, 0)` | formula |
| linkedin_name_match | formula | `IF(AND({LinkedIn URL}, OR({first_name}, {last_name})), IF(OR(AND(LEN(REGEX_REPLACE(LOWER({first_name}), "[^a-z]", "")) > 0, FIND(REGEX_REPLACE(LOWER({first_name}), "[^a-z]", ""), REGEX_REPLACE(REGEX_REPLACE(REGEX_REPLACE(LOWER({LinkedIn URL}), "^.*/in/", ""), "[/?#].*$", ""), "[^a-z]", "")) > 0), AND(LEN(REGEX_REPLACE(LOWER({last_name}), "[^a-z]", "")) > 0, FIND(REGEX_REPLACE(LOWER({last_name}), "[^a-z]", ""), REGEX_REPLACE(REGEX_REPLACE(REGEX_REPLACE(LOWER({LinkedIn URL}), "^.*/in/", ""), "[/?#].*$", ""), "[^a-z]", "")) > 0)), 1, 0), 0)` | formula |
| Domain | multipleLookupValues | Companies.Domain | lookup |
| Company | multipleLookupValues | Companies.Company | lookup |
| Description | multipleLookupValues | Companies.Description | lookup |
| Industry Groups | multipleLookupValues | Companies.Industry Groups | lookup |
| Business Model | multipleLookupValues | Companies.Business Model | lookup |
| Employees | multipleLookupValues | Companies.Employees | lookup |
| Revenue Range | multipleLookupValues | Companies.Revenue Range | lookup |
| Keywords | multipleLookupValues | Companies.Keywords | lookup |
| Country | multipleLookupValues | Companies.Country | lookup |
| State | multipleLookupValues | Companies.State | lookup |
| City | multipleLookupValues | Companies.City | lookup |
| Street | multipleLookupValues | Companies.Street | lookup |
| Zip | multipleLookupValues | Companies.Zip | lookup |
| Phones | multipleLookupValues | Companies.Phones | lookup |
| Public Emails | multipleLookupValues | Companies.Public Emails | lookup |
| Social URLs | multipleLookupValues | Companies.Social URLs | lookup |
| public_emails_clean | multipleLookupValues | Companies.public_emails_clean | lookup |
| MX Provider | multipleLookupValues | Companies.MX Provider | lookup |
| Redirect Domain | multipleLookupValues | Companies.Redirect Domain | lookup |
| Domain Source | multipleLookupValues | Companies.Domain Source | lookup |
| Tag | multipleLookupValues | Companies.Tag | lookup |
| Signals | multipleLookupValues | Companies.Signals | lookup |
| Signal At | multipleLookupValues | Companies.Signal At | lookup |
| ICP Reason | multipleLookupValues | Companies.ICP Reason | lookup |
| Campaigns | multipleRecordLinks | to the client's synced Campaigns mirror | mirrorLink |
| Sequencers | multipleLookupValues | Campaigns.Sequencer, through the link to the client's synced Campaigns mirror. The senders that already hold this row, one per linked campaign. A campaign-feeding view excludes only its own sender with a does-not-contain test, so the same person can legitimately sit in campaigns on two different senders. | mirrorLookup |
| Messages Sent | number | precision 0 | plain |
| Last Contacted | dateTime | iso, 24hour, utc | plain |
| Campaign Status | singleSelect | NEVER_CONTACTED (grayLight2), IN_SEQUENCE (blueBright), COMPLETED (greenBright), REPLIED (purpleBright), BOUNCED (redBright), UNSUBSCRIBED (orangeBright) | plain |
| Bounce Reason | singleLineText |  | plain |
| Synced At | dateTime | iso, 24hour, utc | plain |
| Deploy Error | singleLineText |  | plain |

### Declared extras on People

| Group | Owner | Field | Type | Options |
|---|---|---|---|---|
| Storeleads | Insert Storeleads domains to Clayroots | Plan | multipleLookupValues | Companies.Plan |
| Storeleads | Insert Storeleads domains to Clayroots | Revenue Est Monthly | multipleLookupValues | Companies.Revenue Est Monthly |
| Storeleads | Insert Storeleads domains to Clayroots | Store Age Years | multipleLookupValues | Companies.Store Age Years |
| Storeleads | Insert Storeleads domains to Clayroots | Product Count | multipleLookupValues | Companies.Product Count |
| Storeleads | Insert Storeleads domains to Clayroots | App Spend Mo | multipleLookupValues | Companies.App Spend Mo |
| Storeleads | Insert Storeleads domains to Clayroots | Key Apps | multipleLookupValues | Companies.Key Apps |
| Storeleads | Insert Storeleads domains to Clayroots | Tech Stack | multipleLookupValues | Companies.Tech Stack |
| Storeleads | Insert Storeleads domains to Clayroots | Trustpilot Rating | multipleLookupValues | Companies.Trustpilot Rating |
| Storeleads | Insert Storeleads domains to Clayroots | Trustpilot Reviews | multipleLookupValues | Companies.Trustpilot Reviews |
| Storeleads | Insert Storeleads domains to Clayroots | Migrated From | multipleLookupValues | Companies.Migrated From |
| Storeleads | Insert Storeleads domains to Clayroots | Social Followers | multipleLookupValues | Companies.Social Followers |
| Storeleads | Insert Storeleads domains to Clayroots | Growth 90d | multipleLookupValues | Companies.Growth 90d |
| Storeleads | Insert Storeleads domains to Clayroots | Features | multipleLookupValues | Companies.Features |
| Hiring | Handle Hiring Intent Signal | Job ID | multipleLookupValues | Companies.Job ID |
| Hiring | Handle Hiring Intent Signal | Job Title | multipleLookupValues | Companies.Job Title |
| Hiring | Handle Hiring Intent Signal | Job Link | multipleLookupValues | Companies.Job Link |
| Hiring | Handle Hiring Intent Signal | Job Posted | multipleLookupValues | Companies.Job Posted |
| Hiring | Handle Hiring Intent Signal | Job Description | multipleLookupValues | Companies.Job Description |
| Hiring | Handle Hiring Intent Signal | Job Seniority | multipleLookupValues | Companies.Job Seniority |
| Hiring | Handle Hiring Intent Signal | Job Function | multipleLookupValues | Companies.Job Function |
| Hiring | Handle Hiring Intent Signal | Job Employment Type | multipleLookupValues | Companies.Job Employment Type |
| Hiring | Handle Hiring Intent Signal | Job Industries | multipleLookupValues | Companies.Job Industries |
| Hiring | Handle Hiring Intent Signal | Job Applicants | multipleLookupValues | Companies.Job Applicants |
| Hiring | Handle Hiring Intent Signal | Job Salary | multipleLookupValues | Companies.Job Salary |
| Hiring | Handle Hiring Intent Signal | Job Poster Name | multipleLookupValues | Companies.Job Poster Name |
| Hiring | Handle Hiring Intent Signal | Job Poster Title | multipleLookupValues | Companies.Job Poster Title |
| Hiring | Handle Hiring Intent Signal | Job Poster LinkedIn | multipleLookupValues | Companies.Job Poster LinkedIn |
| Hiring | Handle Hiring Intent Signal | Existing In Role | multipleLookupValues | Companies.Existing In Role |
| Reviews | Handle Service Reviews Intent Signal | Review Count | multipleLookupValues | Companies.Review Count |
| Reviews | Handle Service Reviews Intent Signal | Review Latest | multipleLookupValues | Companies.Review Latest |
| Reviews | Handle Service Reviews Intent Signal | Review Link | multipleLookupValues | Companies.Review Link |
| Reviews | Handle Service Reviews Intent Signal | Review Titles | multipleLookupValues | Companies.Review Titles |
| Reviews | Handle Service Reviews Intent Signal | Review Quotes | multipleLookupValues | Companies.Review Quotes |
| Reviews | Handle Service Reviews Intent Signal | Review Replied | multipleLookupValues | Companies.Review Replied |
| Reviews | Handle Service Reviews Intent Signal | Trustpilot Rating | multipleLookupValues | Companies.Trustpilot Rating |
| Reviews | Handle Service Reviews Intent Signal | Trustpilot Reviews Total | multipleLookupValues | Companies.Trustpilot Reviews Total |
| Reviews | Handle Service Reviews Intent Signal | Trustpilot URL | multipleLookupValues | Companies.Trustpilot URL |

### Views on People

| View | Filter | Formula | Fields | Sort |
|---|---|---|---|---|
| Relevant | relevance = 1 | `{relevance} = 1` | Name, Title, Seniority, Department, Company, Description, Employees, Email, LinkedIn URL, Contact Source, Tag, Build Date | Build Date desc |
| Cut Review | relevance = 0 | `{relevance} = 0` | Name, Title, Seniority, Department, Company, Description, Employees, Tag, manually_approved, Build Date | Build Date desc |
| Not Waterfalled | relevance = 1 and Status is empty | `AND({relevance} = 1, NOT({Status}))` | Name, Title, Company, Tag, Email, MV P0, P1 (Trykitt), MV P1, P2 (LeadMagic), MV P2, P3 (Prospeo), MV P3, BB, Final Email, Email Source, Status, Build Date | Build Date desc |
| Not Found | relevance = 1 and Status is no_email_found or error | `AND({relevance} = 1, OR({Status} = "no_email_found", {Status} = "error"))` | Name, Title, Company, Tag, Email, MV P0, P1 (Trykitt), MV P1, P2 (LeadMagic), MV P2, P3 (Prospeo), MV P3, BB, Final Email, Email Source, Status, Build Date | Build Date desc |
| Found | relevance = 1 and Status = done | `AND({relevance} = 1, {Status} = "done")` | Name, Title, Company, Tag, Email, MV P0, P1 (Trykitt), MV P1, P2 (LeadMagic), MV P2, P3 (Prospeo), MV P3, BB, Final Email, Email Source, Status, Build Date | Build Date desc |
| Found : Campaigns | relevance = 1 and Status = done | `AND({relevance} = 1, {Status} = "done")` | first_name, last_name, Title, Company, Description, Domain, Final Email, LinkedIn URL, Tag, Campaigns, Campaign Status, Messages Sent, Last Contacted, Build Date | Build Date desc |
| Found : Never Contacted | relevance = 1 and Status = done and Messages Sent = 0 | `AND({relevance} = 1, {Status} = "done", {Messages Sent} = 0)` | first_name, last_name, Title, Company, Description, Domain, Final Email, LinkedIn URL, Tag, Campaigns, Campaign Status, Messages Sent, Last Contacted, Build Date | Build Date desc |

## DNC

Primary field: Domain. 4 fields.

| Field | Type | Options | Kind |
|---|---|---|---|
| Domain | singleLineText |  | plain |
| Reason | singleSelect | Customer (greenLight2), Not interested (redLight2), Client request (orangeLight2), Active deal (blueLight2) | plain |
| Notes | multilineText |  | plain |
| Added | date | iso | plain |

### Views on DNC

| View | Filter | Formula | Fields | Sort |
|---|---|---|---|---|
| Not Interested | Reason = Not interested | `{Reason} = "Not interested"` | Domain, Reason, Notes, Added | Added desc |
| From Client | Reason is not Not interested | `{Reason} != "Not interested"` | Domain, Reason, Notes, Added | Added desc |

## On People

Every Companies field that describes the company is on People as a lookup with the identical name (the `company` flag on the Companies definition; the People lookups are generated from it, never typed).
Every extras field of a picked group follows the same rule: the group brings its lookups to People when it is picked.

On People (24 core fields, 24 lookups on People): Domain, Company, Description, Industry Groups, Business Model, Employees, Revenue Range, Keywords, Country, State, City, Street, Zip, Phones, Public Emails, Social URLs, public_emails_clean, MX Provider, Redirect Domain, Domain Source, Tag, Signals, Signal At, ICP Reason.

Extras groups on People when picked: Storeleads, Hiring, Reviews.

Not on People (19): Build Date, Contacts Pulled At, Contacts Count, Contact Sources, Email, MV P0, BB, Final Email, Status, Campaigns, Sequencers, Messages Sent, Last Contacted, Campaign Status, Bounce Reason, Synced At, Deploy Error, manually_approved, relevance.

## Palettes

A select carries a color only when the value is a verdict, a scale, or a source; a plain category is gray.

- **verdict**: ok, done, deliverable, COMPLETED greenBright; catch_all, risky yellowBright; invalid, undeliverable, no_email_found, BOUNCED redBright; error, UNSUBSCRIBED orangeBright; verifying, IN_SEQUENCE blueBright; REPLIED purpleBright; disposable orangeLight2; unknown grayBright; skipped, NEVER_CONTACTED grayLight2
- **source**: ContaGen blueLight2; Supersoniq purpleLight2; AI-Ark tealLight2
- **scale**: 1-10 blueLight2; 11-50 cyanLight2; 51-200 tealLight2; 201-500 greenLight2; 501-1000 yellowLight2; 1001-5000 orangeLight2; 5001-10000 redLight2; 10001+ purpleLight2
- **rank**: C-Suite, Founder, Owner, President, Executive purpleLight2; VP, EVP / SVP blueLight2; Head, Director cyanLight2; Manager tealLight2; Senior greenLight2; Partner, Board / Chair yellowLight2; Unclassified grayLight2
- **tier**: P0 blueBright; P1 cyanBright; P2 tealBright; P3 purpleBright; none grayBright
- **department**: Executive purpleLight2; Strategy purpleLight1; Engineering blueLight2; Product blueLight1; Technology cyanLight2; Data cyanLight1; R&D tealLight2; Security tealLight1; Sales greenLight2; Marketing greenLight1; Customer Success yellowLight2; Communications yellowLight1; Operations orangeLight2; Project Management orangeLight1; Finance redLight2; Supply Chain redLight1; Design pinkLight2; Human Resources pinkLight1; Community & Social pinkBright; Legal grayLight2; Compliance & GRC grayLight1
- **dncReason**: Customer greenLight2; Not interested redLight2; Client request orangeLight2; Active deal blueLight2
