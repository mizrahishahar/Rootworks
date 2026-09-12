# CLAYROOTS-SCHEMA

The base every ClayRoots instance starts from. The template base **CLAYROOTS SCHEMA** (`appMhfP6GeR5WeSiC`) is this page made real; a client base is a duplicate of it. This changes rarely.

A field is here when a standard view filters or sorts on it, or a link needs it. Everything else is brought by the Rootflow that writes it, created on first use. A column nobody declared is the Operator's.

Onboarding: duplicate the template, one Clients row on the Hub, one Slack channel.

## Tables

| Table | Primary | One row per |
|---|---|---|
| Companies | Domain | domain |
| People | Name | person, linked to its company |
| DNC | Domain | suppressed domain |
| Client Campaigns | synced from Hub Campaigns | campaign |
| Client Signals | synced from Hub Signals | signal definition |

## Companies

### Fields

| Field | Type |
|---|---|
| Domain | text, primary |
| Company | text |
| Employees | single select: 1-10, 11-50, 51-200, 201-500, 501-1000, 1001-5000, 5001-10000, 10001+ |
| Tag | text |
| Build Date | formula `CREATED_TIME()` |
| Contacts Pulled At | dateTime |
| Contacts Count | count of People |
| Status | single select: done, verifying, no_email_found, error |
| Final Email | text |
| manually_approved | checkbox |
| relevance | formula, placeholder `IF({manually_approved}, 1, 0)`; every client rewrites it at onboarding |
| Campaigns | link to Client Campaigns |
| Sequencers | lookup Campaigns.Sequencer |
| Campaign Status | single select: NEVER_CONTACTED, IN_SEQUENCE, COMPLETED, REPLIED, BOUNCED, UNSUBSCRIBED |
| Messages Sent | number |
| Last Contacted | dateTime |
| Signals | link to Client Signals |
| Signal At | dateTime |

### Views

| View | Filter | Sort |
|---|---|---|
| Not Sourced | Contacts Pulled At is empty | Build Date desc |
| Not Covered | Contacts Pulled At is set and Contacts Count = 0 | Build Date desc |
| Covered | Contacts Count > 0 | Build Date desc |
| Cut Review | relevance = 0 | Build Date desc |
| Not Waterfalled | relevance = 1 and Status is empty | Build Date desc |
| Not Found | relevance = 1 and Status is no_email_found or error | Build Date desc |
| Found | relevance = 1 and Status = done | Build Date desc |
| Found : Campaigns | relevance = 1 and Status = done | Build Date desc |
| Signals | Signals is not empty | Signal At desc |

## People

### Fields

| Field | Type |
|---|---|
| Name | text, primary |
| first_name | text |
| last_name | text |
| Companies | link to Companies |
| Contact Key | text |
| Build Date | formula `CREATED_TIME()` |
| Status | single select: done, verifying, no_email_found, error |
| Final Email | text |
| manually_approved | checkbox |
| relevance | formula, placeholder `IF({manually_approved}, 1, 0)`; every client rewrites it at onboarding |
| Campaigns | link to Client Campaigns |
| Sequencers | lookup Campaigns.Sequencer |
| Campaign Status | single select: NEVER_CONTACTED, IN_SEQUENCE, COMPLETED, REPLIED, BOUNCED, UNSUBSCRIBED |
| Messages Sent | number |
| Last Contacted | dateTime |
| Domain | lookup Companies.Domain |
| Company | lookup Companies.Company |
| Employees | lookup Companies.Employees |
| Tag | lookup Companies.Tag |
| Signals | lookup Companies.Signals |
| Signal At | lookup Companies.Signal At |

### Views

| View | Filter | Sort |
|---|---|---|
| Relevant | relevance = 1 | Build Date desc |
| Cut Review | relevance = 0 | Build Date desc |
| Not Waterfalled | relevance = 1 and Status is empty | Build Date desc |
| Not Found | relevance = 1 and Status is no_email_found or error | Build Date desc |
| Found | relevance = 1 and Status = done | Build Date desc |
| Found : Campaigns | relevance = 1 and Status = done | Build Date desc |
| Found : Never Contacted | relevance = 1 and Status = done and Messages Sent = 0 | Build Date desc |
| Signals | relevance = 1 and Signals is not empty | Signal At desc |

A feed view for a campaign is made on top of Found by the Operator: relevance = 1, Status = done, Sequencers does not contain this campaign's sender.

## DNC

### Fields

| Field | Type |
|---|---|
| Domain | text, primary |
| Reason | single select: Customer, Not interested, Client request, Active deal |
| Notes | long text |
| Added | date |

### Views

| View | Filter | Sort |
|---|---|---|
| Not Interested | Reason = Not interested | Added desc |
| From Client | Reason is not Not interested | Added desc |

## Client Campaigns, Client Signals

Synced tables from the Hub. Fields as synced; no fields of their own.
