---
name: discogen-prompter
description: Writes DiscoGen research prompts that come back in one consistent, usable shape - the format anatomy, the search discipline, and when to drop to the raw API instead of the MCP tool. Use whenever a build needs a new field derived by research, on domains or on contacts, pre- or post-ClayRoots.
type: skill
vertical: [list-building]
---

# DiscoGen prompter

DiscoGen runs one prompt against many records, each in its own isolated context, and returns one answer shape for the entire batch - never a mix. A good prompt gets that shape right on the first run; a vague one comes back unusable, or worse, quietly wrong. You work through [[discolike]].

## The format is a function of your last sentence, not a parameter

`response_format` is auto-detected from how the query is phrased - there's no input field for "make this categorical." Two shapes seen in real use:

- **`free_text`** - an open descriptive question with no closing constraint ("What products or services does this company offer?").
- **`categorical`** - the query's own closing sentence names a closed set of allowed answers, and DiscoGen locks to exactly that set as `response_format.options`.

If a field needs to be filterable later, it must come back categorical - which means the prompt must end by stating the allowed answers explicitly. Leaving that sentence out, or leaving it open, is what produces a free-text field nobody can build a filter against.

## The anatomy of a prompt that comes back clean

Every reliable one carries all four parts, in order:

1. **One question, asked once.** No compound asks - a query that could answer two different things produces two different shapes across the batch, not one.
2. **A prescribed research order**, when web search is on - the exact search strings, in the exact sequence, so every record gets researched the same way instead of the model improvising per-row.
3. **Explicit scope rules** - what counts, what doesn't. Spell out the edge cases (contractors vs. employees, current vs. former, a team page that merely exists vs. one that names a role).
4. **The unknown-versus-negative rule.** Absence of evidence must never collapse into a false negative or a false zero - state explicitly what to answer when the evidence genuinely isn't there, separate from what to answer when the evidence says no.
5. **The closing answer-constraint sentence.** This is what actually produces the categorical lock - state the exact allowed values as the last line.

## Context mode is a real cost lever

Domains (`run-discogen`): `domain` (model's own knowledge + web search only) -> `profile` (firmographics) -> `website` (+ homepage text), each richer and pricier. Personas (`run-discogen-personas`): `name_only` -> `profile` -> `company` -> `full`. Don't default to the richest mode when the question doesn't need it - a yes/no on "do they offer a free trial" rarely needs the full contact + employer profile.

## validate-icp-fit is a different, simpler tool - know when each applies

`validate-icp-fit` takes a plain ICP description and DiscoLike writes its own internal validation prompt - you never see or control that prompt, and it isn't retrievable afterward. It's the right call for a blunt first-pass fit check. The moment real exclusion logic is needed (reject resellers, reject agencies, reject infra-only companies, treat an ambiguous signal as `partial` not `no`), hand-author the prompt through raw `run-discogen` instead, using the anatomy above - a one-paragraph ICP description can't carry that nuance through the auto-generated path.

## When to drop to the raw API instead of the MCP tool

The MCP tool covers `run-discogen` / `run-discogen-personas` / `get-discogen-status` / `cancel-discogen`. Reach for the raw API (`POST /v1/discogen/process` or `/process-personas`, `GET /status/{task_id}`, `DELETE /cancel/{task_id}`) when a job needs something the MCP surface doesn't expose directly - iterative enrichment via `previous_discogen_data` keyed by domain/persona, a specific `integration_id` or `search_provider_id` override, or `search_context_size` tuning beyond the tool's defaults. Same task lifecycle either way: async, poll status until `completed`, read `results` keyed by domain or persona ID plus the `response_format` that shaped them.

## Where this runs

Both pre-ClayRoots (qualifying or narrowing a raw domain list before a waterfall pulls it) and post-ClayRoots (deriving a new field on rows already landed in a build table) are real, both already in use. Same discipline either side - the only difference is whether the target is a saved query's domains or a table's rows.
