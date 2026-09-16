Teaches: previewing a launch from the machine's card and the launch fields, creating the row on approval, reruns, and what done means.

# Launching

## Where to read before launching

How a machine starts is not this skill's knowledge. The machine schema you are handed says how each type starts; the machine's card says what it is for and what it needs; the launch fields' own descriptions on the Automations table say what a row carries for it. Read those three, in that order, before every launch. When a payload goes beyond the row, the trigger node and the nodes right after it are the source.

## The launch row

A launch row names the machine, the client, and the machine's own parameters, whatever its card and the field descriptions call for, nothing more. Creating the row is the launch: a watching automation fires the door on its own. Never fire a door by hand for a row the watcher will also fire; a run launched twice spends twice.

**Check the watcher covers the machine.** *16 Sep 2026, Verify Catch-alls:* a launch row sat blank for an hour because the Hub's "Launch on-demand automation" trigger lists only some Automation choices, and Verify Catch-alls was not one. Before relying on a new row, read that automation's trigger (`list_automations` on the Hub). When the machine is missing, the watcher will never fire the row, so POST `{recordId}` to `https://n8n.flowroots.com/webhook/<automation name as a lowercase hyphen slug>` yourself (the same call its script makes), then confirm the row turns Running.

**Status mechanics.** A row created with Status = Waiting is a held launch; clearing the Status fires it. The hold exists for machines that take a file: the API cannot write attachments, so the row is created complete except for the file, the Operator attaches it and clears the Status.

## The preview, before anything fires

Every launch is shown as a real table (never inside a code fence), one row per launch, the launch row's own fields as the columns, in the order they sit on the row, and a Cost column when a paid provider is in the path. Under it, one sentence: what the run will do. Approval, then the row. One launch, one preview; several launches, several rows in the same table.

| Automation | Client | View | Tag | Prompt | Output Field | Output Type | Max companies | Cost |
|---|---|---|---|---|---|---|---|---|
| the research machine | Acme | Not Sourced | acme-q3 | Does this company sell mainly to other businesses, mainly to consumers, or both? Answer B2B, B2C, both or unknown | Business Model | Single select | 500 | 500 companies on the account's model key |

Asks one question of every company in the view and writes the answer into a new column.

## Reruns

A past run's row carries its complete parameters, so any run is repeatable: read the row, copy its values into a new launch, verbatim for a pure rerun or with the named value changed. The preview shows the delta.

## After the fire

The run row is the report: Running, then Succeeded, Succeeded with errors, or Failed, with counts in and out, the duration, the Description. Watch it there. The row is still only a claim: done means **verified by cell values on the target table**, before and after counts, and what changed on a sample row.
