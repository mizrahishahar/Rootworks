---
type: infrastructure
owner: Operator
---

# n8n

The backend. Every pipe runs here: the list-building builders and waterfalls, the reply intakes, the syncs, the deploys, the reports.

**You consume machines here. You never build or edit one.** Fixes ship from HQ as a push; from this project a defect becomes a GitHub issue. That line is not a preference, it is what keeps a mining session from breaking production.

## Knowing what exists

- **`n8n/INDEX.md`** is the catalogue: every live machine, what it does, when to use it.
- **`n8n/<machine>/`** is its actual source, compiled from the live instance: the graph in `workflow.json`, each code node as a real `.js` file. Read it when you need to know exactly what a machine will do to a table before you fire it.
- Archived machines are not in the repo. If a name is missing from INDEX, it is retired.

## Running one

Launch and verification belong to [[run-automation]]. In short: most machines are started by a launch row created from their form, some by webhook; the run row carries the parameters and then the outcome.

**A form's fields change.** Read the machine's live trigger fields before filling one, never a remembered field list.

## The contract every machine meets

- **One run record, and the record is the lifecycle:** Running, then Succeeded or Failed, with counts in and out, duration, and a per-run description.
- **Failure still writes a row.** A shared error handler stamps Failed and pings Slack, so no run vanishes silently.
- **The client is resolved from the registry at runtime**, never hardcoded. One machine serves every client.

## Reading a run

The run record is the report; the canvas is not. And the run record is still only a claim: **verify by cell values on the target table.** A run log has undercounted a good run by half, and has read Succeeded on a run that wrote nothing usable.
