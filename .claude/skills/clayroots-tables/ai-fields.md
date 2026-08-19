Teaches: writing prompts for Airtable AI fields, the row-local no-web-search runtime, and turning a derivation decision into a field that stays correct on every future row.

# AI fields

An Airtable AI field is a model call that runs inside the base, once per row, reading only the cells the prompt names. It computes on every existing row, computes again automatically for every future row the builders land, and recomputes when a referenced cell changes. That makes it the standing mechanism for row-level derivation: no automation to run, no workflow to maintain. It is how a derivation decision gets translated into the base, the same way a relevance verdict becomes a formula and a segment becomes a view.

## The runtime, and why prompts written for other runtimes fail here

An AI field has no web search, no tools, and no context beyond the cells handed to it. Whatever the prompt asks for must be derivable from those cells plus what the model already knows. A research-style prompt (search strings, evidence rules, source discipline) has nothing to act on here; the model cannot look anything up, so it improvises, and improvised answers read confident and land wrong. Prompts for this runtime are written for a closed room.

The fit test is one question: could a sharp person with only this row on screen produce the answer? Yes: this runtime. No: it is research, a different route decided in the list craft, not a longer prompt here.

## The anatomy

- **Talk to a person, not a script.** The best prompts read like handing a task to a smart colleague: one plain ask, then the few rules that matter. Length is earned; a name transform is three lines, a personalization line that must hit a register earns its longer brief.
- **Name the input cells explicitly.** Every fact the model may use gets named by token, and the model gets nothing else.
- **One field, one job.** A prompt that derives two things produces two shapes across the batch. A second derivation is a second field.
- **Constrain the output shape in one breath.** The value only: no explanation, no quotes, no formatting the consumer will have to strip. The cell is the deliverable; anything around the value is damage.
- **Pick a side on uncertainty, explicitly.** With no research available the model cannot verify, so the prompt must say which way to lean and when to output nothing. An empty cell is a valid, filterable answer; a confident wrong value poisons the rows downstream. Which side to lean is a per-field judgment: a greeting-name field overshoots because a missed greeting costs more than a rare miss; a compliance-flavored field undershoots.

## Operational facts

- AI fields are created and edited in the Airtable UI only; the API neither creates them nor exposes their prompt. The field config is the prompt's only home, so **the approved prompt text is kept here, in this file, as the durable copy.**
- Each computed row spends Airtable AI credits, and edits to referenced cells recompute the row. Reference only the fields the answer needs.
- The field computes on the whole table when created: the test cost and the backfill in one pass. Read the results against known-correct rows before trusting the field anywhere else.
- Rewriting a column an aiText field references regenerates those cells at a credit each; know that before bulk-editing a referenced column.

## How to show it

A proposed field is presented before it is created, as labeled lines: **Field:** name. **Reads:** the exact cells referenced. **Leans:** which way on uncertainty, and why. **Cost:** rows to compute now. **Prompt:** the full text in a blockquote. Then wait; creation happens in the UI, and the approved text lands in this file.

## Canonical prompts

### Hebrew first name (the short shape), approved 2026-08-03

Renders the greeting word for Hebrew campaigns on Israeli tables. Overshoots by design: writes the name unless it is clearly not one an Israeli would carry.

> Write this contact's first name in Hebrew script, the way an Israeli writes it: Guy is גיא, Noa is נועה, Danny is דני.
>
> First name: {first_name}
> Full name: {Name}
>
> Output the Hebrew first name only. No niqqud, no quotes, no explanation. Names Israelis commonly carry get their Hebrew rendering, even international ones like Tom, Danny or Mike - when in doubt, write the name. Only if the name is clearly not one an Israeli would carry, leave the output empty.
