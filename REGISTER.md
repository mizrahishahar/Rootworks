# Field register

Compiled from `n8n/Onboard-Client/nodes/Scaffold-Register.js` by `scripts/register.js`. Do not hand-edit.
This file is what every client base's tables ARE; why they exist lives in Flowroots/Operations/Field Standard.md and List Building 2.0.md.
Core fields are born at the scaffold. Declared extras are created only by their owner machine. Anything else on a base is the Operator's.

## Companies

Primary field: Domain. 48 fields.

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
| Domain Source | singleSelect | DiscoLike (blueLight2), Storeleads (greenLight2), Signal (orangeLight2), CSV (grayLight2) | plain |
| Tag | singleLineText |  | plain |
| Build Date | formula | `CREATED_TIME()` | formula |
| Contacts Pulled At | dateTime | iso, 24hour, utc | plain |
| Contacts | count | of People | count |
| Contact Sources | rollup | People.Contact Source, `ARRAYUNIQUE(values)` | rollup |
| Signals | multipleRecordLinks | to the client's synced Signals mirror | mirrorLink |
| Signal At | dateTime | iso, 24hour, utc | plain |
| ICP Reason | multilineText |  | plain |
| Email | singleLineText |  | plain |
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
| Campaigns | multipleRecordLinks | to the client's synced Campaigns mirror | mirrorLink |
| Messages Sent | number | precision 0 | plain |
| Last Contacted | dateTime | iso, 24hour, utc | plain |
| Campaign Status | singleSelect | NEVER_CONTACTED (grayLight2), IN_SEQUENCE (blueBright), COMPLETED (greenBright), REPLIED (purpleBright), BOUNCED (redBright), UNSUBSCRIBED (orangeBright) | plain |
| Bounce Reason | singleLineText |  | plain |
| Synced At | dateTime | iso, 24hour, utc | plain |
| Deploy Error | singleLineText |  | plain |
| manually_approved | checkbox | greenBright check | plain |

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

## People

Primary field: Name. 47 fields.

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
| Domain | singleLineText |  | plain |
| Company | singleLineText |  | plain |
| Companies | multipleRecordLinks | to Companies | link |
| Contact Key | singleLineText |  | plain |
| Contact Source | singleSelect | ContaGen (blueLight2), Supersoniq (purpleLight2), AI-Ark (tealLight2) | plain |
| Source ID | singleLineText |  | plain |
| Tag | singleLineText |  | plain |
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
| relevance | formula | `IF({manually_approved}, 1, 0)` | formula |
| linkedin_name_match | formula | `IF(AND({LinkedIn URL}, OR({first_name}, {last_name})), IF(OR(AND(LEN(REGEX_REPLACE(LOWER({first_name}), "[^a-z]", "")) > 0, FIND(REGEX_REPLACE(LOWER({first_name}), "[^a-z]", ""), REGEX_REPLACE(REGEX_REPLACE(REGEX_REPLACE(LOWER({LinkedIn URL}), "^.*/in/", ""), "[/?#].*$", ""), "[^a-z]", "")) > 0), AND(LEN(REGEX_REPLACE(LOWER({last_name}), "[^a-z]", "")) > 0, FIND(REGEX_REPLACE(LOWER({last_name}), "[^a-z]", ""), REGEX_REPLACE(REGEX_REPLACE(REGEX_REPLACE(LOWER({LinkedIn URL}), "^.*/in/", ""), "[/?#].*$", ""), "[^a-z]", "")) > 0)), 1, 0), 0)` | formula |
| Employees | multipleLookupValues | Companies.Employees | lookup |
| Industry Groups | multipleLookupValues | Companies.Industry Groups | lookup |
| MX Provider | multipleLookupValues | Companies.MX Provider | lookup |
| Country | multipleLookupValues | Companies.Country | lookup |
| State | multipleLookupValues | Companies.State | lookup |
| City | multipleLookupValues | Companies.City | lookup |
| Company Tag | multipleLookupValues | Companies.Tag | lookup |
| Signals | multipleLookupValues | Companies.Signals | lookup |
| Signal At | multipleLookupValues | Companies.Signal At | lookup |
| Campaigns | multipleRecordLinks | to the client's synced Campaigns mirror | mirrorLink |
| Messages Sent | number | precision 0 | plain |
| Last Contacted | dateTime | iso, 24hour, utc | plain |
| Campaign Status | singleSelect | NEVER_CONTACTED (grayLight2), IN_SEQUENCE (blueBright), COMPLETED (greenBright), REPLIED (purpleBright), BOUNCED (redBright), UNSUBSCRIBED (orangeBright) | plain |
| Bounce Reason | singleLineText |  | plain |
| Synced At | dateTime | iso, 24hour, utc | plain |
| Deploy Error | singleLineText |  | plain |

## DNC

Primary field: Domain. 5 fields.

| Field | Type | Options | Kind |
|---|---|---|---|
| Domain | singleLineText |  | plain |
| Reason | singleSelect | Customer (greenLight2), Customer (suspect domain) (greenLight1), Active deal (blueLight2), Partner (purpleLight2), Client request (orangeLight2), Not interested reply (redLight2), Staffing / agency (yellowLight2) | plain |
| Notes | multilineText |  | plain |
| Added | date | iso | plain |
| In PlusVibe Blocklist | checkbox | greenBright check | plain |

## Palettes

A select carries a color only when the value is a verdict, a scale, or a source; a plain category is gray.

- **verdict**: ok, done, deliverable, COMPLETED greenBright; catch_all, risky yellowBright; invalid, undeliverable, no_email_found, BOUNCED redBright; error, UNSUBSCRIBED orangeBright; verifying, IN_SEQUENCE blueBright; REPLIED purpleBright; disposable orangeLight2; unknown grayBright; skipped, NEVER_CONTACTED grayLight2
- **source**: DiscoLike, ContaGen blueLight2; Storeleads greenLight2; Supersoniq purpleLight2; AI-Ark tealLight2; Signal orangeLight2; CSV grayLight2
- **scale**: 1-10 blueLight2; 11-50 cyanLight2; 51-200 tealLight2; 201-500 greenLight2; 501-1000 yellowLight2; 1001-5000 orangeLight2; 5001-10000 redLight2; 10001+ purpleLight2
- **rank**: C-Suite, Founder, Owner, President, Executive purpleLight2; VP, EVP / SVP blueLight2; Head, Director cyanLight2; Manager tealLight2; Senior greenLight2; Partner, Board / Chair yellowLight2; Unclassified grayLight2
- **tier**: P0 blueBright; P1 cyanBright; P2 tealBright; P3 purpleBright; none grayBright
- **department**: Executive purpleLight2; Strategy purpleLight1; Engineering blueLight2; Product blueLight1; Technology cyanLight2; Data cyanLight1; R&D tealLight2; Security tealLight1; Sales greenLight2; Marketing greenLight1; Customer Success yellowLight2; Communications yellowLight1; Operations orangeLight2; Project Management orangeLight1; Finance redLight2; Supply Chain redLight1; Design pinkLight2; Human Resources pinkLight1; Community & Social pinkBright; Legal grayLight2; Compliance & GRC grayLight1
- **dncReason**: Customer greenLight2; Customer (suspect domain) greenLight1; Active deal blueLight2; Partner purpleLight2; Client request orangeLight2; Not interested reply redLight2; Staffing / agency yellowLight2
