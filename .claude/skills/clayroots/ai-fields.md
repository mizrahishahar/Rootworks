Teaches: writing a prompt for an Airtable AI field, the row-local runtime with no web and no tools, and turning a derivation into a field that stays correct on every future row.

# AI fields

An AI field is a model call inside the base, once per row, reading only the cells the prompt names. It computes on every existing row, again on every future row, and recomputes when a referenced cell changes. It is the standing mechanism for row-level derivation: no machine to run.

## The runtime

No web search, no tools, no context beyond the cells handed to it. A research-style prompt has nothing to act on, so the model improvises, and improvised answers read confident and land wrong. Prompts here are written for a closed room.

The fit test: could a sharp person with only this row on screen produce the answer? Yes: this runtime. No: it is research, a different mechanism, not a longer prompt.

## The anatomy

- **Talk to a person.** One plain ask, then the few rules that matter. Length is earned.
- **Name the input cells by token.** The model gets nothing else.
- **One field, one job.** Two derivations produce two shapes across the batch; a second derivation is a second field.
- **Constrain the output in one breath.** The value only: no explanation, no quotes, no formatting. The cell is the deliverable.
- **Pick a side on uncertainty, explicitly.** The model cannot verify, so the prompt says which way to lean and when to output nothing. An empty cell is a valid, filterable answer; a confident wrong value poisons every row downstream. A greeting-name field overshoots (a missed greeting costs more than a rare miss); a compliance-flavored field undershoots.

## Operational facts

- AI fields are created and edited in the UI only; the API neither creates them nor exposes their prompt, so the approved prompt text is kept where the base's documentation lives.
- Each computed row spends credits, and edits to referenced cells recompute the row. Reference only what the answer needs. Rewriting a referenced column regenerates every cell.
- The field computes on the whole table when created: the test and the backfill in one pass. Read the results against known-correct rows before trusting it.

## How to show it

Labeled lines, before creation: **Field:** name. **Reads:** the exact cells. **Leans:** which way on uncertainty, and why. **Cost:** rows to compute now. **Prompt:** the full text in a blockquote. Then wait.

## Example

A greeting name in a second script, overshooting by design:

> Write this contact's first name in Hebrew script, the way an Israeli writes it: Guy is גיא, Noa is נועה, Danny is דני.
>
> First name: {first_name}
> Full name: {Name}
>
> Output the Hebrew first name only. No niqqud, no quotes, no explanation. Names Israelis commonly carry get their Hebrew rendering, even international ones like Tom, Danny or Mike; when in doubt, write the name. Only if the name is clearly not one an Israeli would carry, leave the output empty.

Every rule above is visible in it: one job, named cells, constrained output, an explicit lean.
