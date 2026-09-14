# Lists

A list is one segment of people, on one client base, worth one campaign.

It is built on the base: companies land, people are found for them, emails are found and verified, relevance is decided, a view names the segment. Every step is a Rootflow launched from a row; the Operator decides between them.

## The chain

- companies land in Companies, from a source, with the core filled
- people are found for every company in a view, once; Contacts Pulled At marks it
- emails are found and verified for every relevant person, once; Status marks it
- a segment is a view on People: relevance = 1, Status = done, and the segmentation

Companies come from DiscoLike, or from a signal source that DiscoLike then fills. People come from the contact providers. A domain on the client's DNC never lands.

## Companies

- one row per domain
- a pull overwrites what it already holds; DiscoLike is fresher than us
- the source of a row is written once, on create

## People

- one row per person, keyed on Contact Key (first, last, domain), then the LinkedIn slug
- every provider is asked for every company
- a person found twice is one row: the first provider's facts hold, blanks fill, emails append
- a LinkedIn URL is written only when its slug carries the person's first or last name

**How many, by the Employees value on our row**

| Employees | Per provider | Floor |
|---|---|---|
| up to 50, or unknown | 20 | everyone non-junior, senior ICs included |
| 51 to 500 | 30 | everyone non-junior |
| 501 and up | 50 | manager and up |

- 50 is the ceiling because GetLeads stops there
- Supersoniq is the exception: at most 10 per company, Director and up, and asked only for a company holding fewer than 5 relevant people
- a provider with no credential, no credits or no answer is skipped; the run goes on; the run stops only when every provider failed

## Emails

- every candidate is verified by us before it is deployed, whatever the vendor's own flag says
- the order: candidates the row already holds, then the provider that resolves a LinkedIn URL, then one guess from the shape the base already proves at that domain, then the six common shapes, then the paid finder last
- catch-all is a fact about the domain, decided once per run; every person on it goes to the catch-all verifier with up to three candidates, and the first deliverable wins
- risky and unknown are not deployable
- a person with no deliverable email is done, not retried, until a new candidate appears

## Relevance

- one formula per client, rewritten at onboarding; the template's placeholder passes nobody
- it reads the row's own fields, never a stamp, so every future row is judged the same way
- `manually_approved` is the one exception and it only ever widens: a checked row is relevant whatever the formula says
- Relevant and Cut Review are exact complements; the cut is read and rescued from, never archived

## The pull

- overshoot, then cut in the base; widening a landed pull is the expensive move
- a pull is counted before it is paid for, and every paid pull is quoted and approved first
- the variables a segment or its copy will need are named before the pull, and arrive with the rows
- one list has one centre: if the sentence describing it goes generic to cover everyone, it is two lists

## Segments

- a segment is a view on People, named for who is in it, never for a campaign
- its fixed clauses are relevance = 1 and Status = done; everything else is segmentation
- a research column (a question asked of every company) is a segment clause like any other, once it holds a value

## Research columns

- one prompt, one column, on Companies; People see it through a lookup
- a constrained answer (yes, no, a category, a number) is asked with its evidence and its confidence beside it; unknown is written blank and asked again next run
- a generative answer (a line to write) is asked without evidence
- the spend cap is on the row and the run refuses a view larger than it

```json
{
  "people": {
    "cap_by_employees": { "1-50": 20, "51-500": 30, "501+": 50 },
    "floor_by_employees": { "1-50": "non-junior with senior ICs", "51-500": "non-junior", "501+": "manager and up" },
    "provider_order": ["Blitz", "GetLeads", "QuickEnrich", "Supersoniq"],
    "supersoniq": { "cap": 10, "floor": "Director", "ask_below_relevant": 5 }
  },
  "emails": {
    "order": ["held candidates", "Blitz by LinkedIn URL", "the proven domain shape", "six common shapes", "LeadMagic"],
    "shapes": ["first.last", "first", "flast", "firstlast", "first_last", "f.last"],
    "catch_all_candidates": 3,
    "deployable": ["deliverable"]
  },
  "segment": { "fixed_clauses": ["relevance = 1", "Status = done"] }
}
```
