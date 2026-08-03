---
name: airtable-ai-prompter
description: Writes prompts for Airtable AI fields - the row-local, no-web-search runtime. Use whenever a ClayRoots table needs a field derived from the row's own cells (transform a name, classify a title, phrase a line), mostly on contacts. Knows when the job belongs to DiscoGen instead.
type: skill
vertical: [list-building]
---

# Airtable AI prompter

You write prompts for Airtable AI fields: a model call that runs inside the base, once per row, reading only the cells the prompt names. The field computes on every existing row, computes again automatically for every future row the builders land, and recomputes when a referenced cell changes. That makes it the standing mechanism for row-level derivation in ClayRoots - no automation to run, no workflow to maintain. You work through [[clayroots]].

## The runtime, and why prompts written for other runtimes fail here

An AI field has no web search, no tools, and no context beyond the cells you hand it. Whatever the prompt asks for must be derivable from those cells plus what the model already knows. A research-style prompt - search strings, evidence rules, source discipline - has nothing to act on here; the model cannot look anything up, so it improvises, and improvised answers read confident and land wrong. Prompts for this runtime are written for a closed room.

## This or DiscoGen

Both derive a new field. The split is where the answer lives:

- **The answer is outside the row** - funding, hiring, positioning, ICP fit, anything needing evidence about the company - that is research, and research is [[discogen-prompter]] through DiscoLike, with web search, batch and async. Domains are its home turf.
- **The answer is inside the row** - a name to render, a title to classify, a line to phrase from fields already present - that is this runtime. Contacts are its home turf, because contact-level derivations are almost always transforms of what the row already carries.

The test is one question: could a sharp person with only this row on screen produce the answer? Yes - AI field. No - DiscoGen, or the waterfall if it is a bulk cross-row transform.

## The anatomy

- **Talk to a person, not a script.** The best prompts read like handing a task to a smart colleague: one plain ask, then the few rules that matter. Length is earned - a name transform is three lines; a personalization line that must hit a register earns its longer brief.
- **Name the input cells explicitly.** The prompt references fields by token; every fact the model may use gets named, and the model gets nothing else.
- **One field, one job.** A prompt that derives two things produces two shapes across the batch. A second derivation is a second field.
- **Constrain the output shape in one breath.** The value only, no explanation, no quotes, no formatting the consumer will have to strip. The cell is the deliverable; anything around the value is damage.
- **Pick a side on uncertainty, explicitly.** With no research available, the model cannot verify - so the prompt must say which way to lean and when to output nothing. An empty cell is a valid, filterable answer; a confident wrong value poisons the rows downstream. Which side to lean is a per-field judgment: the Hebrew name field overshoots (write the name unless it is clearly not Israeli) because a missed greeting costs more than a rare miss; a compliance-flavored field would undershoot.

## Operational facts

- AI fields are created and edited in the Airtable UI only; the API neither creates them nor exposes their prompt. The prompt's only home is the field config - so the approved prompt text is kept here, in the skill, as the durable copy.
- Each computed row spends Airtable AI credits, and edits to referenced cells recompute the row. Reference only the fields the answer needs.
- The field computes on the whole table when created. On a large table that is the test cost and the backfill in one pass - read the results against known-correct rows before trusting the field anywhere else.

## Canonical prompts

### Hebrew first name (the short shape) - approved 2026-08-03

Renders the greeting word for Hebrew campaigns on Israeli tables. Overshoots by design: writes the name unless it is clearly not one an Israeli would carry.

> Write this contact's first name in Hebrew script, the way an Israeli writes it: Guy is גיא, Noa is נועה, Danny is דני.
>
> First name: {first_name}
> Full name: {Name}
>
> Output the Hebrew first name only. No niqqud, no quotes, no explanation. Names Israelis commonly carry get their Hebrew rendering, even international ones like Tom, Danny or Mike - when in doubt, write the name. Only if the name is clearly not one an Israeli would carry, leave the output empty.
