Teaches: previewing a launch from the machine's card and the launch fields, creating the row on approval, reruns, and what done means.

# Launching

## Where to read before launching

How a machine starts is not this skill's knowledge. The machine schema you are handed says how each type starts; the machine's card says what it is for and what it needs; the launch fields' own descriptions on the Automations table say what a row carries for it. Read those three, in that order, before every launch. When a payload goes beyond the row, the trigger node and the nodes right after it are the source.

## The launch row

A launch row names the machine, the client, and the machine's own parameters, whatever its card and the field descriptions call for, nothing more. Creating the row is the launch: a watching automation fires the door on its own. Never fire a door by hand for a row the watcher will also fire; a run launched twice spends twice.

**Status mechanics.** A row created with Status = Waiting is a held launch; clearing the Status fires it. The hold exists for machines that take a file: the API cannot write attachments, so the row is created complete except for the file, the Operator attaches it and clears the Status.

## The preview, before anything fires

Every launch is shown as a real table (never inside a code fence): the machine, what it will do in one sentence, the target, every parameter with its value, and a cost line when a paid provider is in the path. Approval, then the row. One launch, one preview.

| Machine | Will do | Target | Parameter | Value |
|---|---|---|---|---|
| the research machine | asks one question of every company in the view and writes the answer into a new column | Companies · Not Sourced | Client | Acme |
| | | | View | Not Sourced |
| | | | Prompt | Does this company sell mainly to other businesses, mainly to consumers, or both? Answer B2B, B2C, both or unknown |
| | | | Output Field | Business Model |
| | | | Output Type | Single select |
| | | | Max companies | 500 |
| | | | Cost | 500 companies on the account's model key |

## Reruns

A past run's row carries its complete parameters, so any run is repeatable: read the row, copy its values into a new launch, verbatim for a pure rerun or with the named value changed. The preview shows the delta.

## After the fire

The run row is the report: Running, then Succeeded, Succeeded with errors, or Failed, with counts in and out, the duration, the Description. Watch it there. The row is still only a claim: done means **verified by cell values on the target table**, before and after counts, and what changed on a sample row.
