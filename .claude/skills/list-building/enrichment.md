Teaches: the three ways to get a new variable onto rows, how each one is crafted, and what each one outputs.

# Enrichment

Getting a new variable onto the rows. A variable is worth deriving when it changes a copy line or defines a segment. Anything paid is quoted and approved first.

Three ways. Pick by where the answer lives.

## 1. From the source

The answer already exists in the data source (a firmographic field, a platform field, a rating). Get it by re-pull or append, or by naming it in the pull spec up front.

**Output:** the column names wanted and the source that carries them.

## 2. Airtable AI field

The answer can be produced from the row's own cells alone: render a name, classify a title, phrase a line. The field runs per row inside the base, automatically on every future row too.

**Craft the prompt like this:**
- One plain ask, like briefing a colleague. One field, one job.
- Name the input cells by token; the model sees nothing else. No web, no tools.
- Constrain the output: the value only, no quotes, no explanation.
- Say what to do when unsure: lean which way, and when to leave the cell empty.

**Output:** field name + the prompt text in a blockquote. (Creating the field and the full prompt craft: the tables skill, `ai-fields.md`, which also keeps every approved prompt as the durable copy.)

**Example, the Hebrew first name field (approved, live on the Israeli tables):**

> Write this contact's first name in Hebrew script, the way an Israeli writes it: Guy is גיא, Noa is נועה, Danny is דני.
>
> First name: {first_name}
> Full name: {Name}
>
> Output the Hebrew first name only. No niqqud, no quotes, no explanation. Names Israelis commonly carry get their Hebrew rendering, even international ones like Tom, Danny or Mike - when in doubt, write the name. Only if the name is clearly not one an Israeli would carry, leave the output empty.

Every rule above is visible in it: one job, named cells, constrained output, and an explicit lean (overshoot, because a missed greeting costs more than a rare miss).

## 3. DiscoGen research

The answer needs evidence from the web: funding, hiring, ICP fit, anything about the company or person beyond the row. Runs one prompt against the whole batch, async.

**Craft the prompt with all five parts, in order:**
1. One question, asked once.
2. The exact web searches to run, in sequence.
3. Scope rules: what counts, what doesn't, the edge cases.
4. What to answer when evidence is missing, separate from when evidence says no.
5. Last line: the exact allowed answers. This line is what makes the result categorical (filterable). Without it the field comes back free text.

**Settings:** context mode by need, cheapest that answers the question. Domains: `domain` < `profile` < `website`. Personas: `name_only` < `profile` < `company` < `full`.

**Output:** the prompt in a blockquote + target (domains or personas) + context mode + cost quote. Then wait for approval.

**Example, all five parts visible:**

> Does this company offer live chat or a support bot on its online store?
>
> Search in this order: 1) open the store's homepage and a product page and look for a chat widget. 2) search "{company} live chat". Stop at the first conclusive evidence.
>
> Count only a chat surface on their own store (widget, bot, or messenger embed). A contact form, a WhatsApp link in the footer, or chat on a separate corporate site does not count.
>
> If no evidence either way is found, answer unknown. Answer no only when the store was reachable and clearly carries no chat surface.
>
> Answer with exactly one of: bot, human_chat, none, unknown.

The last line is the categorical lock; without it this comes back as free text nobody can filter.

## How to show any of them

Labeled lines: **Field** (name, what it holds) · **Way** (source / AI field / DiscoGen) · **Used for** (the line or segment it unlocks) · **Cost** · then the prompt or column list. Nothing else.
