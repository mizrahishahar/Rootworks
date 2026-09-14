# Lists

A list is one segment of people, on one client's ClayRoots base, worth one campaign.

## The flow

1. companies land in Companies, from a source, with the core filled
2. people are found for every company in a view.
3. emails are found and verified for every relevant person.
4. relevance is decided by the client's formula
5. a segment is a view on People, fed to one campaign

Each step is run by a Rootflow, a machine that adds to the ClayRoots base, launched from a row. The Operator decides between steps. A domain on the client's DNC never lands.

## Companies

- one row per domain
- a new pull overwrites what a row already holds; the source is written once, on create

## People

- one row per person, keyed on Contact Key (first, last, domain)
- every source is asked for every company; a person found twice is one row, the first source's facts hold, blanks fill, emails append

**How many people per company, by the Employees value on our row**

| Employees | Per source | Floor |
|---|---|---|
| up to 50, or unknown | 20 | everyone non-junior, senior ICs included |
| 51 to 500 | 30 | everyone non-junior |
| 501 and up | 50 | manager and up |

## Emails

- a person is deployable when the row carries an email we verified ourselves, whatever a source's own flag says
- Status = done means that; nothing else does

## Relevance

- one formula per client, written at onboarding; the template's placeholder passes nobody
- it reads the row's own fields, so every future row is judged the same way
- **overshoot, then cut:** the pull takes everyone the query could plausibly return; relevance cuts in the base. A borderline row is relevant. Widening a landed pull is the expensive move; narrowing is free
- `manually_approved` only ever widens: a checked row is relevant whatever the formula says
- Relevant and Cut Review are exact complements; the cut is read and rescued from, never archived

## The pull

- counted before it is paid for; every paid pull is quoted and approved first
- the variables a segment or its copy will need are named before the pull and arrive with the rows
- one list has one centre: a describing sentence that goes generic to cover everyone means two lists

## Segments

- a view on People, named for who is in it, never for a campaign
- fixed clauses: relevance = 1 and Status = done; everything else is segmentation

```json
{
  "people_per_company": { "1-50": 20, "51-500": 30, "501+": 50 },
  "floor": { "1-50": "non-junior with senior ICs", "51-500": "non-junior", "501+": "manager and up" },
  "segment_fixed_clauses": ["relevance = 1", "Status = done"]
}
```
