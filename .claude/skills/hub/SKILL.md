---
name: hub
type: skill
vertical: [infrastructure]
description: The Flowroots Hub, the application's one database. Reading and writing its records, the client knowledge base and its file types, modifying fields safely. Use for anything touching the Hub base, its tables, its fields, or a client's KB.
---

# The Hub

The one Airtable base (`appQG6dK0FIOhTxOl`) that is the database of the application: the client registry, the CRM, the client knowledge base, the run log. State is read from it live, never from a copy in a file.

**Structure is never described in prose, here or anywhere.** The full schema, every table, field, description and select option, is compiled from the live base into [[SCHEMA]] at the repo root by `scripts/hub-pull.js`. Read it there; regenerate it when the base changed. A field's own description in the schema is where its meaning lives.

## The laws

- **Resolve the client from the registry first.** The client's row carries every address: base, workspace, channels, scheduler, routine URLs. Nothing is ever hardcoded per client.
- **Verify by cell values, never by a success response.** Platforms return success while dropping what you sent; read the result back from the cell it landed in.
- **One owner per field.** Two writers on one field always diverge. Fix the writers before renaming a column, or it regenerates on the next run.
- **Durable stamps are formula fields.** An upsert writes its whole field set on create AND update, silently re-stamping first-occurrence facts. First-time facts live in `CREATED_TIME()` formulas, never in payload.
- **Select filters need the choice ID**, not the display string; a typo'd string returns zero rows silently. And `pageSize: 1` still returns `totalRecordCount`, the cheap exact count.

## Tasks

Work that outlives a session goes in the `Tasks` table. Any session may create one, and every session writes them the same way.

### Names

Verb first, imperative. Check, Create, Write, Call, Review, Fix, Ship, Send, Launch. The object second, specific enough to know what you are touching without opening the row. Two to six words.

The client never appears in the name, in any position. `Client` carries it, and a Client Name lookup renders it beside the title already.

The date never appears either. `Due` carries it.

No em dashes, no colons, no quotation marks.

English, always, whatever language the work itself happens in.

A task created from a flag is named for the fix, not for the symptom.

| Write this | Not this |
|---|---|
| Launch the bot campaign | Adelante — launch the "I built you a bot" campaign |
| Send the positive-reply script to Tamir | Adelante: send Tamir the script |
| Rewrite the opener | Piper AI copy needs work |
| Replace daveiodeploy.com | daveiodeploy.com has no replies |

### Steps

One line, one action, starting with a verb.

A step says where to go and what to flag. It carries no reasoning, no consequences, no explanation of why a number is the number. Numbers appear bare: "Flag any inbox with a bounce rate at 3% or above."

A step you cannot tell you have finished is not a step. Judgment words without a number ("healthy", "sane", "not sliding") are not steps.

Link where a link saves a search. `Steps` is rich text, so markdown links render.

Three to eight steps. More than eight is two tasks.

A Check task checks. The fixing is the task it creates, so the last step of a check is creating those tasks.

### Templates

A template is one task, carrying its checklist in `Steps`. It never fans out into several rows.

`Recurrence` and `Day` live on the template. `Day` holds weekday names for Weekly (`Mon, Wed, Fri`), a number for Monthly, nothing for Daily.

The daily `Spawn Recurring Tasks` automation creates a task for every template reading `Spawn Now` = 1. `Spawn Now` holds at 0 while any task from that template is still open, so a missed occurrence stays one overdue row and never doubles.

Editing a template does not touch tasks already created. The copy happens once, at spawn.

### From a meeting

A meeting produces action points, and action points become tasks. `From Meeting` links a task back to the call that produced it.

Read the meeting, then propose the tasks in chat as a table: Task, Area, Client, Due, Steps. Every proposed name and every proposed step already obeys the conventions above, so what the Operator reads is what would be written.

Wait for approval. The Operator approves, edits, cuts, or adds. Only then write, linking each row through `From Meeting`.

The preview always precedes the write.

## This folder

Every file opens with a line saying what it teaches. `knowledge-base.md` is the one that matters most: the client knowledge base is how every session knows a client, and its quality is fulfillment quality.
