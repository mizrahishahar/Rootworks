# GitHub Filers

The front half of the **filed on a vendor repo** intent signal: somebody at a company opened an issue or a pull request on a tool we know their buyer runs. The actor turns that into a company. The n8n door turns the company into a prospect.

Second custom actor in the estate, after `Fresh-Service-Complaints`, and built to the same shape: source here, deployed with `apify push`, its scheduled task's webhook posts to an intent door, and the actor never calls n8n itself.

## The two laws it is built on

**The actor spends nothing.** GitHub's REST API is free and read-only. Every paid call, DiscoLike BizData, the ICP verdict, and the company-name to domain match, stays in n8n where the Hub row counts it. That is why a row can go out with `domain: null` and only a `company_name`: resolving that name costs money, so it is not our job.

**We never take a contact from GitHub.** GitHub's acceptable use policy forbids using information from the service, email addresses named explicitly, to send unsolicited mail. So this actor reads no public email, mines no commit author address, and emits a **company plus public evidence**. The people come from our own providers through Enrich Contacts. The signal is intelligence about a company, not a mailing list.

## What it does

1. **Feed.** For each watched repo, `GET /repos/{owner}/{repo}/issues?state=all&sort=created&direction=desc`. The endpoint returns pull requests alongside issues (a `pull_request` key marks them), so the `events` filter is ours, not theirs. Results are newest first, so the run stops the moment it reaches that repo's cursor. Bots and non-user accounts are dropped.
2. **Identity.** Per unique filer, `GET /users/{login}`. When the profile names no employer, `GET /users/{login}/orgs`. When there is an org handle, `GET /orgs/{handle}`, whose `blog` is usually the company's own site, which is a domain for free.
3. **Exclusion.** Drop the vendor's own staff. Every watched repo's owner is excluded automatically; `excludeOrgs` covers a vendor that maintains a repo it does not own, which is exactly the AWS case on `terraform-provider-aws`.
4. **Output.** One row per company, newest filing as the headline, the rest riding along as context.

`lib.js` holds every decision about what a row means and touches no network, so it can be run against fixtures. `main.js` owns the fetching, the cursor and the rate limiting.

## Output shape

```json
{
  "source": "github_filed",
  "domain": "edfenergy.com",
  "company_name": "EDF Energy ltd",
  "detected_at": "2026-09-10T09:29:52Z",
  "evidence_url": "https://github.com/hashicorp/terraform-provider-aws/issues/49940",
  "payload": {
    "repo": "hashicorp/terraform-provider-aws",
    "issue_title": "...", "issue_body": "...", "issue_labels": "...",
    "issue_state": "open", "is_pr": false, "filed_at": "...",
    "filer_login": "...", "filer_name": "...", "filer_location": "...",
    "employer_raw": "@edfenergy", "employer_org": "edfenergy",
    "resolve_method": "profile company handle + org site",
    "filings_in_window": 3, "other_filers": [], "other_issues": []
  }
}
```

`domain` is null whenever GitHub did not hand one over free. The door matches `company_name` to a domain through DiscoLike and refuses the row if it cannot.

The issue body is the point. It is the company describing its own problem in its own words, which is the same thing the Trustpilot review quote is for Adelante: copy nobody else can write.

## State

Two keys in the actor's own store, so nothing about a run lives in Airtable:

- `STATE.repos[repo]` the newest filing already seen, so a daily run reads only what is new.
- `STATE.users[login]` the resolved employer, cached `userCacheDays` (30 by default), so a daily run spends almost no requests on people it already knows.
- `SUMMARY` the last run's funnel.

## Input

The watchlist lives here, in the task input, the way the Trustpilot actor's categories do. `INPUT_SCHEMA.json` gives it a proper editor. The Signals row in the Hub says who we sell to; the task says where we watch.

Picking repos is the whole yield lever, and it is a human judgment: choose tools only a company running the thing in production would file on. A vendor's Terraform provider, an SDK, an enterprise operator. Not a language, not a framework, not a mega-repo full of hobbyists.

## Measured, 2026-09-10, before any of this was built

Three repos (`terraform-provider-aws`, `argo-cd`, `cert-manager`), 10 days, 239 issues and PRs, 108 unique filers, 50 sampled by hand against the live API:

| | |
|---|---|
| `company` field set on the profile | 42% |
| Any employer signal at all | 48% |
| Public corporate email | 0%, nobody publishes it any more, so that path was never built |
| Of those resolved, the vendor's own staff | a third, all `@hashicorp` and `@aws` |
| **Net companies out of 50 filers** | **13, so 26%** |

Two defects the real data exposed, both fixed before the first deploy: `Amazon Web Services (AWS)` does not normalize to `aws`, so vendor matching also runs token by token; and a personal blog with no employer named produced three junk rows out of eighteen, so a profile site is now only ever a domain hint for an employer we already named, never an employer on its own.

**The warning that comes with those numbers:** the companies that file on enterprise infra repos skew large. SoFi, EDF Energy, RWE, ASX, Twilio, Outsystems. Against an ICP capped at 200 employees most of that dies at the door's hard line. Repo choice is where that gets fixed, not code.

## Deploy

```
cd Rootworks/actors/apify/GitHub-Filers/src
apify push
```

Needs `apify login` once (the Operator's API token, console then Settings then API & Integrations). The deployed copy runs on the Flowroots Apify account; this folder is the source of truth, committed like every n8n workflow.

## The scheduled task

- Actor: this one. Input: the watchlist plus the defaults.
- Schedule: daily, early, before the working day.
- Webhook (run succeeded): the intent door, payload template `{ "signal": "<Hub Signals row id>", "resource": {{resource}} }`.
- Task max charge: set one, the way Fresh Service Complaints caps at $2. This actor rents no child actor and calls no paid API, so its only cost is compute.

## Token

A read-only PAT on a **dedicated machine account**, never the account that owns this repo. GitHub permits one machine account per person for automation. Read-only public data, inside the rate limit, is exactly what the API is published for; the account that must never be exposed is the one holding Rootworks.

Without a token the run is capped at 60 requests an hour, which is enough to test and not enough to run.

## Not built yet

The n8n door. A workflow needs the Operator's approval in chat and a card naming it before it can exist.
