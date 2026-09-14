Teaches: how each type of machine starts, the launch row and the preview shown before anything fires, reruns, and what done means.

# Launching

## How a machine starts, by type

| Type | Starts from |
|---|---|
| Rootflow, Deploy | a launch row on the Automations table; the row is the launch |
| Handler | an event from outside (a reply, a booking); never launched by hand except through its manual door |
| Manager | its schedule; on demand through its door with `{recordId}` of a launch row |
| Helper | never directly; it is called |
| Add-on | its hook |

The card's type tells you which. The machine's description and the launch fields' own descriptions on the Automations table say what a launch row carries for it; fill only those. When a payload goes beyond the row, the trigger node and the nodes right after it are the source.

## The launch row

A launch row names the machine (the Automation field), the Client, and the machine's own parameters (a View, a Tag, a Prompt, whatever its card and the field descriptions call for). Creating the row is the launch: a watching automation fires the door on its own. Never fire the door by hand for a row the watcher will also fire; a run launched twice spends twice.

**Status mechanics.** A row created with Status = Waiting is a held launch; clearing the Status fires it. The hold exists for machines that take a file: the API cannot write attachments, so the row is created complete except for the file, the Operator attaches it and clears the Status.

## The preview, before anything fires

Every launch is shown as a real table (never inside a code fence): the machine, the target, every parameter with its value, and a cost line when a paid provider is in the path. Approval, then the row.

| Machine | Target | Parameter | Value |
|---|---|---|---|
| ... | table · view | Client | ... |
| | | View | ... |
| | | Tag | ... |

## Reruns

A past run's row carries its complete parameters, so any run is repeatable: read the row, copy its values into a new launch, verbatim for a pure rerun or with the named value changed. The preview shows the delta.

## After the fire

The run row is the report: Running, then Succeeded, Succeeded with errors, or Failed, with counts in and out, the duration, the Description. Watch it there. The row is still only a claim: done means **verified by cell values on the target table**, before and after counts, and what changed on a sample row.
