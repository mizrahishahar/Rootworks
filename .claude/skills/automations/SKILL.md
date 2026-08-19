---
name: automations
type: skill
vertical: [infrastructure]
description: Everything about the automations. The n8n backend as readable code, discovering what machines exist and what they need, launching them from the Hub or by webhook, rerunning, reading and debugging runs, filing defects. Use for anything that involves an automation.
---

# Automations

The application's heavy work runs on n8n, and this skill is the only door to it. You never open the n8n editor to work; the machines exist **as code in this repo**, and everything you need to know about any of them is readable here.

## Where the truth is

- **[[INDEX]]** (`n8n/INDEX.md`) is the compiled catalogue: every live machine, what it does, when to use it. A name missing from it is retired.
- **`n8n/<machine>/`** is the machine's actual source, compiled from the live instance: the graph in `workflow.json`, every code node as a real `.js` file. What a machine will do to a table is read there, before firing, never remembered.
- **[[LAUNCHERS]]** (`n8n/LAUNCHERS.md`) is the answer to "what can I launch": every webhook-launchable machine, its fire-ready URL, the fields it needs, and whether it takes an attachment. Compiled from the trigger nodes by `node scripts/launchers.js`; rerun after every pull.

Facts about a machine come from the code, always. A remembered field list, webhook path, or behavior is not a fact.

## The laws

- **Consume, never edit.** A session here never modifies a workflow, publishes, or fixes inline. A defect becomes a GitHub issue on this repo; the fix arrives as a push.
- **The n8n MCP is read-only here.** Executions and workflow reads for debugging: yes. Update, publish, create: never.
- **Verify by cell values, never by a run log.** A log has undercounted a good run by half and read Succeeded on a run that wrote nothing usable. The target table is the proof.
- **Never spend without approval.** A run that calls a paid provider is quoted first, and never called small.

## This folder

Every file opens with a line saying what it teaches. `launching.md` is starting and rerunning machines; `debugging.md` is reading runs and chasing what went wrong.
