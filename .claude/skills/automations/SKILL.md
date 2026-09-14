---
name: automations
type: skill
vertical: [infrastructure]
description: Launching the machines and reading their runs. Previewing a launch from the machine's card, creating the launch row on approval, reruns, reading a run row honestly, debugging down the ladder, filing defects. Use for anything that starts, reruns or inspects an automation.
---

# Automations

The heavy work runs on machines that exist as code in this repo. This skill launches them and reads what they did. It never edits one.

## Where the truth is

- **The machine schema** says what a machine is and how each kind starts. Handed to you; this skill knows nothing of it on its own.
- **The index** is the compiled list: every machine, its door, what it does. A name missing from it is retired.
- **The card** beside a machine's workflows says what it is for and what it needs.
- **The source** in the machine's folder is what a run will actually do: the graph and every code node as a real file. Read it before firing; never remember it.

Facts about a machine come from its card and its code, always.

## The laws

- **Consume, never edit.** A session here never modifies a workflow, publishes, or fixes inline. A defect becomes a GitHub issue; the fix arrives as a push.
- **Preview, approve, fire.** Every launch is shown as a table before anything starts. One launch, one preview.
- **Verify by cell values, never by a run log.** A log has undercounted a good run by half. The target table is the proof.
- **Never spend without approval.** A run that calls a paid provider is quoted first, and never called small.

## This folder

`launching.md` is how a machine starts and the preview. `debugging.md` is reading runs and chasing what went wrong.
