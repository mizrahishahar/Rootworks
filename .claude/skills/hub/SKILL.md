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

## This folder

Every file opens with a line saying what it teaches. `knowledge-base.md` is the one that matters most: the client knowledge base is how every session knows a client, and its quality is fulfillment quality.
